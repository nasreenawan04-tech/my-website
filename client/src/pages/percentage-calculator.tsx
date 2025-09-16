
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PercentageResult {
  result: number;
  calculation: string;
  explanation: string;
  formula: string;
}

export default function PercentageCalculator() {
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
            explanation: `To calculate ${perc}% of ${val}, multiply ${val} by ${perc} and divide by 100.`,
            formula: `(${val} × ${perc}) ÷ 100 = ${Math.round(res * 100) / 100}`
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
            explanation: `Change from ${original} to ${newVal} is ${change >= 0 ? 'an increase' : 'a decrease'} of ${Math.abs(Math.round(change * 100) / 100)}% (${absChange} units).`,
            formula: `((${newVal} - ${original}) ÷ ${original}) × 100 = ${Math.round(change * 100) / 100}%`
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
            explanation: `To find what percentage ${numerator} is of ${denominator}, divide ${numerator} by ${denominator} and multiply by 100.`,
            formula: `(${numerator} ÷ ${denominator}) × 100 = ${Math.round(ratio * 100) / 100}%`
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
            explanation: `Increasing ${baseVal} by ${increasePerc}% adds ${Math.round(increase * 100) / 100} to get ${Math.round(finalVal * 100) / 100}.`,
            formula: `${baseVal} + (${baseVal} × ${increasePerc}%) = ${Math.round(finalVal * 100) / 100}`
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
            explanation: `Decreasing ${baseValue} by ${decreasePerc}% removes ${Math.round(decrease * 100) / 100} to get ${Math.round(finalValue * 100) / 100}.`,
            formula: `${baseValue} - (${baseValue} × ${decreasePerc}%) = ${Math.round(finalValue * 100) / 100}`
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
              <Label htmlFor="percentage" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Percentage (%)
              </Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  placeholder="25"
                  min="0"
                  step="0.01"
                  data-testid="input-percentage"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Of Value
              </Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
              <Label htmlFor="original-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Original Value
              </Label>
              <Input
                id="original-value"
                type="number"
                value={originalValue}
                onChange={(e) => setOriginalValue(e.target.value)}
                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                placeholder="100"
                step="0.01"
                data-testid="input-original-value"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="new-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                New Value
              </Label>
              <Input
                id="new-value"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
              <Label htmlFor="value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Value
              </Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                placeholder="50"
                step="0.01"
                data-testid="input-value"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="original-value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Is What % Of
              </Label>
              <Input
                id="original-value"
                type="number"
                value={originalValue}
                onChange={(e) => setOriginalValue(e.target.value)}
                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
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
              <Label htmlFor="value" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                Base Value
              </Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                placeholder="100"
                step="0.01"
                data-testid="input-base-value"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="percentage" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {calculationType === 'increase' ? 'Increase' : 'Decrease'} By (%)
              </Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="h-14 pr-8 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  placeholder="20"
                  min="0"
                  step="0.01"
                  data-testid="input-change-percentage"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">%</span>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Percentage Calculator - Calculate Percentages, Changes & Ratios | DapsiWow</title>
        <meta name="description" content="Free percentage calculator for calculating percentages, percentage changes, increases, decreases, and ratios. Perfect for students, professionals, and business calculations with step-by-step solutions." />
        <meta name="keywords" content="percentage calculator, percent calculator, percentage change calculator, calculate percentage, percentage formula, percentage increase calculator, percentage decrease calculator, ratio calculator, math calculator, business calculator" />
        <meta property="og:title" content="Percentage Calculator - Calculate Percentages, Changes & Ratios | DapsiWow" />
        <meta property="og:description" content="Free percentage calculator for calculating percentages, percentage changes, increases, decreases, and ratios. Perfect for students, professionals, and business calculations with step-by-step solutions." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/percentage-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Percentage Calculator",
            "description": "Free online percentage calculator for calculating percentages, percentage changes, increases, decreases, and ratios. Features step-by-step solutions and detailed explanations for educational and professional use.",
            "url": "https://dapsiwow.com/tools/percentage-calculator",
            "applicationCategory": "CalculatorApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Basic percentage calculations",
              "Percentage change calculations",
              "Percentage increase and decrease",
              "Ratio to percentage conversion",
              "Step-by-step solutions",
              "Educational explanations"
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Professional Percentage Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Percentage
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate percentages, changes, increases, decreases, and ratios with detailed step-by-step solutions
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Percentage Configuration</h2>
                    <p className="text-gray-600">Choose calculation type and enter values to get accurate percentage results</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Calculation Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Calculation Type
                      </Label>
                      <Select value={calculationType} onValueChange={setCalculationType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-calculation-type">
                          <SelectValue placeholder="Select calculation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">What is X% of Y?</SelectItem>
                          <SelectItem value="ratio">X is what % of Y?</SelectItem>
                          <SelectItem value="change">Percentage Change</SelectItem>
                          <SelectItem value="increase">Increase by %</SelectItem>
                          <SelectItem value="decrease">Decrease by %</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dynamic Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getInputFields()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculatePercentage}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Percentage
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="percentage-results">
                      {/* Main Result */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Result</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="text-result">
                          {typeof result.result === 'number' ? result.result.toLocaleString() : result.calculation}
                        </div>
                        <div className="text-sm text-blue-700 mt-2">
                          {result.calculation}
                        </div>
                      </div>

                      {/* Formula */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Formula</div>
                        <div className="font-mono text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {result.formula}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Explanation</div>
                        <p className="text-gray-700 leading-relaxed">
                          {result.explanation}
                        </p>
                      </div>

                      {/* Quick Reference */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                        <h4 className="font-bold text-indigo-800 mb-4 text-lg">Formula Guide</h4>
                        <div className="space-y-2 text-sm text-indigo-700">
                          <div>• Basic: (Value × Percentage) ÷ 100</div>
                          <div>• Change: ((New - Old) ÷ Old) × 100</div>
                          <div>• Ratio: (Part ÷ Whole) × 100</div>
                          <div>• Increase: Original + (Original × %) ÷ 100</div>
                          <div>• Decrease: Original - (Original × %) ÷ 100</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-lg">Select calculation type and enter values to see percentage results</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Percentage Calculator?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A percentage calculator is an essential mathematical tool that helps you perform various percentage-related 
                    calculations quickly and accurately. Whether you're calculating discounts, tax rates, grade scores, business 
                    metrics, or financial changes, this calculator provides instant results with detailed explanations.
                  </p>
                  <p>
                    Our advanced percentage calculator supports five different calculation types: basic percentage calculations, 
                    percentage changes, percentage increases, percentage decreases, and ratio-to-percentage conversions. Each 
                    calculation includes step-by-step formulas and clear explanations for educational purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use the Percentage Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Using our percentage calculator is simple and intuitive. First, select the type of calculation you need 
                    from the dropdown menu. Then, enter the required values in the input fields based on your selected 
                    calculation type.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Choose your calculation type (basic, change, ratio, increase, or decrease)</li>
                    <li>Enter the required numerical values in the input fields</li>
                    <li>Click "Calculate Percentage" to get instant results</li>
                    <li>Review the formula, calculation steps, and explanation</li>
                    <li>Use "Reset" to clear all fields and start a new calculation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Percentage Calculation Types</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Basic Percentage</h4>
                    <p className="text-sm">Calculate what percentage of a number equals another number (e.g., 25% of 200 = 50)</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Percentage Change</h4>
                    <p className="text-sm">Find the percentage increase or decrease between two values</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Percentage Ratio</h4>
                    <p className="text-sm">Determine what percentage one number represents of another number</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Increase/Decrease</h4>
                    <p className="text-sm">Add or subtract a percentage from a base number to get the final value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Percentage Applications</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Business & Finance</h4>
                    <p className="text-sm text-blue-700">Calculate profit margins, interest rates, tax amounts, discounts, and commission rates</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Education & Academics</h4>
                    <p className="text-sm text-green-700">Grade calculations, test scores, improvement percentages, and statistical analysis</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Shopping & Sales</h4>
                    <p className="text-sm text-orange-700">Discount calculations, price comparisons, sale percentages, and tip calculations</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Data Analysis</h4>
                    <p className="text-sm text-purple-700">Survey results, market research, growth rates, and performance metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Percentage Formulas Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Complete Guide to Percentage Formulas</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Basic Percentage Formula</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <code className="text-lg font-mono">Percentage = (Part ÷ Whole) × 100</code>
                      </div>
                      <p className="text-gray-600 text-sm">
                        This fundamental formula helps you find what percentage one number represents of another. 
                        For example, if you scored 85 out of 100 on a test, your percentage would be (85 ÷ 100) × 100 = 85%.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Percentage of a Number</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <code className="text-lg font-mono">Result = (Percentage ÷ 100) × Number</code>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Use this formula to calculate a specific percentage of any number. For instance, 
                        to find 15% of 200, calculate (15 ÷ 100) × 200 = 30.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Percentage Change Formula</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <code className="text-lg font-mono">% Change = ((New - Old) ÷ Old) × 100</code>
                      </div>
                      <p className="text-gray-600 text-sm">
                        This formula calculates the percentage increase or decrease between two values. 
                        Positive results indicate increases, while negative results show decreases.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Percentage Increase</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <code className="text-lg font-mono">New Value = Original + (Original × %) ÷ 100</code>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Calculate the final value after applying a percentage increase. For example, 
                        increasing 100 by 20% gives 100 + (100 × 20) ÷ 100 = 120.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Percentage Decrease</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <code className="text-lg font-mono">New Value = Original - (Original × %) ÷ 100</code>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Calculate the final value after applying a percentage decrease. For instance, 
                        decreasing 100 by 25% gives 100 - (100 × 25) ÷ 100 = 75.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Finding the Original Number</h4>
                      <div className="bg-gray-50 p-4 rounded-lg mb-3">
                        <code className="text-lg font-mono">Original = (Final Value ÷ (1 ± %)) × 100</code>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Use this reverse formula when you know the final value and percentage change 
                        but need to find the original number.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Business Applications</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Percentage calculations are crucial in business operations for analyzing performance, 
                      calculating profits, and making data-driven decisions.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Key Business Uses:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Profit margin calculations</li>
                        <li>Sales growth analysis</li>
                        <li>Market share determination</li>
                        <li>Employee performance metrics</li>
                        <li>Budget variance analysis</li>
                        <li>Cost reduction tracking</li>
                        <li>Revenue percentage changes</li>
                        <li>Commission calculations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Educational Uses</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Students, teachers, and educational professionals rely on percentage calculations 
                      for grading, assessment, and academic analysis.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Academic Applications:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Grade percentage calculations</li>
                        <li>Test score analysis</li>
                        <li>Attendance rate tracking</li>
                        <li>Improvement measurements</li>
                        <li>Class average computations</li>
                        <li>Scholarship eligibility</li>
                        <li>Statistical research</li>
                        <li>Data interpretation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Finance</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Personal financial planning often involves percentage calculations for budgeting, 
                      investments, and expense management.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">Financial Applications:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Interest rate calculations</li>
                        <li>Investment return analysis</li>
                        <li>Tax percentage computations</li>
                        <li>Savings goal tracking</li>
                        <li>Debt reduction progress</li>
                        <li>Budget allocation planning</li>
                        <li>Inflation impact analysis</li>
                        <li>Retirement planning</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips and Best Practices */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tips for Accurate Percentage Calculations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Double-Check Your Work</h4>
                      <p className="text-green-700 text-sm">Always verify your calculations by working backwards or using an alternative method to ensure accuracy.</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Understand the Context</h4>
                      <p className="text-blue-700 text-sm">Make sure you understand what the percentage represents in your specific situation before calculating.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Use Appropriate Precision</h4>
                      <p className="text-purple-700 text-sm">Round your results to an appropriate number of decimal places based on the context of your calculation.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Watch for Common Mistakes</h4>
                      <p className="text-orange-700 text-sm">Be careful with percentage points vs. percentages, and ensure you're using the correct base value.</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Consider Order of Operations</h4>
                      <p className="text-red-700 text-sm">When dealing with multiple percentage calculations, be mindful of the order in which you apply them.</p>
                    </div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">Practice Mental Math</h4>
                      <p className="text-indigo-700 text-sm">Learn shortcuts for common percentages (10%, 25%, 50%) to improve your calculation speed.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions about Percentage Calculations</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the difference between percentage and percentage points?</h4>
                      <p className="text-gray-600 text-sm">Percentage points refer to the arithmetic difference between two percentages. For example, if something increases from 20% to 25%, that's a 5 percentage point increase, but a 25% relative increase.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I calculate percentage of percentage?</h4>
                      <p className="text-gray-600 text-sm">To find a percentage of a percentage, convert both to decimals, multiply them, then convert back to a percentage. For example, 50% of 80% = 0.5 × 0.8 = 0.4 = 40%.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can percentages exceed 100%?</h4>
                      <p className="text-gray-600 text-sm">Yes, percentages can exceed 100% when the part is larger than the whole, or when measuring increases. For example, a 150% increase means the new value is 2.5 times the original.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I convert fractions to percentages?</h4>
                      <p className="text-gray-600 text-sm">Divide the numerator by the denominator, then multiply by 100. For example, 3/4 = 0.75 × 100 = 75%.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What is the fastest way to calculate 10% of a number?</h4>
                      <p className="text-gray-600 text-sm">Simply move the decimal point one place to the left. For example, 10% of 250 is 25.0, or just 25.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I handle negative percentages?</h4>
                      <p className="text-gray-600 text-sm">Negative percentages typically indicate decreases or losses. The calculation process remains the same, but the result shows a reduction rather than an increase.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the relationship between ratios and percentages?</h4>
                      <p className="text-gray-600 text-sm">Ratios can be converted to percentages by expressing them as fractions and then multiplying by 100. A 3:1 ratio equals 75% (3/4 × 100).</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate should my percentage calculations be?</h4>
                      <p className="text-gray-600 text-sm">The required accuracy depends on your application. Financial calculations may need several decimal places, while general estimations might only need whole numbers.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-World Examples */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Real-World Percentage Examples</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Shopping and Discounts</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-green-800 mb-1">Example: Sale Price Calculation</h5>
                        <p className="text-sm text-green-700 mb-2">A $80 jacket is on sale for 25% off. What's the sale price?</p>
                        <p className="text-sm text-green-700">Solution: $80 - (25% of $80) = $80 - $20 = $60</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-1">Example: Tax Calculation</h5>
                        <p className="text-sm text-blue-700 mb-2">If sales tax is 8.5%, what's the total cost of a $150 purchase?</p>
                        <p className="text-sm text-blue-700">Solution: $150 + (8.5% of $150) = $150 + $12.75 = $162.75</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Academic Grading</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-purple-800 mb-1">Example: Test Score Percentage</h5>
                        <p className="text-sm text-purple-700 mb-2">A student answered 42 out of 50 questions correctly. What's their percentage?</p>
                        <p className="text-sm text-purple-700">Solution: (42 ÷ 50) × 100 = 84%</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-orange-800 mb-1">Example: Grade Improvement</h5>
                        <p className="text-sm text-orange-700 mb-2">A student's grade improved from 75% to 85%. What's the percentage increase?</p>
                        <p className="text-sm text-orange-700">Solution: ((85 - 75) ÷ 75) × 100 = 13.33% increase</p>
                      </div>
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
}
