
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { useToast } from '@/hooks/use-toast';
import { PresetManager } from '@/components/PresetManager';
import { Pin } from 'lucide-react';
import { usePinnedTools } from '@/hooks/use-pinned-tools';
import { cn } from '@/lib/utils';
import { calculateBMI, isValidBMIInputs } from '@/lib/calculators/health/bmi.engine';
import { BMICalculatorInput, BMIResult, UnitSystem, Gender } from '@/types/health-tool.types';

import { usePredictiveInput } from '@/hooks/use-predictive-input';

const BMICalculator = () => {
  const toolId = 'bmi-calculator';
  const toolName = 'BMI Calculator';
  const { toast } = useToast();
  const { pinnedTools, togglePin, isPinned } = usePinnedTools();
  
  const { predictedValues, updatePredictions } = usePredictiveInput(toolId, {}, {
    weight: '',
    height: '',
    feet: '',
    inches: '',
    unitSystem: 'metric',
    age: '',
    gender: 'male'
  });

  const [weight, setWeight] = useState(predictedValues.weight ?? '');
  const [height, setHeight] = useState(predictedValues.height ?? '');
  const [feet, setFeet] = useState(predictedValues.feet ?? '');
  const [inches, setInches] = useState(predictedValues.inches ?? '');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>((predictedValues.unitSystem as UnitSystem) ?? 'metric');
  const [age, setAge] = useState(predictedValues.age ?? '');
  const [gender, setGender] = useState<Gender>((predictedValues.gender as Gender) ?? 'male');
  const [result, setResult] = useState<BMIResult | null>(null);

  const handleCalculate = () => {
    const inputs: Partial<BMICalculatorInput> = {
      weight,
      height,
      feet,
      inches,
      unitSystem,
      age,
      gender,
    };

    if (isValidBMIInputs(inputs)) {
      const res = calculateBMI(inputs);
      setResult(res);
      updatePredictions({
        weight: weight || '',
        height: height || '',
        feet: feet || '',
        inches: inches || '',
        unitSystem: unitSystem || 'metric',
        age: age || '',
        gender: gender || 'male'
      });
    }
  };

  const resetCalculator = () => {
    setWeight('');
    setHeight('');
    setFeet('');
    setInches('');
    setAge('');
    setGender('male');
    setUnitSystem('metric');
    setResult(null);
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(1)} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>BMI Calculator - Free Body Mass Index Calculator | DapsiWow</title>
        <meta name="description" content="Free BMI calculator with instant results. Calculate Body Mass Index, get health category classification, and personalized weight recommendations for optimal health." />
        <meta name="keywords" content="BMI calculator, body mass index calculator, BMI chart, healthy weight calculator, weight category, obesity calculator, BMI formula, ideal weight calculator, health assessment tool, fitness calculator" />
        <link rel="canonical" href="https://dapsiwow.com/tools/bmi-calculator" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/bmi-calculator" />
        <meta property="og:title" content="BMI Calculator - Free Body Mass Index Calculator | DapsiWow" />
        <meta property="og:description" content="Calculate your BMI instantly with our free Body Mass Index calculator. Get health category classification and personalized weight recommendations." />
        <meta property="og:image" content="https://dapsiwow.com/images/bmi-calculator-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DapsiWow BMI Calculator - Free Body Mass Index Tool" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://dapsiwow.com/tools/bmi-calculator" />
        <meta name="twitter:title" content="BMI Calculator - Free Body Mass Index Calculator | DapsiWow" />
        <meta name="twitter:description" content="Free BMI calculator with instant results. Get health category classification and weight recommendations." />
        <meta name="twitter:image" content="https://dapsiwow.com/images/bmi-calculator-og.jpg" />
        <meta name="twitter:image:alt" content="DapsiWow BMI Calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BMI Calculator",
            "description": "Free online BMI calculator to calculate Body Mass Index and determine health category classification with weight recommendations.",
            "url": "https://dapsiwow.com/tools/bmi-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate BMI using metric or imperial units",
              "Health category classification",
              "Healthy weight range calculation",
              "Weight loss/gain recommendations",
              "Age and gender considerations"
            ],
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            }
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://dapsiwow.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Health Tools",
                "item": "https://dapsiwow.com/health-tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "BMI Calculator",
                "item": "https://dapsiwow.com/tools/bmi-calculator"
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Calculate BMI (Body Mass Index)",
            "description": "Step-by-step guide to calculate your BMI using our free online calculator",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Select Unit System",
                "text": "Choose between metric (kg/cm) or imperial (lbs/ft) measurement units based on your preference."
              },
              {
                "@type": "HowToStep",
                "name": "Enter Your Weight",
                "text": "Input your current body weight in kilograms or pounds depending on your selected unit system."
              },
              {
                "@type": "HowToStep",
                "name": "Enter Your Height",
                "text": "Input your height in centimeters or feet and inches based on your selected measurement system."
              },
              {
                "@type": "HowToStep",
                "name": "Calculate BMI",
                "text": "Click 'Calculate BMI' to instantly see your Body Mass Index, health category, and personalized weight recommendations."
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is BMI and what does it measure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "BMI (Body Mass Index) is a numerical value derived from your height and weight that indicates body composition. It's calculated as weight (kg) divided by height squared (m²). BMI helps categorize individuals into underweight, normal weight, overweight, or obese ranges, providing a quick health screening tool."
                }
              },
              {
                "@type": "Question",
                "name": "How do I calculate my BMI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To calculate BMI, divide your weight in kilograms by your height in meters squared (BMI = kg/m²). For imperial units, divide weight in pounds by height in inches squared, then multiply by 703. Our calculator does this automatically for both metric and imperial units."
                }
              },
              {
                "@type": "Question",
                "name": "Is BMI accurate for everyone?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "BMI is approximately 80% accurate for the general population as a health screening tool. However, it may be less accurate for athletes with high muscle mass, elderly individuals with reduced bone density, pregnant women, and growing children. It's most effective when used alongside other health indicators."
                }
              },
              {
                "@type": "Question",
                "name": "What's considered a healthy BMI range?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For most adults, a BMI between 18.5 and 24.9 is considered healthy. BMI below 18.5 is underweight, 25-29.9 is overweight, and 30+ is classified as obese. However, optimal BMI can vary based on individual factors like muscle mass, bone density, age, and ethnicity."
                }
              },
              {
                "@type": "Question",
                "name": "Does BMI differ between men and women?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The BMI calculation formula is identical for both sexes. However, women typically have higher body fat percentages than men at the same BMI level, which some healthcare providers consider during interpretation."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I calculate my BMI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Monthly BMI calculations are sufficient for general health monitoring. During active weight management programs, weekly measurements can help track progress while accounting for normal weight fluctuations."
                }
              },
              {
                "@type": "Question",
                "name": "Can I have a healthy lifestyle with a high BMI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, some individuals with higher BMIs can be metabolically healthy, especially if they exercise regularly, eat well, and have good cardiovascular markers. BMI is just one health indicator among many."
                }
              },
              {
                "@type": "Question",
                "name": "Should athletes rely on BMI calculations?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Athletes, especially those in strength sports, may find BMI less accurate due to higher muscle mass. Body fat percentage and performance metrics are often more relevant for athletic populations."
                }
              },
              {
                "@type": "Question",
                "name": "How does BMI relate to life expectancy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Research shows that BMIs in the normal range (18.5-24.9) are associated with lower mortality risks. However, factors like fitness level, diet quality, and genetics also significantly impact longevity."
                }
              },
              {
                "@type": "Question",
                "name": "At what age should BMI monitoring begin?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For adults (18+), regular BMI monitoring can begin as part of routine health assessments. Children and teens require age and gender-specific BMI percentiles rather than adult categories."
                }
              }
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://dapsiwow.com/#organization",
            "name": "DapsiWow",
            "url": "https://dapsiwow.com",
            "logo": "https://dapsiwow.com/logo.png",
            "description": "Free online calculators and tools for health, finance, and productivity",
            "sameAs": [
              "https://www.facebook.com/dapsiwow",
              "https://twitter.com/dapsiwow",
              "https://www.linkedin.com/company/dapsiwow"
            ]
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://dapsiwow.com/#website",
            "url": "https://dapsiwow.com",
            "name": "DapsiWow",
            "description": "Free online calculators and tools for finance, health, and productivity",
            "publisher": {
              "@id": "https://dapsiwow.com/#organization"
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://dapsiwow.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional BMI Calculator</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 rounded-full transition-all",
                    isPinned(toolId) 
                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100" 
                      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  )}
                  onClick={() => togglePin({ id: toolId, name: toolName, url: '/tools/bmi-calculator' })}
                  title={isPinned(toolId) ? "Unpin from Quick Access" : "Pin to Quick Access"}
                  aria-label={isPinned(toolId) ? "Unpin from Quick Access" : "Pin to Quick Access"}
                >
                  <Pin className={cn("h-3.5 w-3.5", isPinned(toolId) && "fill-current")} />
                </Button>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="text-bmi-title">
                <span className="block">Smart BMI</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Calculate your Body Mass Index with advanced health insights and personalized weight recommendations
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16" data-testid="page-bmi-calculator">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">BMI Configuration</h2>
                      <p className="text-gray-600">Enter your body measurements to get accurate BMI calculations</p>
                    </div>
                    <PresetManager
                      toolId="bmi-calculator"
                      currentValues={{
                        weight,
                        height,
                        feet,
                        inches,
                        unitSystem,
                        age,
                        gender,
                      }}
                      onLoadPreset={(values) => {
                        if (values.weight !== undefined) setWeight(values.weight);
                        if (values.height !== undefined) setHeight(values.height);
                        if (values.feet !== undefined) setFeet(values.feet);
                        if (values.inches !== undefined) setInches(values.inches);
                        if (values.unitSystem !== undefined) setUnitSystem(values.unitSystem);
                        if (values.age !== undefined) setAge(values.age);
                        if (values.gender !== undefined) setGender(values.gender);
                        toast({
                          title: "Preset loaded",
                          description: "The calculation parameters have been updated.",
                        });
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unit System */}
                    <div className="md:col-span-2 space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Unit System</Label>
                      <RadioGroup 
                        value={unitSystem} 
                        onValueChange={(val) => setUnitSystem(val as UnitSystem)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                          <Label htmlFor="metric">Metric (kg, cm)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                          <Label htmlFor="imperial">Imperial (lbs, ft/in)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Weight */}
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder={unitSystem === 'metric' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          aria-label={`Enter weight in ${unitSystem === 'metric' ? 'kilograms' : 'pounds'}`}
                          data-testid="input-weight"
                        />
                      </div>
                    </div>

                    {/* Height */}
                    <div className="space-y-3">
                      <Label htmlFor={unitSystem === 'metric' ? "height" : "feet"} className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Height {unitSystem === 'metric' ? '(cm)' : '(ft/in)'}
                      </Label>
                      {unitSystem === 'metric' ? (
                        <Input
                          id="height"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder="175"
                          min="0"
                          step="0.1"
                          aria-label="Enter height in centimeters"
                          data-testid="input-height"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Height in feet and inches">
                          <div>
                            <Label htmlFor="feet" className="text-xs text-gray-500 sr-only">Feet</Label>
                            <Input
                              id="feet"
                              type="number"
                              value={feet}
                              onChange={(e) => setFeet(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="5"
                              min="0"
                              max="8"
                              aria-label="Height feet"
                              data-testid="input-feet"
                            />
                          </div>
                          <div>
                            <Label htmlFor="inches" className="text-xs text-gray-500 sr-only">Inches</Label>
                            <Input
                              id="inches"
                              type="number"
                              value={inches}
                              onChange={(e) => setInches(e.target.value)}
                              className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                              placeholder="9"
                              min="0"
                              max="11"
                              aria-label="Height inches"
                              data-testid="input-inches"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Age (Optional) */}
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Age (years) <span className="text-gray-400 font-normal">- Optional</span>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        placeholder="30"
                        min="1"
                        max="120"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Gender (Optional) */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Gender <span className="text-gray-400 font-normal">- Optional</span>
                      </Label>
                      <Select value={gender} onValueChange={(val) => setGender(val as Gender)}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={handleCalculate}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      Calculate BMI
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">BMI Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="bmi-results" aria-live="polite" aria-atomic="true" role="region" aria-label="BMI calculation results">
                      {/* BMI Value Highlight */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Your BMI</div>
                        <div className={`text-4xl font-bold ${getBMIColor(result.bmi)}`} data-testid="text-bmi-value">
                          {result.bmi}
                        </div>
                      </div>

                      {/* BMI Category */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Category</span>
                          <span className={`font-semibold ${getBMIColor(result.bmi)}`} data-testid="text-bmi-category">
                            {result.category}
                          </span>
                        </div>
                      </div>

                      {/* Healthy Weight Range */}
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-2">Healthy Weight Range</h3>
                        <div className="text-sm text-green-700">
                          <span className="font-medium" data-testid="text-healthy-weight-range">
                            {formatWeight(result.healthyWeightMin)} - {formatWeight(result.healthyWeightMax)}
                          </span>
                        </div>
                      </div>

                      {/* Weight Recommendations */}
                      {(result.weightToLose || result.weightToGain) && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h3 className="font-semibold text-blue-800 mb-2">Recommendation</h3>
                          {result.weightToLose && (
                            <p className="text-sm text-blue-700" data-testid="text-weight-to-lose">
                              To reach a healthy weight, consider losing about{' '}
                              <span className="font-medium">{formatWeight(result.weightToLose)}</span>
                            </p>
                          )}
                          {result.weightToGain && (
                            <p className="text-sm text-blue-700" data-testid="text-weight-to-gain">
                              To reach a healthy weight, consider gaining about{' '}
                              <span className="font-medium">{formatWeight(result.weightToGain)}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* BMI Chart */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">BMI Categories</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Underweight</span>
                            <span className="text-blue-600 font-medium">Below 18.5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Normal weight</span>
                            <span className="text-green-600 font-medium">18.5 - 24.9</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overweight</span>
                            <span className="text-orange-600 font-medium">25.0 - 29.9</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Obese</span>
                            <span className="text-red-600 font-medium">30.0 and above</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">BMI</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter your measurements and calculate to see BMI results</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is BMI (Body Mass Index)?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    BMI (Body Mass Index) is a widely used health assessment tool that measures body fat based on height and weight. 
                    It's calculated by dividing a person's weight in kilograms by the square of their height in meters (kg/m²). 
                    This screening tool helps identify potential weight-related health risks and provides a standardized way to 
                    assess whether an individual falls within a healthy weight range.
                  </p>
                  <p>
                    Our free BMI calculator provides instant, accurate results with personalized recommendations. Whether you're 
                    monitoring your health, planning a fitness journey, or consulting with healthcare professionals, this tool 
                    offers valuable insights into your weight status and overall health indicators.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our BMI Calculator</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Our BMI calculator is designed for ease of use with both metric and imperial units. Simply enter your 
                    weight and height, optionally add your age and gender for context, then click "Calculate BMI" to get 
                    instant results including your BMI value, health category, and personalized weight recommendations.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">BMI Formula</h4>
                    <p className="font-mono text-center text-lg text-blue-700">
                      BMI = Weight (kg) ÷ Height² (m²)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI Categories and Health Implications</h3>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Underweight (BMI &lt; 18.5)</div>
                      <div className="text-sm text-gray-600">May indicate malnutrition or underlying health issues</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Normal weight (BMI 18.5-24.9)</div>
                      <div className="text-sm text-gray-600">Associated with lowest health risks and optimal wellness</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Overweight (BMI 25-29.9)</div>
                      <div className="text-sm text-gray-600">Increased risk of cardiovascular and metabolic issues</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium">Obese (BMI ≥ 30)</div>
                      <div className="text-sm text-gray-600">High risk of serious health conditions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of BMI Monitoring</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Early identification of weight-related health risks</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Goal setting for weight management programs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Progress tracking during fitness journeys</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Professional healthcare consultation preparation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Understanding healthy weight ranges for your height</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* BMI Applications Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI Calculator Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Fitness Planning</h4>
                    <p className="text-gray-600 text-sm">
                      Use BMI calculations to establish baseline fitness levels, set realistic weight goals, and track progress 
                      throughout your health journey. Perfect for personal trainers and fitness enthusiasts.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Screening</h4>
                    <p className="text-gray-600 text-sm">
                      Healthcare providers use BMI as an initial screening tool for weight-related health risks. It helps 
                      identify patients who may benefit from nutritional counseling or weight management programs.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Research & Studies</h4>
                    <p className="text-gray-600 text-sm">
                      BMI data is crucial for population health studies, epidemiological research, and understanding 
                      obesity trends across different demographics and geographic regions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMI vs Other Measurements */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI vs Other Body Composition Measurements</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-l-lg">Measurement</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">What It Measures</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900">Advantages</th>
                        <th className="text-left py-4 px-6 font-bold text-gray-900 rounded-r-lg">Limitations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">BMI</td>
                        <td className="py-4 px-6 text-gray-600">Weight relative to height</td>
                        <td className="py-4 px-6 text-gray-600">Simple, standardized, widely accepted</td>
                        <td className="py-4 px-6 text-gray-600">Doesn't distinguish muscle from fat</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Body Fat Percentage</td>
                        <td className="py-4 px-6 text-gray-600">Proportion of fat tissue</td>
                        <td className="py-4 px-6 text-gray-600">More accurate body composition</td>
                        <td className="py-4 px-6 text-gray-600">Requires specialized equipment</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Waist Circumference</td>
                        <td className="py-4 px-6 text-gray-600">Abdominal fat distribution</td>
                        <td className="py-4 px-6 text-gray-600">Indicates visceral fat risks</td>
                        <td className="py-4 px-6 text-gray-600">Limited to abdominal area only</td>
                      </tr>
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-6 font-medium">Waist-to-Hip Ratio</td>
                        <td className="py-4 px-6 text-gray-600">Fat distribution pattern</td>
                        <td className="py-4 px-6 text-gray-600">Shows health risk patterns</td>
                        <td className="py-4 px-6 text-gray-600">More complex to measure accurately</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* BMI Limitations and Considerations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">BMI Limitations to Consider</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-red-400 pl-4 bg-red-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Muscle Mass Impact</h4>
                      <p className="text-sm text-red-700">Athletes and bodybuilders may have high BMIs due to muscle mass, not excess fat.</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Age Considerations</h4>
                      <p className="text-sm text-orange-700">BMI may be less accurate for elderly individuals due to changes in body composition.</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Ethnic Variations</h4>
                      <p className="text-sm text-yellow-700">Different ethnic groups may have varying health risks at the same BMI levels.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Pregnancy & Growth</h4>
                      <p className="text-sm text-blue-700">Standard BMI ranges don't apply to pregnant women or growing children and teens.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Healthy Weight Management Tips</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Balanced Nutrition</h4>
                      <p className="text-sm text-green-700">Focus on whole foods, proper portion sizes, and nutrient-dense meals for sustainable weight management.</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Regular Exercise</h4>
                      <p className="text-sm text-blue-700">Combine cardiovascular exercise with strength training for optimal body composition and health benefits.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Lifestyle Factors</h4>
                      <p className="text-sm text-purple-700">Prioritize adequate sleep, stress management, and hydration as crucial components of weight management.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Professional Guidance</h4>
                      <p className="text-sm text-orange-700">Consult healthcare providers or registered dietitians for personalized weight management strategies.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About BMI</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is BMI for health assessment?</h4>
                      <p className="text-gray-600 text-sm">BMI is approximately 80% accurate for the general population as a health screening tool. It's most effective when used alongside other health indicators like waist circumference, blood pressure, and overall fitness level.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Does BMI differ between men and women?</h4>
                      <p className="text-gray-600 text-sm">The BMI calculation formula is identical for both sexes. However, women typically have higher body fat percentages than men at the same BMI level, which some healthcare providers consider during interpretation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">At what age should BMI monitoring begin?</h4>
                      <p className="text-gray-600 text-sm">For adults (18+), regular BMI monitoring can begin as part of routine health assessments. Children and teens require age and gender-specific BMI percentiles rather than adult categories.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I calculate my BMI?</h4>
                      <p className="text-gray-600 text-sm">Monthly BMI calculations are sufficient for general health monitoring. During active weight management programs, weekly measurements can help track progress while accounting for normal weight fluctuations.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's considered a healthy BMI range?</h4>
                      <p className="text-gray-600 text-sm">For most adults, a BMI between 18.5 and 24.9 is considered healthy. However, optimal BMI can vary based on individual factors like muscle mass, bone density, age, and ethnicity.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I have a healthy lifestyle with a high BMI?</h4>
                      <p className="text-gray-600 text-sm">Yes, some individuals with higher BMIs can be metabolically healthy, especially if they exercise regularly, eat well, and have good cardiovascular markers. BMI is just one health indicator among many.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should athletes rely on BMI calculations?</h4>
                      <p className="text-gray-600 text-sm">Athletes, especially those in strength sports, may find BMI less accurate due to higher muscle mass. Body fat percentage and performance metrics are often more relevant for athletic populations.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does BMI relate to life expectancy?</h4>
                      <p className="text-gray-600 text-sm">Research shows that BMIs in the normal range (18.5-24.9) are associated with lower mortality risks. However, factors like fitness level, diet quality, and genetics also significantly impact longevity.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BMI History and Development */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding BMI: History and Development</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Origins of BMI</h4>
                    <p className="text-sm">
                      The Body Mass Index was developed by Belgian mathematician Adolphe Quetelet in the 1830s, originally 
                      called the "Quetelet Index." It was designed as a statistical tool to study population-level obesity 
                      trends rather than individual health assessment.
                    </p>
                    <p className="text-sm">
                      The modern BMI gained widespread acceptance in the 1970s when researcher Ancel Keys validated its 
                      effectiveness as a simple screening tool for weight-related health risks in large populations.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Global Adoption</h4>
                    <p className="text-sm">
                      The World Health Organization (WHO) adopted BMI as the standard for recording obesity statistics 
                      worldwide in the 1990s, establishing the categories we use today for international health comparisons.
                    </p>
                  </div>
                  <div className="space-y-4 text-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900">Modern Applications</h4>
                    <p className="text-sm">
                      Today, BMI serves multiple purposes beyond individual health assessment. Insurance companies use it 
                      for risk assessment, public health officials track population health trends, and researchers study 
                      obesity patterns across demographics.
                    </p>
                    <h4 className="text-lg font-semibold text-gray-900">Future Developments</h4>
                    <p className="text-sm">
                      Scientists continue refining BMI applications, developing adjusted calculations for different ethnic 
                      groups and creating complementary tools like waist-to-height ratios and body adiposity indexes for 
                      more comprehensive health assessment.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-blue-800 mb-2">Did You Know?</h4>
                      <p className="text-sm text-blue-700">
                        BMI calculations remain consistent worldwide, making it possible to compare health data across 
                        different countries and healthcare systems, supporting global health research and policy development.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Health Tools Section */}
            <section className="mt-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Related Health Calculators</h2>
              <p className="text-lg text-gray-700 mb-6">
                Explore our comprehensive suite of free health calculators to monitor your wellness and fitness goals:
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="/tools/calorie-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-calorie-calculator">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Calorie Calculator</h3>
                  <p className="text-gray-700 text-sm">Calculate daily calorie needs based on your activity level, age, and weight goals. Perfect for weight management and fitness planning.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Calories →</span>
                </a>

                <a href="/tools/body-fat-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-body-fat-calculator">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Body Fat Calculator</h3>
                  <p className="text-gray-700 text-sm">Estimate your body fat percentage using various measurement methods. Get accurate assessments for better health tracking.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Body Fat →</span>
                </a>

                <a href="/tools/ideal-weight-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-ideal-weight-calculator">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Ideal Weight Calculator</h3>
                  <p className="text-gray-700 text-sm">Determine your ideal weight range based on height, age, and gender using multiple scientific formulas for accurate results.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Ideal Weight →</span>
                </a>

                <a href="/tools/pregnancy-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-pregnancy-calculator">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Pregnancy Calculator</h3>
                  <p className="text-gray-700 text-sm">Calculate due date, conception date, and pregnancy milestones. Track your pregnancy journey week by week with detailed insights.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Due Date →</span>
                </a>

                <a href="/tools/macro-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-macro-calculator">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Macro Calculator</h3>
                  <p className="text-gray-700 text-sm">Calculate optimal protein, carbs, and fat intake for your fitness goals. Essential for bodybuilders and health enthusiasts.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Macros →</span>
                </a>

                <a href="/tools/heart-rate-calculator" className="block bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all no-underline" data-testid="link-heart-rate-calculator">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 no-underline">Heart Rate Calculator</h3>
                  <p className="text-gray-700 text-sm">Calculate target heart rate zones for optimal cardio training. Improve fitness efficiency with personalized heart rate targets.</p>
                  <span className="text-blue-600 font-medium text-sm mt-2 inline-block">Calculate Heart Rate →</span>
                </a>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Need More Health Tools?</h3>
                <p className="text-gray-700 mb-4">
                  Browse our complete collection of 30+ free health and wellness calculators. All tools are free, require no registration, and work on any device.
                </p>
                <a href="/health-tools" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors no-underline" data-testid="link-all-health-tools">
                  View All Health Tools →
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BMICalculator;
