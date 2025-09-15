import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolHeroSection from '@/components/ToolHeroSection';
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
        <title>Percentage Calculator - Calculate Percentages, Changes & More | DapsiWow</title>
        <meta name="description" content="Free percentage calculator for calculating percentages, percentage changes, increases, decreases, and ratios. Perfect for students, professionals, and everyday calculations worldwide." />
        <meta name="keywords" content="percentage calculator, percent calculator, percentage change calculator, calculate percentage" />
        <meta property="og:title" content="Percentage Calculator - Calculate Percentages, Changes & More | DapsiWow" />
        <meta property="og:description" content="Free percentage calculator for calculating percentages, percentage changes, increases, decreases, and ratios. Perfect for students, professionals, and everyday calculations worldwide." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/percentage-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-percentage-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <ToolHeroSection
            title="Percentage Calculator"
            description="Calculate percentages, percentage changes, increases, decreases, and ratios with detailed explanations"
            testId="text-percentage-title"
          />

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

          {/* How to Use Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Select your calculation type from the dropdown menu</li>
                    <li>• Enter the required values in the input fields</li>
                    <li>• Click Calculate to get instant, accurate results</li>
                    <li>• View detailed explanations and mathematical formulas</li>
                    <li>• Use Reset to clear all fields and start a new calculation</li>
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
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PercentageCalculator;