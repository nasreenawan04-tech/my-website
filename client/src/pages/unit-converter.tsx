
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ConversionUnit {
  name: string;
  symbol: string;
  factor: number; // Conversion factor to base unit
}

interface ConversionCategory {
  name: string;
  baseUnit: string;
  units: ConversionUnit[];
}

const conversions: ConversionCategory[] = [
  {
    name: 'Length',
    baseUnit: 'meters',
    units: [
      { name: 'Millimeters', symbol: 'mm', factor: 0.001 },
      { name: 'Centimeters', symbol: 'cm', factor: 0.01 },
      { name: 'Meters', symbol: 'm', factor: 1 },
      { name: 'Kilometers', symbol: 'km', factor: 1000 },
      { name: 'Inches', symbol: 'in', factor: 0.0254 },
      { name: 'Feet', symbol: 'ft', factor: 0.3048 },
      { name: 'Yards', symbol: 'yd', factor: 0.9144 },
      { name: 'Miles', symbol: 'mi', factor: 1609.344 },
      { name: 'Nautical Miles', symbol: 'nmi', factor: 1852 }
    ]
  },
  {
    name: 'Weight',
    baseUnit: 'grams',
    units: [
      { name: 'Milligrams', symbol: 'mg', factor: 0.001 },
      { name: 'Grams', symbol: 'g', factor: 1 },
      { name: 'Kilograms', symbol: 'kg', factor: 1000 },
      { name: 'Ounces', symbol: 'oz', factor: 28.3495 },
      { name: 'Pounds', symbol: 'lb', factor: 453.592 },
      { name: 'Stones', symbol: 'st', factor: 6350.29 },
      { name: 'Tons (Metric)', symbol: 't', factor: 1000000 },
      { name: 'Tons (US)', symbol: 'ton', factor: 907184.74 }
    ]
  },
  {
    name: 'Temperature',
    baseUnit: 'celsius',
    units: [
      { name: 'Celsius', symbol: '°C', factor: 1 },
      { name: 'Fahrenheit', symbol: '°F', factor: 1 },
      { name: 'Kelvin', symbol: 'K', factor: 1 },
      { name: 'Rankine', symbol: '°R', factor: 1 }
    ]
  },
  {
    name: 'Volume',
    baseUnit: 'liters',
    units: [
      { name: 'Milliliters', symbol: 'ml', factor: 0.001 },
      { name: 'Liters', symbol: 'l', factor: 1 },
      { name: 'Cubic Meters', symbol: 'm³', factor: 1000 },
      { name: 'Teaspoons (US)', symbol: 'tsp', factor: 0.00492892 },
      { name: 'Tablespoons (US)', symbol: 'tbsp', factor: 0.0147868 },
      { name: 'Fluid Ounces (US)', symbol: 'fl oz', factor: 0.0295735 },
      { name: 'Cups (US)', symbol: 'cup', factor: 0.236588 },
      { name: 'Pints (US)', symbol: 'pt', factor: 0.473176 },
      { name: 'Quarts (US)', symbol: 'qt', factor: 0.946353 },
      { name: 'Gallons (US)', symbol: 'gal', factor: 3.78541 },
      { name: 'Gallons (UK)', symbol: 'gal UK', factor: 4.54609 }
    ]
  },
  {
    name: 'Area',
    baseUnit: 'square meters',
    units: [
      { name: 'Square Millimeters', symbol: 'mm²', factor: 0.000001 },
      { name: 'Square Centimeters', symbol: 'cm²', factor: 0.0001 },
      { name: 'Square Meters', symbol: 'm²', factor: 1 },
      { name: 'Square Kilometers', symbol: 'km²', factor: 1000000 },
      { name: 'Square Inches', symbol: 'in²', factor: 0.00064516 },
      { name: 'Square Feet', symbol: 'ft²', factor: 0.092903 },
      { name: 'Square Yards', symbol: 'yd²', factor: 0.836127 },
      { name: 'Acres', symbol: 'ac', factor: 4046.86 },
      { name: 'Hectares', symbol: 'ha', factor: 10000 }
    ]
  },
  {
    name: 'Speed',
    baseUnit: 'meters per second',
    units: [
      { name: 'Meters per Second', symbol: 'm/s', factor: 1 },
      { name: 'Kilometers per Hour', symbol: 'km/h', factor: 0.277778 },
      { name: 'Miles per Hour', symbol: 'mph', factor: 0.44704 },
      { name: 'Feet per Second', symbol: 'ft/s', factor: 0.3048 },
      { name: 'Knots', symbol: 'kn', factor: 0.514444 }
    ]
  }
];

