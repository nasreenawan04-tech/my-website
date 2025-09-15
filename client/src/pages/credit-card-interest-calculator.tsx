
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ToolHeroSection from '@/components/ToolHeroSection';
import ShareResultsButton from '@/components/ShareResultsButton';

interface CreditCardResult {
  monthsToPayoff: number;
  totalInterest: number;
  totalPayment: number;
  monthlyPayment: number;
  interestSavings?: number;
  timeSavings?: number;
}

const CreditCardInterestCalculator: React.FC = () => {
  const [balance, setBalance] = useState<string>('');
  const [apr, setApr] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'minimum' | 'fixed' | 'payoff'>('minimum');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [minimumPaymentPercent, setMinimumPaymentPercent] = useState<string>('2');
  const [payoffMonths, setPayoffMonths] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [results, setResults] = useState<CreditCardResult | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const formatCurrency = useCallback((amount: number) => {
    return `${selectedCurrency.symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }, [selectedCurrency]);

  const calculateCreditCardPayment = useCallback(() => {
    const principal = parseFloat(balance) || 0;
    const annualRate = parseFloat(apr) || 0;
    const monthlyRate = annualRate / 100 / 12;

    if (principal <= 0 || annualRate <= 0) {
      setResults(null);
      return;
    }

    let result: CreditCardResult;

    if (paymentType === 'minimum') {
      const minPercent = parseFloat(minimumPaymentPercent) || 2;
      const minimumPayment = Math.max(25, principal * (minPercent / 100));
      
      if (minimumPayment <= principal * monthlyRate) {
        // Minimum payment doesn't cover interest - debt will never be paid off
        setResults(null);
        return;
      }

      let remainingBalance = principal;
      let months = 0;
      let totalInterestPaid = 0;

      while (remainingBalance > 0.01 && months < 600) { // Cap at 50 years
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(minimumPayment - interestPayment, remainingBalance);
        
        totalInterestPaid += interestPayment;
        remainingBalance -= principalPayment;
        months++;
      }

      result = {
        monthsToPayoff: months,
        totalInterest: totalInterestPaid,
        totalPayment: principal + totalInterestPaid,
        monthlyPayment: minimumPayment
      };
    } else if (paymentType === 'fixed') {
      const payment = parseFloat(paymentAmount) || 0;
      
      if (payment <= principal * monthlyRate) {
        setResults(null);
        return;
      }

      let remainingBalance = principal;
      let months = 0;
      let totalInterestPaid = 0;

      while (remainingBalance > 0.01 && months < 600) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(payment - interestPayment, remainingBalance);
        
        totalInterestPaid += interestPayment;
        remainingBalance -= principalPayment;
        months++;
      }

      result = {
        monthsToPayoff: months,
        totalInterest: totalInterestPaid,
        totalPayment: principal + totalInterestPaid,
        monthlyPayment: payment
      };
    } else { // payoff in specific months
      const months = parseInt(payoffMonths) || 0;
      
      if (months <= 0) {
        setResults(null);
        return;
      }

      const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                           (Math.pow(1 + monthlyRate, months) - 1);
      const totalPayment = monthlyPayment * months;
      const totalInterest = totalPayment - principal;

      result = {
        monthsToPayoff: months,
        totalInterest: totalInterest,
        totalPayment: totalPayment,
        monthlyPayment: monthlyPayment
      };
    }

    setResults(result);
  }, [balance, apr, paymentType, paymentAmount, minimumPaymentPercent, payoffMonths]);

  const comparisonResults = useMemo(() => {
    if (!results || paymentType === 'minimum') return null;

    const principal = parseFloat(balance) || 0;
    const annualRate = parseFloat(apr) || 0;
    const monthlyRate = annualRate / 100 / 12;
    const minPercent = parseFloat(minimumPaymentPercent) || 2;
    const minimumPayment = Math.max(25, principal * (minPercent / 100));

    if (minimumPayment <= principal * monthlyRate) return null;

    let remainingBalance = principal;
    let months = 0;
    let totalInterestPaid = 0;

    while (remainingBalance > 0.01 && months < 600) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(minimumPayment - interestPayment, remainingBalance);
      
      totalInterestPaid += interestPayment;
      remainingBalance -= principalPayment;
      months++;
    }

    return {
      monthsToPayoff: months,
      totalInterest: totalInterestPaid,
      totalPayment: principal + totalInterestPaid,
      monthlyPayment: minimumPayment,
      interestSavings: totalInterestPaid - results.totalInterest,
      timeSavings: months - results.monthsToPayoff
    };
  }, [results, balance, apr, minimumPaymentPercent, paymentType]);

  const handleCalculate = () => {
    calculateCreditCardPayment();
    setShowComparison(paymentType !== 'minimum');
  };

  const formatMonths = (months: number) => {
    if (months < 12) {
      return `${Math.round(months)} month${Math.round(months) !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  const getShareableResults = () => {
    if (!results) return '';
    return `Credit Card Payoff Results:
Balance: ${formatCurrency(parseFloat(balance))}
APR: ${apr}%
Monthly Payment: ${formatCurrency(results.monthlyPayment)}
Time to Pay Off: ${formatMonths(results.monthsToPayoff)}
Total Interest: ${formatCurrency(results.totalInterest)}
Total Payment: ${formatCurrency(results.totalPayment)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ToolHeroSection
          title="Credit Card Interest Calculator"
          description="Calculate payoff time, total interest, and compare payment strategies for your credit card debt"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-credit-card"></i>
                  Credit Card Details
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Enter your credit card information and payment preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="balance" className="text-sm font-medium text-gray-700">
                      Current Balance
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {selectedCurrency.symbol}
                      </span>
                      <Input
                        id="balance"
                        type="number"
                        placeholder="5000"
                        value={balance}
                        onChange={(e) => setBalance(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apr" className="text-sm font-medium text-gray-700">
                      Annual Interest Rate (APR)
                    </Label>
                    <div className="relative">
                      <Input
                        id="apr"
                        type="number"
                        step="0.01"
                        placeholder="18.99"
                        value={apr}
                        onChange={(e) => setApr(e.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                    Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name} ({curr.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Payment Strategy</Label>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="minimum"
                        name="paymentType"
                        value="minimum"
                        checked={paymentType === 'minimum'}
                        onChange={(e) => setPaymentType(e.target.value as any)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="minimum" className="flex-1">Minimum Payment Only</Label>
                    </div>
                    {paymentType === 'minimum' && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="minPercent" className="text-sm text-gray-600">
                          Minimum Payment Percentage
                        </Label>
                        <div className="relative w-32">
                          <Input
                            id="minPercent"
                            type="number"
                            step="0.1"
                            value={minimumPaymentPercent}
                            onChange={(e) => setMinimumPaymentPercent(e.target.value)}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="fixed"
                        name="paymentType"
                        value="fixed"
                        checked={paymentType === 'fixed'}
                        onChange={(e) => setPaymentType(e.target.value as any)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="fixed" className="flex-1">Fixed Monthly Payment</Label>
                    </div>
                    {paymentType === 'fixed' && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="payment" className="text-sm text-gray-600">
                          Monthly Payment Amount
                        </Label>
                        <div className="relative w-40">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {selectedCurrency.symbol}
                          </span>
                          <Input
                            id="payment"
                            type="number"
                            placeholder="200"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="payoff"
                        name="paymentType"
                        value="payoff"
                        checked={paymentType === 'payoff'}
                        onChange={(e) => setPaymentType(e.target.value as any)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="payoff" className="flex-1">Pay Off in Specific Time</Label>
                    </div>
                    {paymentType === 'payoff' && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="months" className="text-sm text-gray-600">
                          Months to Pay Off
                        </Label>
                        <div className="w-32">
                          <Input
                            id="months"
                            type="number"
                            placeholder="24"
                            value={payoffMonths}
                            onChange={(e) => setPayoffMonths(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  <i className="fas fa-calculator mr-2"></i>
                  Calculate Credit Card Payoff
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {results ? (
              <>
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-chart-line"></i>
                      Payoff Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-gray-700">Monthly Payment</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatCurrency(results.monthlyPayment)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium text-gray-700">Time to Pay Off</span>
                        <span className="text-lg font-bold text-purple-600">
                          {formatMonths(results.monthsToPayoff)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-gray-700">Total Interest</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(results.totalInterest)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-gray-700">Total Payment</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(results.totalPayment)}
                        </span>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Interest vs Principal</span>
                          <span className="text-sm text-gray-600">
                            {((results.totalInterest / results.totalPayment) * 100).toFixed(1)}% interest
                          </span>
                        </div>
                        <Progress 
                          value={(results.totalInterest / results.totalPayment) * 100} 
                          className="h-3"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <ShareResultsButton results={getShareableResults()} />
                    </div>
                  </CardContent>
                </Card>

                {showComparison && comparisonResults && (
                  <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-2">
                        <i className="fas fa-balance-scale"></i>
                        Comparison vs Minimum
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(comparisonResults.interestSavings || 0)}
                          </div>
                          <div className="text-sm text-gray-600">Interest Savings</div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatMonths(comparisonResults.timeSavings || 0)}
                          </div>
                          <div className="text-sm text-gray-600">Time Savings</div>
                        </div>

                        <Alert>
                          <AlertDescription>
                            By paying more than the minimum, you'll save {formatCurrency(comparisonResults.interestSavings || 0)} in interest 
                            and pay off your debt {formatMonths(comparisonResults.timeSavings || 0)} earlier.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center space-y-4" data-testid="no-results">
                    <i className="fas fa-credit-card text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500">Enter credit card details to calculate payoff</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardInterestCalculator;
