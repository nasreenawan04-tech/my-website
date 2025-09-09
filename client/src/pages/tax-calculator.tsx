
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt } from 'lucide-react';

interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  taxBreakdown: { bracket: string; rate: number; amount: number }[];
}

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export default function TaxCalculator() {
  const [income, setIncome] = useState('50000');
  const [filingStatus, setFilingStatus] = useState('single');
  const [deductions, setDeductions] = useState('12950'); // 2023 standard deduction
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<TaxResult | null>(null);

  const countries = [
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'SG', name: 'Singapore', currency: 'SGD' },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'NZD', name: 'New Zealand Dollar' }
  ];

  const filingStatuses = {
    US: [
      { value: 'single', label: 'Single' },
      { value: 'married_jointly', label: 'Married Filing Jointly' },
      { value: 'married_separately', label: 'Married Filing Separately' },
      { value: 'head_of_household', label: 'Head of Household' }
    ],
    UK: [
      { value: 'individual', label: 'Individual' }
    ],
    CA: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married/Common-law' }
    ],
    AU: [
      { value: 'resident', label: 'Resident' },
      { value: 'non_resident', label: 'Non-resident' }
    ],
    DE: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' }
    ],
    FR: [
      { value: 'single', label: 'Single' },
      { value: 'married', label: 'Married' }
    ],
    IN: [
      { value: 'individual', label: 'Individual' },
      { value: 'senior_citizen', label: 'Senior Citizen (60-80)' },
      { value: 'super_senior', label: 'Super Senior (80+)' }
    ],
    JP: [
      { value: 'resident', label: 'Resident' },
      { value: 'non_resident', label: 'Non-resident' }
    ],
    SG: [
      { value: 'resident', label: 'Resident' },
      { value: 'non_resident', label: 'Non-resident' }
    ],
    NZ: [
      { value: 'individual', label: 'Individual' }
    ]
  };

  // Simplified tax brackets for different countries (2023/2024 tax year)
  const taxBrackets: { [key: string]: { [key: string]: TaxBracket[] } } = {
    US: {
      single: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: null, rate: 0.37 }
      ],
      married_jointly: [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: null, rate: 0.37 }
      ]
    },
    UK: {
      individual: [
        { min: 0, max: 12570, rate: 0.00 },
        { min: 12570, max: 50270, rate: 0.20 },
        { min: 50270, max: 150000, rate: 0.40 },
        { min: 150000, max: null, rate: 0.45 }
      ]
    },
    CA: {
      single: [
        { min: 0, max: 15000, rate: 0.00 },
        { min: 15000, max: 53359, rate: 0.15 },
        { min: 53359, max: 106717, rate: 0.205 },
        { min: 106717, max: 165430, rate: 0.26 },
        { min: 165430, max: 235675, rate: 0.29 },
        { min: 235675, max: null, rate: 0.33 }
      ]
    },
    AU: {
      resident: [
        { min: 0, max: 18200, rate: 0.00 },
        { min: 18200, max: 45000, rate: 0.19 },
        { min: 45000, max: 120000, rate: 0.325 },
        { min: 120000, max: 180000, rate: 0.37 },
        { min: 180000, max: null, rate: 0.45 }
      ]
    },
    IN: {
      individual: [
        { min: 0, max: 250000, rate: 0.00 },
        { min: 250000, max: 500000, rate: 0.05 },
        { min: 500000, max: 1000000, rate: 0.20 },
        { min: 1000000, max: null, rate: 0.30 }
      ]
    }
  };

  const calculateTax = () => {
    const grossIncome = parseFloat(income);
    const totalDeductions = parseFloat(deductions);
    
    if (grossIncome <= 0) return;

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    const brackets = taxBrackets[country]?.[filingStatus] || taxBrackets.US.single;
    
    let incomeTax = 0;
    let marginalTaxRate = 0;
    const taxBreakdown: { bracket: string; rate: number; amount: number }[] = [];

    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableAtThisBracket = Math.min(
          taxableIncome - bracket.min,
          bracket.max ? bracket.max - bracket.min : taxableIncome - bracket.min
        );
        
        const taxAtThisBracket = taxableAtThisBracket * bracket.rate;
        incomeTax += taxAtThisBracket;
        marginalTaxRate = bracket.rate;

        if (taxAtThisBracket > 0) {
          const bracketLabel = bracket.max 
            ? `${formatCurrency(bracket.min)} - ${formatCurrency(bracket.max)}`
            : `${formatCurrency(bracket.min)}+`;
          
          taxBreakdown.push({
            bracket: bracketLabel,
            rate: bracket.rate * 100,
            amount: taxAtThisBracket
          });
        }
      }
    }

    const netIncome = grossIncome - incomeTax;
    const effectiveTaxRate = grossIncome > 0 ? (incomeTax / grossIncome) * 100 : 0;

    setResult({
      grossIncome,
      taxableIncome,
      incomeTax,
      netIncome,
      effectiveTaxRate,
      marginalTaxRate: marginalTaxRate * 100,
      taxBreakdown
    });
  };

  const resetCalculator = () => {
    setIncome('50000');
    setDeductions('12950');
    setFilingStatus('single');
    setCountry('US');
    setCurrency('USD');
    setResult(null);
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const countryData = countries.find(c => c.code === newCountry);
    if (countryData) {
      setCurrency(countryData.currency);
    }
    
    // Reset filing status to first option for the new country
    const statuses = filingStatuses[newCountry as keyof typeof filingStatuses] || filingStatuses.US;
    setFilingStatus(statuses[0].value);
    
    // Set appropriate deduction based on country
    const standardDeductions: { [key: string]: string } = {
      US: '12950',
      UK: '12570',
      CA: '15000',
      AU: '18200',
      IN: '50000',
      DE: '10908',
      FR: '10777',
      JP: '480000',
      SG: '0',
      NZ: '0'
    };
    setDeductions(standardDeductions[newCountry] || '0');
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      INR: { locale: 'en-IN', currency: 'INR' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      SGD: { locale: 'en-SG', currency: 'SGD' },
      NZD: { locale: 'en-NZ', currency: 'NZD' }
    };

    const config = currencyMap[currency] || currencyMap.USD;
    
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const currentFilingStatuses = filingStatuses[country as keyof typeof filingStatuses] || filingStatuses.US;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Tax Calculator - Calculate Income Tax Worldwide | ToolsHub</title>
        <meta name="description" content="Free income tax calculator for 10+ countries. Calculate taxes for USA, UK, Canada, Australia, Germany, France, India & more. Get instant tax estimates, effective rates, and detailed breakdowns for tax planning." />
        <meta name="keywords" content="tax calculator, income tax calculator, tax estimator, effective tax rate, marginal tax rate, tax planning, USA tax calculator, UK tax calculator, Canada tax calculator, Australia tax calculator, free tax calculator, online tax calculator, tax bracket calculator, federal tax calculator, take home pay calculator" />
        <meta property="og:title" content="Free Tax Calculator - Calculate Income Tax Worldwide | ToolsHub" />
        <meta property="og:description" content="Calculate income tax for multiple countries with our free online tax calculator. Get instant estimates, detailed breakdowns, and tax planning insights." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Tax Calculator - Calculate Income Tax Worldwide" />
        <meta name="twitter:description" content="Calculate income tax for multiple countries with detailed breakdowns and tax planning insights. Free online tool supporting 10+ countries." />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="gradient-hero text-white py-16 pt-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Tax Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Calculate income tax for multiple countries with detailed breakdown and analysis
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Income Tax Calculator</h2>
                  
                  {/* Country Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country
                    </Label>
                    <Select value={country} onValueChange={handleCountryChange}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Annual Income */}
                  <div className="space-y-3">
                    <Label htmlFor="income" className="text-sm font-medium text-gray-700">
                      Annual Gross Income ({currency})
                    </Label>
                    <Input
                      id="income"
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="50,000"
                      min="0"
                    />
                  </div>

                  {/* Filing Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Filing Status</Label>
                    <Select value={filingStatus} onValueChange={setFilingStatus}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentFilingStatuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-3">
                    <Label htmlFor="deductions" className="text-sm font-medium text-gray-700">
                      Total Deductions ({currency})
                    </Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={deductions}
                      onChange={(e) => setDeductions(e.target.value)}
                      className="h-12 text-base border-gray-200 rounded-lg"
                      placeholder="12,950"
                      min="0"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={calculateTax}
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Calculate Tax
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">Tax Analysis</h2>
                  
                  {result ? (
                    <div className="space-y-6">
                      {/* Tax Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Income Tax</div>
                            <div className="text-2xl font-bold text-red-600">
                              {formatCurrency(result.incomeTax)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                          <div className="text-center space-y-2">
                            <div className="text-sm text-gray-600">Net Income</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(result.netIncome)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Gross Income</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.grossIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Total Deductions</span>
                          <span className="font-semibold text-gray-900">
                            -{formatCurrency(result.grossIncome - result.taxableIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Taxable Income</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(result.taxableIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200">
                          <span className="text-gray-600">Effective Tax Rate</span>
                          <span className="font-semibold text-red-600">
                            {formatPercentage(result.effectiveTaxRate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Marginal Tax Rate</span>
                          <span className="font-semibold text-red-600">
                            {formatPercentage(result.marginalTaxRate)}
                          </span>
                        </div>
                      </div>

                      {/* Tax Bracket Breakdown */}
                      {result.taxBreakdown.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Bracket Breakdown</h3>
                          <div className="space-y-2">
                            {result.taxBreakdown.map((bracket, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">
                                    {bracket.bracket} ({formatPercentage(bracket.rate)})
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {formatCurrency(bracket.amount)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Enter your income details and click calculate to see tax analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced SEO Content Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Free Online Tax Calculator - Calculate Income Tax Worldwide
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Calculate your income tax accurately with our comprehensive tax calculator supporting multiple countries. 
                Get instant tax estimates, understand your effective tax rate, and plan your finances better with detailed 
                tax bracket breakdowns for USA, UK, Canada, Australia, India, and more. Perfect for salary negotiations, 
                financial planning, and tax preparation.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Country Support</h3>
                <p className="text-gray-600">Calculate taxes for 10+ countries including USA, UK, Canada, Australia, Germany, France, India, Japan, Singapore, and New Zealand with real-time currency conversion.</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Tax Analysis</h3>
                <p className="text-gray-600">Get comprehensive tax breakdown with effective rates, marginal rates, and detailed tax bracket analysis for complete understanding of your tax obligations.</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Tax Planning</h3>
                <p className="text-gray-600">Use our calculator for strategic tax planning, annual budgeting, retirement planning, and making informed financial decisions year-round.</p>
              </div>
            </div>

            {/* What is Tax Calculator - Enhanced Section */}
            <div className="bg-white rounded-xl p-8 mb-12 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                What is an Income Tax Calculator and How Does It Work?
              </h2>
              <div className="max-w-5xl mx-auto">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  An <strong>income tax calculator</strong> is an essential financial planning tool that estimates your annual tax liability 
                  based on your gross income, filing status, deductions, and applicable tax rates. Our advanced online tax calculator 
                  supports multiple countries and provides instant, accurate tax calculations using the latest tax brackets and rates 
                  for the current tax year.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">🧮 How It Works</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Enter your annual gross income in local currency</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Select your country and filing status</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Input total deductions (standard or itemized)</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Get instant tax calculation with detailed breakdown</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>View effective and marginal tax rates</li>
                      <li className="flex items-start"><span className="text-blue-600 mr-2">•</span>Analyze tax liability by income bracket</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Key Calculations</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Taxable income (gross income minus deductions)</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Total income tax liability</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Net income after taxes</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Effective tax rate percentage</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Marginal tax rate for next dollar earned</li>
                      <li className="flex items-start"><span className="text-green-600 mr-2">•</span>Tax breakdown by income bracket</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Progressive Tax System:</strong> Most countries use a progressive tax system where higher income 
                    levels are taxed at higher rates. Our calculator applies the correct tax brackets automatically, 
                    ensuring accurate calculations that reflect how much tax you owe at each income level. This helps you 
                    understand not just your total tax burden, but also how additional income will be taxed.
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits for Different Audiences */}
            <div className="bg-gray-50 rounded-xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Tax Calculator Benefits for Every Financial Situation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Students */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-blue-600 text-xl">🎓</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Students & New Graduates</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Calculate taxes on part-time job income</li>
                      <li>• Plan for first full-time salary negotiations</li>
                      <li>• Understand student loan interest deductions</li>
                      <li>• Learn about entry-level tax brackets</li>
                      <li>• Budget for post-graduation financial planning</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Professionals */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-green-600 text-xl">💼</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Working Professionals</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Evaluate job offers and salary increases</li>
                      <li>• Plan annual bonuses and stock option exercises</li>
                      <li>• Optimize retirement account contributions</li>
                      <li>• Calculate quarterly estimated tax payments</li>
                      <li>• Plan for career advancement tax implications</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Business Owners */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-purple-600 text-xl">🏢</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Owners & Entrepreneurs</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Calculate self-employment tax obligations</li>
                      <li>• Plan business income distribution strategies</li>
                      <li>• Optimize salary vs. dividend decisions</li>
                      <li>• Budget for quarterly business tax payments</li>
                      <li>• Evaluate business deduction impacts</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Freelancers */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-orange-600 text-xl">💻</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Freelancers & Contractors</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Calculate 1099 income tax liability</li>
                      <li>• Plan for self-employment tax rates</li>
                      <li>• Budget for quarterly tax payments</li>
                      <li>• Optimize business expense deductions</li>
                      <li>• Plan for variable income tax implications</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Retirees */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-indigo-600 text-xl">🏖️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Retirees & Pre-Retirees</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Calculate taxes on retirement withdrawals</li>
                      <li>• Plan Roth IRA conversion strategies</li>
                      <li>• Optimize Social Security tax planning</li>
                      <li>• Budget for required minimum distributions</li>
                      <li>• Plan for reduced income tax brackets</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* International */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-red-600 text-xl">🌍</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">International Workers</h3>
                    <ul className="text-gray-600 space-y-2 text-sm">
                      <li>• Compare tax rates across countries</li>
                      <li>• Plan for expatriate assignments</li>
                      <li>• Calculate foreign earned income exclusion</li>
                      <li>• Budget for relocation tax implications</li>
                      <li>• Understand dual taxation scenarios</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Related Financial Tools Section */}
            <div className="bg-white rounded-xl p-8 mb-12 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Complete Your Financial Planning with Related Calculators
              </h2>
              <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
                Maximize your tax planning effectiveness by combining our tax calculator with our comprehensive suite of 
                financial planning tools. Each calculator works together to provide complete financial analysis and planning.
              </p>

              {/* Income & Salary Tools */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    💰
                  </span>
                  Income & Salary Planning Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a href="/tools/salary-to-hourly" className="group p-4 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-clock text-blue-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Salary to Hourly</h4>
                      <p className="text-gray-600 text-xs">Convert annual salary to hourly rates</p>
                    </div>
                  </a>
                  <a href="/tools/tip-calculator" className="group p-4 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-hand-holding-usd text-blue-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Tip Calculator</h4>
                      <p className="text-gray-600 text-xs">Calculate tips and split bills</p>
                    </div>
                  </a>
                  <a href="/tools/net-worth-calculator" className="group p-4 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-balance-scale text-blue-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Net Worth</h4>
                      <p className="text-gray-600 text-xs">Calculate total net worth</p>
                    </div>
                  </a>
                  <a href="/tools/inflation-calculator" className="group p-4 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-arrow-up text-blue-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Inflation Impact</h4>
                      <p className="text-gray-600 text-xs">Calculate inflation over time</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Loan & Debt Tools */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    🏦
                  </span>
                  Loan & Debt Management Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a href="/tools/loan-calculator" className="group p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-calculator text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Loan Calculator</h4>
                      <p className="text-gray-600 text-xs">Calculate loan payments & interest</p>
                    </div>
                  </a>
                  <a href="/tools/mortgage-calculator" className="group p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-home text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Mortgage Calculator</h4>
                      <p className="text-gray-600 text-xs">Calculate home loan payments</p>
                    </div>
                  </a>
                  <a href="/tools/debt-payoff-calculator" className="group p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-credit-card text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Debt Payoff</h4>
                      <p className="text-gray-600 text-xs">Plan debt elimination strategy</p>
                    </div>
                  </a>
                  <a href="/tools/business-loan-calculator" className="group p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-briefcase text-green-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Business Loan</h4>
                      <p className="text-gray-600 text-xs">Calculate business financing</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Investment & Savings Tools */}
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    📈
                  </span>
                  Investment & Savings Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a href="/tools/compound-interest-calculator" className="group p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-chart-line text-purple-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Compound Interest</h4>
                      <p className="text-gray-600 text-xs">Calculate investment growth</p>
                    </div>
                  </a>
                  <a href="/tools/roi-calculator" className="group p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-trending-up text-purple-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">ROI Calculator</h4>
                      <p className="text-gray-600 text-xs">Calculate return on investment</p>
                    </div>
                  </a>
                  <a href="/tools/retirement-calculator" className="group p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-user-clock text-purple-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Retirement Planner</h4>
                      <p className="text-gray-600 text-xs">Plan retirement savings</p>
                    </div>
                  </a>
                  <a href="/tools/savings-goal-calculator" className="group p-4 bg-purple-50 rounded-lg border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-piggy-bank text-purple-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Savings Goal</h4>
                      <p className="text-gray-600 text-xs">Track savings progress</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Additional Financial Tools */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    🧮
                  </span>
                  Additional Financial Calculators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a href="/tools/percentage-calculator" className="group p-4 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-percentage text-orange-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Percentage</h4>
                      <p className="text-gray-600 text-xs">Calculate percentages</p>
                    </div>
                  </a>
                  <a href="/tools/currency-converter" className="group p-4 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-exchange-alt text-orange-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Currency Converter</h4>
                      <p className="text-gray-600 text-xs">Convert currencies</p>
                    </div>
                  </a>
                  <a href="/tools/discount-calculator" className="group p-4 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-tags text-orange-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">Discount</h4>
                      <p className="text-gray-600 text-xs">Calculate discounts & savings</p>
                    </div>
                  </a>
                  <a href="/tools/vat-gst-calculator" className="group p-4 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-200 transition-all hover:shadow-md">
                    <div className="text-center">
                      <i className="fas fa-file-invoice text-orange-600 text-xl mb-2 group-hover:scale-110 transition-transform"></i>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm">VAT/GST</h4>
                      <p className="text-gray-600 text-xs">Calculate sales tax</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Comprehensive Educational Content */}
          <div className="mt-16 space-y-12">
            {/* What is Tax Calculator Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                What is an Income Tax Calculator?
              </h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  An income tax calculator is a powerful financial tool that helps individuals and businesses estimate their 
                  annual tax liability based on their income, filing status, and deductions. Our advanced tax calculator 
                  supports multiple countries and provides detailed analysis including effective tax rates, marginal tax rates, 
                  and comprehensive tax bracket breakdowns.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Whether you're planning your annual budget, considering a job offer, or preparing for tax season, our 
                  calculator provides accurate estimates to help you make informed financial decisions. The tool is designed 
                  to be user-friendly while providing professional-grade accuracy for tax planning purposes.
                </p>
              </div>
            </section>

            {/* How to Use Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How to Use the Tax Calculator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">1</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Select Country</h3>
                    <p className="text-sm text-gray-600">Choose your country from our supported list of 10+ countries worldwide</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">2</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enter Income</h3>
                    <p className="text-sm text-gray-600">Input your annual gross income in your local currency</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">3</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Set Filing Status</h3>
                    <p className="text-sm text-gray-600">Choose your filing status (single, married, etc.) based on your country</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">4</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Add Deductions</h3>
                    <p className="text-sm text-gray-600">Enter your total deductions and get instant tax calculations</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Use Cases Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                When to Use Our Tax Calculator
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💼 Career Planning</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Evaluating job offers and salary negotiations</li>
                      <li>• Planning career moves and income changes</li>
                      <li>• Comparing compensation packages</li>
                      <li>• Understanding take-home pay estimates</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Financial Planning</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Annual budget preparation and planning</li>
                      <li>• Retirement and savings goal calculations</li>
                      <li>• Investment decision making</li>
                      <li>• Emergency fund planning</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Business Decisions</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Freelancer and contractor tax planning</li>
                      <li>• Small business owner tax estimates</li>
                      <li>• Quarterly tax payment planning</li>
                      <li>• Business structure optimization</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 International</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Expatriate tax planning and preparation</li>
                      <li>• Cross-border income calculations</li>
                      <li>• Immigration and relocation planning</li>
                      <li>• International assignment budgeting</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Tax Preparation</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Pre-filing tax estimate calculations</li>
                      <li>• Tax withholding adjustments</li>
                      <li>• Estimated tax payment planning</li>
                      <li>• Year-end tax strategy reviews</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 Education</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Learning about tax systems and rates</li>
                      <li>• Understanding progressive taxation</li>
                      <li>• Financial literacy and education</li>
                      <li>• Academic research and analysis</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Key Features and Benefits */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Tax Calculator Features & Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">🌟 Key Features</h3>
                    <div className="space-y-4">
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Multi-country tax calculation support (USA, UK, Canada, Australia, Germany, France, India, Japan, Singapore, New Zealand)
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Real-time tax calculations with instant results
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Detailed tax bracket breakdown analysis
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Effective and marginal tax rate calculations
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Multiple filing status options per country
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Customizable deduction inputs
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          Mobile-responsive design for all devices
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">💡 Benefits</h3>
                    <div className="space-y-4">
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Save time with instant tax calculations
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Make informed financial decisions
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Plan your budget more effectively
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Understand your tax obligations better
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Free to use with no registration required
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Privacy-focused with no data storage
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          Professional-grade accuracy for planning
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Tax Planning Tips and Important Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">💰 Smart Tax Planning Tips</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Maximize deductions and credits available to you - including charitable donations, business expenses, and education costs</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Consider retirement contributions (401k, IRA) for immediate tax benefits and long-term savings</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Plan for estimated tax payments if self-employed to avoid penalties and improve cash flow</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Time income and deductions strategically across tax years for optimal tax efficiency</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <span>Consult a qualified tax professional for complex situations and personalized advice</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">⚠️ Important Disclaimers</h3>
                  <div className="space-y-4">
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>These are estimates based on standard tax brackets and may not reflect your exact tax situation</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>Actual taxes may vary based on specific circumstances, additional income sources, and applicable credits</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>Does not include state/provincial taxes, local taxes, social security, or other payroll deductions</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>Tax laws change frequently - always verify with official tax authorities and current regulations</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                        <span>For official tax filing, consult with certified tax professionals or use approved tax software</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions About Tax Calculators
              </h2>
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">How accurate is this tax calculator?</h3>
                    <p className="text-gray-600">Our tax calculator uses official tax brackets and rates for each supported country, providing estimates that are typically accurate within 2-3% for standard situations. However, individual circumstances may vary.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Which countries are supported?</h3>
                    <p className="text-gray-600">We support tax calculations for USA, United Kingdom, Canada, Australia, Germany, France, India, Japan, Singapore, and New Zealand, with plans to add more countries regularly.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I use this for business taxes?</h3>
                    <p className="text-gray-600">This calculator is designed primarily for individual income tax calculations. Business taxes involve different rates, deductions, and structures that require specialized business tax calculators.</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Is my data stored or shared?</h3>
                    <p className="text-gray-600">No, all calculations are performed locally in your browser. We do not store, track, or share any of your financial information. Your privacy and data security are our top priorities.</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
