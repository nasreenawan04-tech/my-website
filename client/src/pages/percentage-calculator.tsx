import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, Percent } from 'lucide-react';

interface PercentageResult {
  result: number;
  calculation: string;
  explanation: string;
}

const PercentageCalculator = () => {
  const [calculationType, setCalculationType] = useState('basic');
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [result, setResult] = useState<PercentageResult | null>(null);

  const calculatePercentage = () => {
    let calculationResult: PercentageResult | null = null;

    switch (calculationType) {
      case 'basic':
        // Calculate X% of Y
        const val = parseFloat(value);
        const perc = parseFloat(percentage);
        if (!isNaN(val) && !isNaN(perc)) {
          const res = (val * perc) / 100;
          calculationResult = {
            result: Math.round(res * 100) / 100,
            calculation: `${perc}% of ${val} = ${Math.round(res * 100) / 100}`,
            explanation: `To calculate ${perc}% of ${val}, multiply ${val} by ${perc} and divide by 100.`
          };
        }
        break;

      case 'change':
        // Calculate percentage change
        const original = parseFloat(originalValue);
        const newVal = parseFloat(newValue);
        if (!isNaN(original) && !isNaN(newVal) && original !== 0) {
          const change = ((newVal - original) / original) * 100;
          const absChange = Math.abs(newVal - original);
          calculationResult = {
            result: Math.round(change * 100) / 100,
            calculation: `${change >= 0 ? '+' : ''}${Math.round(change * 100) / 100}%`,
            explanation: `Change from ${original} to ${newVal} is ${change >= 0 ? 'an increase' : 'a decrease'} of ${Math.abs(Math.round(change * 100) / 100)}% (${absChange} units).`
          };
        }
        break;

      case 'ratio':
        // Calculate what percentage X is of Y
        const numerator = parseFloat(value);
        const denominator = parseFloat(originalValue);
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          const ratio = (numerator / denominator) * 100;
          calculationResult = {
            result: Math.round(ratio * 100) / 100,
            calculation: `${numerator} is ${Math.round(ratio * 100) / 100}% of ${denominator}`,
            explanation: `To find what percentage ${numerator} is of ${denominator}, divide ${numerator} by ${denominator} and multiply by 100.`
          };
        }
        break;

      case 'increase':
        // Increase number by percentage
        const baseVal = parseFloat(value);
        const increasePerc = parseFloat(percentage);
        if (!isNaN(baseVal) && !isNaN(increasePerc)) {
          const increase = (baseVal * increasePerc) / 100;
          const finalVal = baseVal + increase;
          calculationResult = {
            result: Math.round(finalVal * 100) / 100,
            calculation: `${baseVal} + ${increasePerc}% = ${Math.round(finalVal * 100) / 100}`,
            explanation: `Increasing ${baseVal} by ${increasePerc}% adds ${Math.round(increase * 100) / 100} to get ${Math.round(finalVal * 100) / 100}.`
          };
        }
        break;

      case 'decrease':
        // Decrease number by percentage
        const baseValue = parseFloat(value);
        const decreasePerc = parseFloat(percentage);
        if (!isNaN(baseValue) && !isNaN(decreasePerc)) {
          const decrease = (baseValue * decreasePerc) / 100;
          const finalValue = baseValue - decrease;
          calculationResult = {
            result: Math.round(finalValue * 100) / 100,
            calculation: `${baseValue} - ${decreasePerc}% = ${Math.round(finalValue * 100) / 100}`,
            explanation: `Decreasing ${baseValue} by ${decreasePerc}% removes ${Math.round(decrease * 100) / 100} to get ${Math.round(finalValue * 100) / 100}.`
          };
        }
        break;
    }

    setResult(calculationResult);
  };

  const resetCalculator = () => {
    setValue('');
    setPercentage('');
    setOriginalValue('');
    setNewValue('');
    setResult(null);
  };

  const getInputFields = () => {
    switch (calculationType) {
      case 'basic':
        return (
          <>
            <div className="space-y-3">
              <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">
                Percentage (%)
              </Label>
              <Input
                id="percentage"
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="25"
                min="0"
                step="0.01"
                data-testid="input-percentage"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                Of Value
              </Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="200"
                min="0"
                step="0.01"
                data-testid="input-value"
              />
            </div>
          </>
        );

      case 'change':
        return (
          <>
            <div className="space-y-3">
              <Label htmlFor="original-value" className="text-sm font-medium text-gray-700">
                Original Value
              </Label>
              <Input
                id="original-value"
                type="number"
                value={originalValue}
                onChange={(e) => setOriginalValue(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="100"
                step="0.01"
                data-testid="input-original-value"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="new-value" className="text-sm font-medium text-gray-700">
                New Value
              </Label>
              <Input
                id="new-value"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="120"
                step="0.01"
                data-testid="input-new-value"
              />
            </div>
          </>
        );

      case 'ratio':
        return (
          <>
            <div className="space-y-3">
              <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                Value
              </Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="50"
                step="0.01"
                data-testid="input-value"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="original-value" className="text-sm font-medium text-gray-700">
                Is What % Of
              </Label>
              <Input
                id="original-value"
                type="number"
                value={originalValue}
                onChange={(e) => setOriginalValue(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="200"
                step="0.01"
                data-testid="input-total-value"
              />
            </div>
          </>
        );

      case 'increase':
      case 'decrease':
        return (
          <>
            <div className="space-y-3">
              <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                Base Value
              </Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="100"
                step="0.01"
                data-testid="input-base-value"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">
                {calculationType === 'increase' ? 'Increase' : 'Decrease'} By (%)
              </Label>
              <Input
                id="percentage"
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="h-12 text-base border-gray-200 rounded-lg"
                placeholder="20"
                min="0"
                step="0.01"
                data-testid="input-change-percentage"
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Percentage Calculator - Calculate Percentages, Changes & More | ToolsHub</title>
        <meta name="description" content="Free percentage calculator for calculating percentages, percentage changes, increases, decreases, and ratios. Perfect for students, professionals, and everyday calculations worldwide." />
        <meta name="keywords" content="percentage calculator, percent calculator, percentage change calculator, calculate percentage" />
        <meta property="og:title" content="Percentage Calculator - Calculate Percentages, Changes & More | ToolsHub" />
        <meta property="og:description" content="Free percentage calculator for calculating percentages, percentage changes, increases, decreases, and ratios. Perfect for students, professionals, and everyday calculations worldwide." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/percentage-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-percentage-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="gradient-hero text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-percentage text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Percentage Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate percentages, percentage changes, increases, decreases, and ratios with detailed explanations
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Calculation Type</h2>
                      
                      {/* Calculation Type Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Choose Calculation Type
                        </Label>
                        <Select value={calculationType} onValueChange={setCalculationType}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-calculation-type">
                            <SelectValue placeholder="Select calculation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">What is X% of Y?</SelectItem>
                            <SelectItem value="ratio">X is what % of Y?</SelectItem>
                            <SelectItem value="change">% Change (Old vs New)</SelectItem>
                            <SelectItem value="increase">Increase by %</SelectItem>
                            <SelectItem value="decrease">Decrease by %</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dynamic Input Fields */}
                      {getInputFields()}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculatePercentage}
                          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="px-8 h-12 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Results</h2>
                      
                      {result ? (
                        <div className="space-y-6" data-testid="results">
                          {/* Main Result */}
                          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="p-6 text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-2">
                                {typeof result.result === 'number' ? result.result.toLocaleString() : result.calculation}
                              </div>
                              <div className="text-sm text-blue-700">
                                {result.calculation}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Explanation */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-blue-600" />
                                Explanation
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 leading-relaxed">
                                {result.explanation}
                              </p>
                            </CardContent>
                          </Card>

                          {/* Quick Reference */}
                          <Card className="border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg text-gray-900">Quick Reference</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div>• Basic: (Percentage ÷ 100) × Value</div>
                                <div>• Change: ((New - Old) ÷ Old) × 100</div>
                                <div>• Ratio: (Part ÷ Whole) × 100</div>
                                <div>• Increase: Original + (Original × %)÷100</div>
                                <div>• Decrease: Original - (Original × %)÷100</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-12" data-testid="no-results">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calculator className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500">
                            Enter values and click calculate to see percentage results
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Comprehensive Educational Content */}
          <div className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* What is a Percentage Calculator Section */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  What is a Percentage Calculator?
                </h2>
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    A <strong>percentage calculator</strong> is an essential mathematical tool that simplifies complex percentage 
                    calculations for students, professionals, and everyday users worldwide. Our advanced online percentage 
                    calculator provides instant, accurate results for various percentage-related computations including basic 
                    percentage calculations, percentage changes, increases, decreases, and ratio analysis.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Whether you're calculating discounts while shopping, analyzing business growth rates, determining test 
                    scores, or working on financial projections, this free percentage calculator eliminates the guesswork 
                    and provides detailed step-by-step explanations to help you understand the mathematical concepts behind 
                    each calculation.
                  </p>
                </div>
              </section>

              {/* How to Use Section */}
              <section className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use the Calculator</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Select your calculation type from the dropdown menu</li>
                      <li>• Enter the required values in the input fields</li>
                      <li>• Click Calculate to get instant, accurate results</li>
                      <li>• View detailed explanations and mathematical formulas</li>
                      <li>• Use Reset to clear all fields and start a new calculation</li>
                      <li>• Copy results or explanations for future reference</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculation Types Available</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• <strong>Basic Percentage:</strong> Calculate X% of any number</li>
                      <li>• <strong>Percentage Ratio:</strong> Find what percentage one number is of another</li>
                      <li>• <strong>Percentage Change:</strong> Calculate change between two values</li>
                      <li>• <strong>Percentage Increase:</strong> Add a percentage to a base number</li>
                      <li>• <strong>Percentage Decrease:</strong> Subtract a percentage from a number</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Common Use Cases */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Common Use Cases for Percentage Calculations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      <i className="fas fa-shopping-cart mr-2 text-blue-600"></i>
                      Shopping & Discounts
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Calculate sale prices and discounts</li>
                      <li>• Compare savings across different offers</li>
                      <li>• Determine final prices after tax</li>
                      <li>• Calculate cashback percentages</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      <i className="fas fa-chart-line mr-2 text-green-600"></i>
                      Business & Finance
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Analyze growth rates and trends</li>
                      <li>• Calculate profit margins</li>
                      <li>• Determine interest rates</li>
                      <li>• Assess investment returns</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      <i className="fas fa-graduation-cap mr-2 text-purple-600"></i>
                      Education & Grades
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Calculate test scores and grades</li>
                      <li>• Determine attendance percentages</li>
                      <li>• Analyze academic performance</li>
                      <li>• Convert between different grading systems</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Mathematical Formulas */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Percentage Calculation Formulas
                </h2>
                <div className="bg-gray-50 rounded-xl p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Formulas</h3>
                      <div className="space-y-4 text-gray-700">
                        <div className="bg-white p-4 rounded-lg border">
                          <strong>Basic Percentage:</strong><br />
                          Result = (Percentage ÷ 100) × Value
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <strong>Percentage of Total:</strong><br />
                          Percentage = (Part ÷ Whole) × 100
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <strong>Percentage Change:</strong><br />
                          Change% = ((New - Old) ÷ Old) × 100
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Formulas</h3>
                      <div className="space-y-4 text-gray-700">
                        <div className="bg-white p-4 rounded-lg border">
                          <strong>Percentage Increase:</strong><br />
                          Result = Original + (Original × %÷100)
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <strong>Percentage Decrease:</strong><br />
                          Result = Original - (Original × %÷100)
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <strong>Percentage Error:</strong><br />
                          Error% = |Actual - Expected| ÷ Expected × 100
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tips and Best Practices */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Tips for Accurate Percentage Calculations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li>• Always double-check your input values for accuracy</li>
                      <li>• Understand the context of your calculation</li>
                      <li>• Round results appropriately for your use case</li>
                      <li>• Use the correct formula for your specific need</li>
                      <li>• Verify results with manual calculations when possible</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Mistakes to Avoid</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li>• Confusing percentage increase with percentage of total</li>
                      <li>• Using the wrong base value in calculations</li>
                      <li>• Forgetting to convert percentages to decimals</li>
                      <li>• Mixing up positive and negative percentage changes</li>
                      <li>• Not considering the order of operations in complex calculations</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Related Tools Section */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Related Financial & Math Tools
                </h2>
                <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
                  Enhance your calculations with our comprehensive suite of financial and mathematical tools designed for students, professionals, and businesses worldwide.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <i className="fas fa-calculator text-blue-500 mr-2"></i>
                      Discount & Sale Calculators
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• <a href="/tools/discount-calculator" className="text-blue-600 hover:text-blue-700">Discount Calculator</a> - Calculate sale prices and savings</li>
                      <li>• <a href="/tools/tip-calculator" className="text-blue-600 hover:text-blue-700">Tip Calculator</a> - Calculate tips and split bills</li>
                      <li>• <a href="/tools/paypal-fee-calculator" className="text-blue-600 hover:text-blue-700">PayPal Fee Calculator</a> - Calculate transaction fees</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <i className="fas fa-chart-line text-green-500 mr-2"></i>
                      Investment & Growth Tools
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• <a href="/tools/compound-interest-calculator" className="text-blue-600 hover:text-blue-700">Compound Interest Calculator</a> - Calculate compound growth</li>
                      <li>• <a href="/tools/simple-interest-calculator" className="text-blue-600 hover:text-blue-700">Simple Interest Calculator</a> - Basic interest calculations</li>
                      <li>• <a href="/tools/investment-return-calculator" className="text-blue-600 hover:text-blue-700">Investment Return Calculator</a> - ROI analysis</li>
                      <li>• <a href="/tools/roi-calculator" className="text-blue-600 hover:text-blue-700">ROI Calculator</a> - Return on investment analysis</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <i className="fas fa-home text-purple-500 mr-2"></i>
                      Loan & Finance Calculators
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• <a href="/tools/loan-calculator" className="text-blue-600 hover:text-blue-700">Loan Calculator</a> - General loan calculations</li>
                      <li>• <a href="/tools/mortgage-calculator" className="text-blue-600 hover:text-blue-700">Mortgage Calculator</a> - Home loan payments</li>
                      <li>• <a href="/tools/emi-calculator" className="text-blue-600 hover:text-blue-700">EMI Calculator</a> - Monthly installment calculator</li>
                      <li>• <a href="/tools/credit-card-interest-calculator" className="text-blue-600 hover:text-blue-700">Credit Card Interest Calculator</a> - Credit card debt analysis</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <i className="fas fa-piggy-bank text-orange-500 mr-2"></i>
                      Savings & Planning Tools
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• <a href="/tools/savings-goal-calculator" className="text-blue-600 hover:text-blue-700">Savings Goal Calculator</a> - Plan your savings</li>
                      <li>• <a href="/tools/retirement-calculator" className="text-blue-600 hover:text-blue-700">Retirement Calculator</a> - Retirement planning</li>
                      <li>• <a href="/tools/sip-calculator" className="text-blue-600 hover:text-blue-700">SIP Calculator</a> - Systematic investment plans</li>
                      <li>• <a href="/tools/debt-payoff-calculator" className="text-blue-600 hover:text-blue-700">Debt Payoff Calculator</a> - Debt elimination strategy</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <i className="fas fa-dollar-sign text-teal-500 mr-2"></i>
                      Business & Professional Tools
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• <a href="/tools/break-even-calculator" className="text-blue-600 hover:text-blue-700">Break-Even Calculator</a> - Business break-even analysis</li>
                      <li>• <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-700">Business Loan Calculator</a> - Commercial loan planning</li>
                      <li>• <a href="/tools/salary-to-hourly-calculator" className="text-blue-600 hover:text-blue-700">Salary to Hourly Calculator</a> - Convert salary to hourly rate</li>
                      <li>• <a href="/tools/stock-profit-calculator" className="text-blue-600 hover:text-blue-700">Stock Profit Calculator</a> - Trading profit analysis</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      <i className="fas fa-exchange-alt text-red-500 mr-2"></i>
                      Currency & Conversion Tools
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      <li>• <a href="/tools/currency-converter" className="text-blue-600 hover:text-blue-700">Currency Converter</a> - Real-time exchange rates</li>
                      <li>• <a href="/tools/cryptocurrency-converter" className="text-blue-600 hover:text-blue-700">Cryptocurrency Converter</a> - Crypto price conversion</li>
                      <li>• <a href="/tools/inflation-calculator" className="text-blue-600 hover:text-blue-700">Inflation Calculator</a> - Inflation impact analysis</li>
                      <li>• <a href="/tools/net-worth-calculator" className="text-blue-600 hover:text-blue-700">Net Worth Calculator</a> - Financial net worth tracking</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      What's the difference between percentage increase and percentage of total?
                    </h3>
                    <p className="text-gray-600">
                      Percentage increase adds a percentage to an original value (e.g., increasing $100 by 20% gives $120), 
                      while percentage of total calculates what portion one number represents of another (e.g., 20 out of 100 is 20%).
                    </p>
                  </div>
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      How do I calculate compound percentage changes?
                    </h3>
                    <p className="text-gray-600">
                      For compound changes, apply each percentage change sequentially rather than adding them. For example, 
                      a 10% increase followed by a 5% increase equals 15.5% total increase, not 15%.
                    </p>
                  </div>
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Can I use this calculator for negative percentages?
                    </h3>
                    <p className="text-gray-600">
                      Yes, our calculator handles negative values and percentages. Negative percentage changes indicate 
                      decreases, while negative base values are processed according to standard mathematical rules.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Is this percentage calculator accurate for large numbers?
                    </h3>
                    <p className="text-gray-600">
                      Our calculator maintains high precision for both small and large numbers, automatically formatting 
                      results with appropriate decimal places and using scientific notation when necessary for very large values.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PercentageCalculator;