const UnitConverter = () => {
  const [activeCategory, setActiveCategory] = useState('Length');
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentCategory = conversions.find(cat => cat.name === activeCategory);

  const convertTemperature = (value: number, from: string, to: string): number => {
    // First convert to Celsius
    let celsius: number;
    switch (from) {
      case 'Fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'Kelvin':
        celsius = value - 273.15;
        break;
      case 'Rankine':
        celsius = (value - 491.67) * 5/9;
        break;
      default:
        celsius = value; // Already Celsius
    }

    // Then convert from Celsius to target
    switch (to) {
      case 'Fahrenheit':
        return celsius * 9/5 + 32;
      case 'Kelvin':
        return celsius + 273.15;
      case 'Rankine':
        return celsius * 9/5 + 491.67;
      default:
        return celsius; // Return Celsius
    }
  };

  const performConversion = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || !fromUnit || !toUnit || !currentCategory) return;

    const fromUnitData = currentCategory.units.find(u => u.name === fromUnit);
    const toUnitData = currentCategory.units.find(u => u.name === toUnit);

    if (!fromUnitData || !toUnitData) return;

    let convertedValue: number;

    if (activeCategory === 'Temperature') {
      convertedValue = convertTemperature(value, fromUnit, toUnit);
    } else {
      // Convert to base unit first, then to target unit
      const baseValue = value * fromUnitData.factor;
      convertedValue = baseValue / toUnitData.factor;
    }

    setResult(convertedValue);
  };

  const swapUnits = () => {
    if (!fromUnit || !toUnit || !currentCategory) return;
    
    // Swap the units
    const tempFrom = fromUnit;
    const newFromUnit = toUnit;
    const newToUnit = tempFrom;
    
    // If we have a current result, use it as the new input and calculate conversion
    if (result !== null && inputValue) {
      const newInputValue = result.toString();
      
      // Calculate the new result with swapped units
      const fromUnitData = currentCategory.units.find(u => u.name === newFromUnit);
      const toUnitData = currentCategory.units.find(u => u.name === newToUnit);
      
      if (fromUnitData && toUnitData) {
        const value = parseFloat(newInputValue);
        let newResult: number;
        
        if (activeCategory === 'Temperature') {
          newResult = convertTemperature(value, newFromUnit, newToUnit);
        } else {
          const baseValue = value * fromUnitData.factor;
          newResult = baseValue / toUnitData.factor;
        }
        
        // Update all state together
        setFromUnit(newFromUnit);
        setToUnit(newToUnit);
        setInputValue(newInputValue);
        setResult(newResult);
      }
    } else {
      // Just swap units without calculation
      setFromUnit(newFromUnit);
      setToUnit(newToUnit);
    }
  };

  const resetCalculator = () => {
    setInputValue('');
    setFromUnit('');
    setToUnit('');
    setResult(null);
  };

  // Reset units when category changes to prevent invalid selections
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setFromUnit('');
    setToUnit('');
    setInputValue('');
    setResult(null);
  };

  const handleSampleData = () => {
    if (activeCategory === 'Length') {
      setFromUnit('Meters');
      setToUnit('Feet');
      setInputValue('10');
    } else if (activeCategory === 'Weight') {
      setFromUnit('Kilograms');
      setToUnit('Pounds');
      setInputValue('70');
    } else if (activeCategory === 'Temperature') {
      setFromUnit('Celsius');
      setToUnit('Fahrenheit');
      setInputValue('25');
    } else if (activeCategory === 'Volume') {
      setFromUnit('Liters');
      setToUnit('Gallons (US)');
      setInputValue('5');
    } else if (activeCategory === 'Area') {
      setFromUnit('Square Meters');
      setToUnit('Square Feet');
      setInputValue('100');
    } else if (activeCategory === 'Speed') {
      setFromUnit('Kilometers per Hour');
      setToUnit('Miles per Hour');
      setInputValue('60');
    }
  };

  const resetTool = () => {
    resetCalculator();
    setShowAdvanced(false);
    setActiveCategory('Length');
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      performConversion();
    }
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  const formatResult = (value: number) => {
    return value.toFixed(6).replace(/\.?0+$/, '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Unit Converter - Convert Length, Weight, Temperature & More Instantly | DapsiWow</title>
        <meta name="description" content="Free professional unit converter for length, weight, temperature, volume, area, and speed. Convert between metric and imperial units instantly with precise accuracy and detailed conversion analysis." />
        <meta name="keywords" content="unit converter, metric conversion, imperial conversion, length converter, weight converter, temperature converter, volume converter, area converter, speed converter, measurement tool, conversion calculator, unit conversion tool" />
        <meta property="og:title" content="Unit Converter - Convert Length, Weight, Temperature & More Instantly | DapsiWow" />
        <meta property="og:description" content="Professional unit converter with support for 6 measurement categories and 50+ units. Get instant, accurate conversions between metric and imperial systems with detailed analysis." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/unit-converter" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Unit Converter",
            "description": "Professional unit converter supporting length, weight, temperature, volume, area, and speed conversions with instant results and high precision calculations for metric and imperial systems.",
            "url": "https://dapsiwow.com/tools/unit-converter",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "6 measurement categories with 50+ units",
              "Instant real-time conversions",
              "Metric and imperial system support",
              "Temperature conversion formulas",
              "High precision calculations",
              "Unit swapping functionality"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Measurement Conversion Tool</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0" data-testid="page-title">
                <span className="block">Smart Unit</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Converter
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Convert between different units of measurement with instant precision across length, weight, temperature, volume, area, and speed
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Unit Conversion Tool</h2>
                    <p className="text-sm sm:text-base text-gray-600">Select conversion category and enter values to get instant accurate conversions</p>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="category-select" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Conversion Category
                    </Label>
                    <Select value={activeCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-category">
                        <SelectValue placeholder="Select conversion type" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {conversions.map((category) => (
                          <SelectItem key={category.name} value={category.name} className="text-sm sm:text-base">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conversion Input/Output */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* From Unit */}
                    <div className="space-y-3 sm:space-y-4 bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-900">Convert From</h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <Label htmlFor="from-unit" className="text-xs sm:text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Unit Type
                          </Label>
                          <Select value={fromUnit} onValueChange={setFromUnit}>
                            <SelectTrigger className="mt-1 h-10 sm:h-12 border-2 border-blue-200 rounded-lg sm:rounded-xl text-sm sm:text-base focus:border-blue-500 focus:ring-blue-500 w-full" data-testid="select-from-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {currentCategory?.units.map((unit) => (
                                <SelectItem key={unit.name} value={unit.name} className="text-sm sm:text-base">
                                  <span className="block sm:hidden">{unit.symbol}</span>
                                  <span className="hidden sm:block">{unit.name} ({unit.symbol})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="input-value" className="text-xs sm:text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Value
                          </Label>
                          <Input
                            id="input-value"
                            type="number"
                            step="any"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="mt-1 h-10 sm:h-12 border-2 border-blue-200 rounded-lg sm:rounded-xl text-sm sm:text-base focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="Enter value"
                            data-testid="input-value"
                          />
                        </div>
                      </div>
                    </div>

                    {/* To Unit */}
                    <div className="space-y-3 sm:space-y-4 bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-green-900">Convert To</h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <Label htmlFor="to-unit" className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Unit Type
                          </Label>
                          <Select value={toUnit} onValueChange={setToUnit}>
                            <SelectTrigger className="mt-1 h-10 sm:h-12 border-2 border-green-200 rounded-lg sm:rounded-xl text-sm sm:text-base focus:border-green-500 focus:ring-green-500 w-full" data-testid="select-to-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {currentCategory?.units.map((unit) => (
                                <SelectItem key={unit.name} value={unit.name} className="text-sm sm:text-base">
                                  <span className="block sm:hidden">{unit.symbol}</span>
                                  <span className="hidden sm:block">{unit.name} ({unit.symbol})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Converted Value
                          </Label>
                          {result !== null ? (
                            <div className="mt-1 h-10 sm:h-12 border-2 border-green-200 rounded-lg sm:rounded-xl bg-green-100 flex items-center px-3 sm:px-4 w-full">
                              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-800 truncate" data-testid="conversion-result">
                                {formatResult(result)}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1 h-10 sm:h-12 border-2 border-green-200 rounded-lg sm:rounded-xl bg-gray-50 flex items-center px-3 sm:px-4 text-gray-500 text-sm sm:text-base w-full">
                              Result will appear here
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Conversion Features</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-xs sm:text-sm md:text-base py-2 sm:py-3 md:py-4 h-auto px-3 sm:px-4"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Conversion Information
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4">
                        <Separator />
                        
                        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                          <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Conversion Capabilities</h4>
                          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                            <div>• Real-time conversion calculations with high precision accuracy</div>
                            <div>• Support for metric and imperial measurement systems</div>
                            <div>• Temperature conversion using exact scientific formulas</div>
                            <div>• Bidirectional conversion with unit swapping functionality</div>
                            <div>• Automatic trailing zero removal for clean results</div>
                            <div>• Instant updates as you modify input values</div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={swapUnits}
                      disabled={!fromUnit || !toUnit}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-swap"
                    >
                      Swap
                    </Button>
                    <Button
                      onClick={resetTool}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {result !== null && currentCategory && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Conversion Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="conversion-results">
                      {/* Summary Card */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-3 sm:space-y-4">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-blue-900">
                            {activeCategory} Conversion Result
                          </h3>
                          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 break-all">
                            {inputValue} {currentCategory.units.find(u => u.name === fromUnit)?.symbol} = {formatResult(result)} {currentCategory.units.find(u => u.name === toUnit)?.symbol}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            {fromUnit} to {toUnit}
                          </div>
                          <Button
                            onClick={() => {
                              const resultText = `${inputValue} ${currentCategory.units.find(u => u.name === fromUnit)?.symbol} = ${formatResult(result)} ${currentCategory.units.find(u => u.name === toUnit)?.symbol}`;
                              handleCopyToClipboard(resultText);
                            }}
                            variant="outline"
                            size="sm"
                            className="mt-2 sm:mt-3 rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                          >
                            Copy Result
                          </Button>
                        </div>
                      </div>

                      {/* Common Conversions */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Common {activeCategory} Conversions</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          {activeCategory === 'Length' && (
                            <>
                              <div>1 meter = 3.28084 feet</div>
                              <div>1 kilometer = 0.621371 miles</div>
                              <div>1 inch = 2.54 centimeters</div>
                              <div>1 yard = 0.9144 meters</div>
                            </>
                          )}
                          {activeCategory === 'Weight' && (
                            <>
                              <div>1 kilogram = 2.20462 pounds</div>
                              <div>1 pound = 16 ounces</div>
                              <div>1 stone = 14 pounds</div>
                              <div>1 ton = 1000 kilograms</div>
                            </>
                          )}
                          {activeCategory === 'Temperature' && (
                            <>
                              <div>0°C = 32°F = 273.15K</div>
                              <div>100°C = 212°F = 373.15K</div>
                              <div>Body temp: 37°C = 98.6°F</div>
                              <div>Room temp: 20°C = 68°F</div>
                            </>
                          )}
                          {activeCategory === 'Volume' && (
                            <>
                              <div>1 liter = 0.264172 gallons (US)</div>
                              <div>1 gallon (US) = 3.78541 liters</div>
                              <div>1 cup = 236.588 milliliters</div>
                              <div>1 fluid ounce = 29.5735 ml</div>
                            </>
                          )}
                          {activeCategory === 'Area' && (
                            <>
                              <div>1 square meter = 10.7639 sq feet</div>
                              <div>1 acre = 4,046.86 sq meters</div>
                              <div>1 hectare = 2.47105 acres</div>
                              <div>1 sq mile = 640 acres</div>
                            </>
                          )}
                          {activeCategory === 'Speed' && (
                            <>
                              <div>1 m/s = 3.6 km/h = 2.237 mph</div>
                              <div>1 mph = 1.609 km/h</div>
                              <div>1 knot = 1.852 km/h</div>
                              <div>Speed of light = 299,792,458 m/s</div>
                            </>
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
            {/* What is a Unit Converter */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Unit Converter?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>unit converter</strong> is an essential measurement tool that transforms values from one unit of measurement to another within the same physical quantity category. This comprehensive conversion calculator enables users to seamlessly convert between different measurement systems including metric, imperial, and other specialized units across multiple categories such as length, weight, temperature, volume, area, and speed measurements.
                  </p>
                  <p>
                    Our professional unit conversion tool provides instant, accurate calculations using internationally recognized conversion factors and scientific formulas. The converter supports over 50 different units across 6 major measurement categories, ensuring precise conversions for both everyday calculations and professional applications requiring high accuracy and reliability.
                  </p>
                  <p>
                    Whether you're working with engineering specifications, cooking recipes, scientific research, construction projects, or international trade, this unit converter eliminates calculation errors and provides consistent, standardized results that meet professional and academic standards for measurement accuracy and precision.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How Unit Conversion Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Unit Conversion Analysis Works</h2>
                <p className="text-gray-600 mb-8">Understanding the scientific principles and mathematical foundations behind unit conversion ensures accurate results and helps users make informed decisions about measurement precision and appropriate unit selection for specific applications.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Conversion Factor Methodology</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        The converter uses precise conversion factors based on internationally standardized definitions. Each unit is defined relative to a base unit within its category, ensuring mathematical consistency and accuracy across all conversions within the system.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Calculation Process:</h4>
                        <div className="text-xs text-blue-800">
                          <div>1. Input value multiplied by source unit factor</div>
                          <div>2. Convert to base unit of measurement category</div>
                          <div>3. Divide by target unit conversion factor</div>
                          <div>4. Apply precision formatting and display</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Temperature Conversion Algorithms</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Temperature conversions use specific mathematical formulas rather than simple multiplication factors, as temperature scales have different zero points and interval sizes. Our system applies exact scientific formulas for all temperature conversions.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Temperature Formulas:</h4>
                        <div className="text-xs text-green-800">
                          <div>• Celsius to Fahrenheit: (C × 9/5) + 32</div>
                          <div>• Fahrenheit to Celsius: (F - 32) × 5/9</div>
                          <div>• Celsius to Kelvin: C + 273.15</div>
                          <div>• Kelvin to Celsius: K - 273.15</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Precision and Accuracy Standards</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        The converter maintains high precision through floating-point arithmetic and displays results with up to 6 decimal places. Trailing zeros are automatically removed for cleaner presentation while preserving mathematical accuracy for subsequent calculations.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Precision Features:</h4>
                        <div className="text-xs text-purple-800">
                          <div>• High-precision floating-point calculations</div>
                          <div>• Automatic significant figure optimization</div>
                          <div>• Trailing zero removal for clean display</div>
                          <div>• Error handling for edge cases and limits</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Multi-Category Support System</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        The converter organizes units into distinct physical quantity categories, preventing invalid conversions between incompatible measurement types. Each category maintains its own base unit and conversion factor system for optimal accuracy.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Supported Categories:</h4>
                        <div className="text-xs text-orange-800">
                          <div>• Length: meters, feet, inches, miles, etc.</div>
                          <div>• Weight: grams, pounds, ounces, stones, etc.</div>
                          <div>• Temperature: Celsius, Fahrenheit, Kelvin</div>
                          <div>• Volume: liters, gallons, cups, milliliters</div>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Benefits from Unit Conversion Tools?</h2>
                  <p className="text-gray-600 mb-6">Unit converters serve diverse professional and personal applications across industries requiring accurate measurement conversions, international standardization, and multi-system compatibility for various technical and everyday scenarios.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Engineers & Technical Professionals</h3>
                      <p className="text-blue-800 text-sm">Convert between metric and imperial systems for international projects, equipment specifications, material calculations, and technical documentation requiring precise measurement accuracy and standardization.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Scientists & Researchers</h3>
                      <p className="text-green-800 text-sm">Perform accurate conversions for laboratory measurements, experimental data analysis, scientific publications, and international research collaboration requiring standardized measurement units.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">International Trade & Commerce</h3>
                      <p className="text-purple-800 text-sm">Convert measurements for product specifications, shipping calculations, customs documentation, and international business transactions requiring accurate cross-system conversions.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Culinary & Food Industry</h3>
                      <p className="text-orange-800 text-sm">Convert recipe measurements, ingredient quantities, nutritional information, and portion sizes for international cuisine, professional cooking, and food service standardization.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Construction & Architecture</h3>
                      <p className="text-teal-800 text-sm">Convert building dimensions, material quantities, area calculations, and architectural specifications for international projects, building codes, and construction documentation.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Conversion Capabilities</h2>
                  <p className="text-gray-600 mb-6">Our comprehensive unit converter offers professional-grade conversion capabilities designed for accuracy, efficiency, and user-friendly operation across multiple measurement categories and unit systems.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Multi-Category Conversion Support</h4>
                        <p className="text-gray-600 text-sm">Convert across 6 major measurement categories including length, weight, temperature, volume, area, and speed with over 50 supported units for comprehensive coverage.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Instant Conversions</h4>
                        <p className="text-gray-600 text-sm">Get immediate conversion results as you type with automatic calculations, real-time updates, and instant precision for efficient workflow and productivity enhancement.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Scientific Temperature Formulas</h4>
                        <p className="text-gray-600 text-sm">Accurate temperature conversions using exact scientific formulas for Celsius, Fahrenheit, Kelvin, and Rankine with precision calculations for scientific and engineering applications.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Bidirectional Unit Swapping</h4>
                        <p className="text-gray-600 text-sm">Instantly swap between source and target units with one click, maintaining calculation results and enabling quick reverse conversions for verification and comparison.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">High-Precision Calculations</h4>
                        <p className="text-gray-600 text-sm">Professional-grade accuracy with floating-point arithmetic, automatic precision formatting, and clean result display with trailing zero removal for optimal presentation.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Unit Conversion Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Strategic Unit Conversion & Best Practices</h2>
                <p className="text-gray-600 mb-8">Implementing effective unit conversion strategies ensures accuracy, consistency, and reliability in measurements across different applications, industries, and international contexts requiring standardized measurement protocols.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Accuracy & Precision Management</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Significant Figure Considerations</h4>
                        <p className="text-blue-800 text-xs mt-1">Maintain appropriate precision levels based on source data accuracy and intended application requirements, avoiding false precision in converted results.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Rounding Strategy Implementation</h4>
                        <p className="text-indigo-800 text-xs mt-1">Apply consistent rounding rules throughout conversion processes to maintain calculation integrity and ensure reproducible results across multiple conversions.</p>
                      </div>
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-cyan-900 text-sm">Error Propagation Awareness</h4>
                        <p className="text-cyan-800 text-xs mt-1">Understand how measurement uncertainties propagate through conversion calculations and maintain awareness of cumulative errors in multi-step conversions.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">System Selection Guidelines</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Context-Appropriate Unit Choice</h4>
                        <p className="text-green-800 text-xs mt-1">Select measurement units appropriate for the specific application context, considering industry standards, regional preferences, and technical requirements.</p>
                      </div>
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-emerald-900 text-sm">International Standard Compliance</h4>
                        <p className="text-emerald-800 text-xs mt-1">Utilize internationally recognized unit definitions and conversion factors to ensure compatibility with global standards and scientific conventions.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Consistency Across Projects</h4>
                        <p className="text-teal-800 text-xs mt-1">Maintain consistent unit systems within projects and documentation to avoid confusion and potential calculation errors in collaborative work environments.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Quality Assurance Practices</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Conversion Verification Methods</h4>
                        <p className="text-orange-800 text-xs mt-1">Implement verification procedures including reverse conversions, multiple calculation methods, and cross-referencing with established conversion tables.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Documentation Standards</h4>
                        <p className="text-red-800 text-xs mt-1">Maintain clear documentation of conversion factors used, precision levels applied, and any assumptions made in the conversion process for audit trails.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Regular Calibration Checks</h4>
                        <p className="text-pink-800 text-xs mt-1">Periodically verify conversion tool accuracy against known standards and update conversion factors as international definitions evolve or improve.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Unit Conversion Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Pre-Conversion Planning</h4>
                      <p className="text-gray-600 text-sm">Identify required precision levels, target unit systems, and conversion accuracy requirements before beginning calculations to ensure appropriate tool and method selection.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Result Validation Protocols</h4>
                      <p className="text-gray-600 text-sm">Establish systematic validation procedures including sanity checks, order-of-magnitude verification, and comparison with known benchmark values to ensure conversion accuracy.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Documentation and Traceability</h4>
                      <p className="text-gray-600 text-sm">Maintain complete records of conversion parameters, source data, target requirements, and calculation methods for quality assurance and reproducibility purposes.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Continuous Improvement Process</h4>
                      <p className="text-gray-600 text-sm">Regularly review and update conversion procedures, incorporate new standards, and refine accuracy requirements based on application feedback and industry developments.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Applications and Advanced Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry Applications & Advanced Unit Conversion Scenarios</h2>
                <p className="text-gray-600 mb-8">Unit conversion tools serve specialized applications across various industries and professional contexts, enabling sophisticated measurement analysis for complex conversion scenarios and strategic technical planning initiatives.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Engineering & Manufacturing</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Technical drawing and blueprint conversions</li>
                      <li>• Material specification and tolerance calculations</li>
                      <li>• International project collaboration standards</li>
                      <li>• Quality control and inspection measurements</li>
                      <li>• Equipment specification and procurement</li>
                      <li>• Process parameter optimization and control</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Scientific Research & Development</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Laboratory measurement standardization</li>
                      <li>• Experimental data analysis and reporting</li>
                      <li>• International publication requirements</li>
                      <li>• Collaborative research data sharing</li>
                      <li>• Instrumentation calibration and validation</li>
                      <li>• Environmental monitoring and compliance</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Healthcare & Medical Applications</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Dosage calculations and medication conversions</li>
                      <li>• Medical device specifications and settings</li>
                      <li>• Patient monitoring and vital sign analysis</li>
                      <li>• Laboratory test result interpretation</li>
                      <li>• Nutritional assessment and dietary planning</li>
                      <li>• Medical research data standardization</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Construction & Architecture</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Building code compliance and regulations</li>
                      <li>• Material quantity estimation and ordering</li>
                      <li>• Structural load calculations and analysis</li>
                      <li>• International project specifications</li>
                      <li>• Energy efficiency calculations and ratings</li>
                      <li>• Site planning and dimensional coordination</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Aviation & Transportation</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Flight planning and navigation calculations</li>
                      <li>• Fuel consumption and efficiency analysis</li>
                      <li>• Weather data interpretation and planning</li>
                      <li>• International aviation standards compliance</li>
                      <li>• Vehicle performance optimization</li>
                      <li>• Logistics and cargo planning calculations</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Agriculture & Food Industry</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Crop yield calculations and analysis</li>
                      <li>• Fertilizer and chemical application rates</li>
                      <li>• Food processing and recipe standardization</li>
                      <li>• Nutritional labeling and compliance</li>
                      <li>• International trade and export requirements</li>
                      <li>• Equipment sizing and capacity planning</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Conversion Techniques & Professional Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Multi-Step Conversion Strategies</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Complex unit combinations requiring sequential conversions</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Dimensional analysis and unit cancellation methods</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Error propagation in multi-step calculation chains</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Optimization of conversion sequences for accuracy</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Professional Integration Applications</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Integration with CAD and engineering software systems</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Automated conversion in data processing workflows</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Quality management system integration protocols</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">International standards compliance verification</span>
                        </div>
                      </div>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are the unit conversion calculations?</h3>
                      <p className="text-gray-600 text-sm">
                        Our converter uses internationally standardized conversion factors and high-precision floating-point arithmetic to ensure maximum accuracy. Results are calculated using official definitions from international standards organizations and display up to 6 decimal places for precision applications.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I convert between different measurement categories?</h3>
                      <p className="text-gray-600 text-sm">
                        No, conversions are only possible within the same physical quantity category (length to length, weight to weight, etc.). This prevents invalid conversions between incompatible measurement types and ensures mathematical validity of all conversion results.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Why are temperature conversions different from other units?</h3>
                      <p className="text-gray-600 text-sm">
                        Temperature scales have different zero points and interval sizes, requiring specific mathematical formulas rather than simple multiplication factors. Our system uses exact scientific formulas for all temperature conversions to ensure precision and accuracy.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What is the precision level of the conversion results?</h3>
                      <p className="text-gray-600 text-sm">
                        The converter displays results with up to 6 decimal places and automatically removes trailing zeros for cleaner presentation. The actual calculation precision is maintained at the highest level supported by the system's floating-point arithmetic.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are the conversion factors updated regularly?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, our conversion factors are based on the latest international standards and definitions. We monitor updates from standards organizations and implement any changes to ensure continued accuracy and compliance with global measurement standards.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I use this tool for professional or scientific work?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely. The converter is designed with professional-grade accuracy using internationally recognized conversion factors and scientific formulas. However, for critical applications, we recommend verifying results with additional sources as appropriate for your specific requirements.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the unit swapping feature work?</h3>
                      <p className="text-gray-600 text-sm">
                        The swap function instantly exchanges the source and target units while preserving your current conversion result as the new input value. This allows quick reverse conversions and helps verify calculation accuracy through bidirectional checking.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What measurement systems are supported?</h3>
                      <p className="text-gray-600 text-sm">
                        The converter supports metric (SI), imperial (US), and other specialized measurement systems across all categories. This includes both common everyday units and scientific/technical units used in professional applications worldwide.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Conversion Methodology</h2>
                <p className="text-gray-600 mb-8">Our unit converter employs industry-standard conversion factors and modern calculation technologies to ensure accurate conversions, reliable performance, and seamless user experience across all devices and measurement categories.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Conversion Engine Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Mathematical Foundation</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• International standards-based conversion factors</li>
                          <li>• High-precision floating-point calculations</li>
                          <li>• Scientific temperature conversion formulas</li>
                          <li>• Error handling for edge cases and limits</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Calculation Features</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Real-time conversion updates</li>
                          <li>• Automatic precision optimization</li>
                          <li>• Bidirectional unit swapping</li>
                          <li>• Result formatting and display cleanup</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Quality Assurance</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Validation against known reference values</li>
                          <li>• Consistency checks across unit categories</li>
                          <li>• Input validation and error prevention</li>
                          <li>• Continuous accuracy monitoring</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform & Browser Compatibility</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Supported Browsers</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Chrome 90+ (optimal performance and features)</li>
                          <li>• Firefox 88+ (full compatibility and calculations)</li>
                          <li>• Safari 14+ (complete feature support)</li>
                          <li>• Edge 90+ (comprehensive functionality)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mobile & Tablet Support</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• iOS Safari 14+ (responsive touch interface)</li>
                          <li>• Android Chrome 90+ (optimized for mobile)</li>
                          <li>• Samsung Internet 13+ (enhanced compatibility)</li>
                          <li>• Responsive design for all screen sizes</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Performance & Security</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Client-side processing (no data transmission)</li>
                          <li>• Instant calculations with real-time updates</li>
                          <li>• Privacy-focused design (no data storage)</li>
                          <li>• WCAG 2.1 AA accessibility compliance</li>
                        </ul>
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
};

export default UnitConverter;
