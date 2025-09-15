import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Coins, GraduationCap, Home, Umbrella, Shield, Car, TrendingUp, Globe } from 'lucide-react';

interface SIPResult {
  maturityAmount: number;
  totalInvested: number;
  totalGains: number;
  monthlyInvestment: number;
  investmentPeriod: number;
  gainPercentage: number;
}

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [investmentPeriod, setInvestmentPeriod] = useState('');
  const [periodType, setPeriodType] = useState('years');
  const [expectedReturn, setExpectedReturn] = useState('12');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<SIPResult | null>(null);

  const calculateSIP = () => {
    const monthlyAmount = parseFloat(monthlyInvestment);
    const annualReturn = parseFloat(expectedReturn) / 100;
    const monthlyReturn = annualReturn / 12;
    const totalMonths = periodType === 'years' ? parseFloat(investmentPeriod) * 12 : parseFloat(investmentPeriod);

    if (monthlyAmount && totalMonths && monthlyReturn) {
      // SIP formula: M = P × [{(1 + i)^n - 1} / i] × (1 + i)
      // Where M = Maturity amount, P = Monthly investment, i = Monthly interest rate, n = Number of months
      const maturityAmount = monthlyAmount * 
        (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn * (1 + monthlyReturn);
      
      const totalInvested = monthlyAmount * totalMonths;
      const totalGains = maturityAmount - totalInvested;
      const gainPercentage = (totalGains / totalInvested) * 100;
      const investmentYears = periodType === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;

      setResult({
        maturityAmount: Math.round(maturityAmount * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalGains: Math.round(totalGains * 100) / 100,
        monthlyInvestment: monthlyAmount,
        investmentPeriod: investmentYears,
        gainPercentage: Math.round(gainPercentage * 100) / 100
      });
    } else if (monthlyAmount && totalMonths && monthlyReturn === 0) {
      // Handle 0% return case
      const totalInvested = monthlyAmount * totalMonths;
      const investmentYears = periodType === 'years' ? parseFloat(investmentPeriod) : parseFloat(investmentPeriod) / 12;

      setResult({
        maturityAmount: totalInvested,
        totalInvested: totalInvested,
        totalGains: 0,
        monthlyInvestment: monthlyAmount,
        investmentPeriod: investmentYears,
        gainPercentage: 0
      });
    }
  };

  const resetCalculator = () => {
    setMonthlyInvestment('');
    setInvestmentPeriod('');
    setPeriodType('years');
    setExpectedReturn('12');
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
        <title>SIP Calculator - Calculate Systematic Investment Plan Returns | ToolForge</title>
        <meta name="description" content="Free SIP calculator to calculate returns on Systematic Investment Plan. Plan your mutual fund investments and see how much wealth you can create." />
        <meta name="keywords" content="SIP calculator, systematic investment plan, mutual fund calculator, investment calculator, SIP returns" />
        <meta property="og:title" content="SIP Calculator - Calculate Systematic Investment Plan Returns | ToolForge" />
        <meta property="og:description" content="Free SIP calculator to calculate returns on Systematic Investment Plan. Plan your mutual fund investments and see how much wealth you can create." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/sip-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-sip-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coins className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                SIP Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate returns on your Systematic Investment Plan (SIP) and see how small investments can grow into wealth
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Investment Details</h2>
                      
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

                      {/* Monthly Investment */}
                      <div className="space-y-3">
                        <Label htmlFor="monthly-investment" className="text-sm font-medium text-gray-700">
                          Monthly Investment Amount
                        </Label>
                        <Input
                          id="monthly-investment"
                          type="number"
                          value={monthlyInvestment}
                          onChange={(e) => setMonthlyInvestment(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="Enter monthly investment"
                          min="1"
                          step="1"
                          data-testid="input-monthly-investment"
                        />
                      </div>

                      {/* Investment Period */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">Investment Period</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            value={investmentPeriod}
                            onChange={(e) => setInvestmentPeriod(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="Enter period"
                            min="1"
                            data-testid="input-investment-period"
                          />
                          <Select value={periodType} onValueChange={setPeriodType}>
                            <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-period-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                          placeholder="Enter expected return"
                          min="0"
                          max="50"
                          step="0.1"
                          data-testid="input-expected-return"
                        />
                        <p className="text-xs text-muted-foreground">
                          Typical equity mutual funds average 12-15% annually over long term
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateSIP}
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Investment Projection</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="sip-results">
                          {/* Maturity Amount */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Maturity Amount</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-maturity-amount">
                                {formatCurrency(result.maturityAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Investment Summary */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Investment</span>
                              <span className="font-semibold" data-testid="text-total-invested">
                                {formatCurrency(result.totalInvested)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Gains</span>
                              <span className="font-semibold text-green-600" data-testid="text-total-gains">
                                {formatCurrency(result.totalGains)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Investment Period</span>
                              <span className="font-semibold" data-testid="text-investment-years">
                                {result.investmentPeriod} years
                              </span>
                            </div>
                          </div>

                          {/* Gain Percentage */}
                          <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Total Return</span>
                              <span className="font-bold text-blue-600" data-testid="text-gain-percentage">
                                {result.gainPercentage}%
                              </span>
                            </div>
                          </div>

                          {/* Visual Breakdown */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Breakdown</h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div 
                                  className="h-4 bg-blue-500 rounded-l"
                                  style={{ width: `${(result.totalInvested / result.maturityAmount) * 100}%` }}
                                ></div>
                                <div 
                                  className="h-4 bg-green-500 rounded-r"
                                  style={{ width: `${(result.totalGains / result.maturityAmount) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                  Invested ({Math.round((result.totalInvested / result.maturityAmount) * 100)}%)
                                </span>
                                <span className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  Gains ({Math.round((result.totalGains / result.maturityAmount) * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Monthly Summary */}
                          <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Investment Summary</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Monthly Investment: <span className="font-semibold">{formatCurrency(result.monthlyInvestment)}</span></p>
                              <p>Investment Duration: <span className="font-semibold">{result.investmentPeriod} years</span></p>
                              <p>Your {formatCurrency(result.monthlyInvestment)} monthly investment will grow to {formatCurrency(result.maturityAmount)}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Coins className="w-10 h-10 text-gray-400 mb-4" />
                          <p className="text-gray-500">Enter SIP details to see investment projections</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default SIPCalculator;