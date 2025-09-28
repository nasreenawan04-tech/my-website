import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConversionUnit {
  name: string;
  symbol: string;
  factor: number;
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
      { name: 'Miles', symbol: 'mi', factor: 1609.344 }
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
      { name: 'Pounds', symbol: 'lb', factor: 453.592 }
    ]
  },
  {
    name: 'Temperature',
    baseUnit: 'celsius',
    units: [
      { name: 'Celsius', symbol: '°C', factor: 1 },
      { name: 'Fahrenheit', symbol: '°F', factor: 1 },
      { name: 'Kelvin', symbol: 'K', factor: 1 }
    ]
  }
];

const UnitConverter = () => {
  const [activeCategory, setActiveCategory] = useState('Length');
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const currentCategory = conversions.find(cat => cat.name === activeCategory);

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number;
    switch (from) {
      case 'Fahrenheit':
        celsius = (value - 32) * 5/9;
        break;
      case 'Kelvin':
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }

    switch (to) {
      case 'Fahrenheit':
        return celsius * 9/5 + 32;
      case 'Kelvin':
        return celsius + 273.15;
      default:
        return celsius;
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
      const baseValue = value * fromUnitData.factor;
      convertedValue = baseValue / toUnitData.factor;
    }

    setResult(convertedValue);
  };

  const swapUnits = () => {
    if (!fromUnit || !toUnit || !currentCategory) return;
    
    const tempFrom = fromUnit;
    const newFromUnit = toUnit;
    const newToUnit = tempFrom;
    
    if (result !== null && inputValue) {
      const newInputValue = result.toString();
      
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
        
        setFromUnit(newFromUnit);
        setToUnit(newToUnit);
        setInputValue(newInputValue);
        setResult(newResult);
      }
    } else {
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

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setFromUnit('');
    setToUnit('');
    setInputValue('');
    setResult(null);
  };

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
        <title>Unit Converter - Convert Length, Weight, Temperature & More | DapsiWow</title>
        <meta name="description" content="Free professional unit converter for length, weight, temperature, volume, area, and speed. Convert between metric and imperial units instantly." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Measurement Conversion Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="page-title">
                <span className="block">Unit Converter</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Convert between different units of measurement with instant precision across length, weight, temperature, volume, area, and speed
              </p>
            </div>
          </div>
        </section>

        {/* Test Section */}
        <div className="bg-yellow-300 p-8 text-center">
          <h2 className="text-2xl font-bold">TEST SECTION - If you see this, the component is working</h2>
        </div>

        {/* Main Tool Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden p-8">
            <div className="mb-6">
              <h2 className="text-2xl text-center font-bold">
                Select Conversion Type
              </h2>
            </div>
            <div>
              {/* Category Selection */}
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    Conversion Category
                  </Label>
                  <Select value={activeCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-12 sm:h-14 border-2 border-gray-200 rounded-xl text-base sm:text-lg" data-testid="select-category">
                      <SelectValue placeholder="Select conversion type" />
                    </SelectTrigger>
                    <SelectContent>
                      {conversions.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conversion Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* From Unit */}
                  <div className="space-y-4 bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900">From</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-blue-800">Unit</Label>
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger className="mt-1 h-12 border-2 border-blue-200 rounded-xl" data-testid="select-from-unit">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentCategory?.units.map((unit) => (
                              <SelectItem key={unit.name} value={unit.name}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-blue-800">Value</Label>
                        <Input
                          type="number"
                          step="any"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="mt-1 h-12 border-2 border-blue-200 rounded-xl"
                          placeholder="Enter value"
                          data-testid="input-value"
                        />
                      </div>
                    </div>
                  </div>

                  {/* To Unit */}
                  <div className="space-y-4 bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-900">To</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-green-800">Unit</Label>
                        <Select value={toUnit} onValueChange={setToUnit}>
                          <SelectTrigger className="mt-1 h-12 border-2 border-green-200 rounded-xl" data-testid="select-to-unit">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentCategory?.units.map((unit) => (
                              <SelectItem key={unit.name} value={unit.name}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-green-800">Result</Label>
                        {result !== null ? (
                          <div className="mt-1 h-12 border-2 border-green-200 rounded-xl bg-green-100 flex items-center px-4">
                            <div className="text-xl font-bold text-green-800" data-testid="conversion-result">
                              {formatResult(result)}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 h-12 border-2 border-green-200 rounded-xl bg-gray-50 flex items-center px-4 text-gray-500">
                            Result will appear here
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    onClick={performConversion}
                    disabled={!inputValue || !fromUnit || !toUnit}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl"
                    data-testid="button-convert"
                  >
                    Convert
                  </Button>
                  <Button
                    onClick={swapUnits}
                    disabled={!fromUnit || !toUnit}
                    variant="outline"
                    className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl"
                    data-testid="button-swap"
                  >
                    ⇄ Swap
                  </Button>
                  <Button
                    onClick={resetCalculator}
                    variant="outline"
                    className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl"
                    data-testid="button-reset"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Common Conversions */}
          {currentCategory && (
            <div className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Common {currentCategory.name} Conversions</h3>
              </div>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {currentCategory.name === 'Length' && (
                    <>
                      <div>1 meter = 3.28084 feet</div>
                      <div>1 kilometer = 0.621371 miles</div>
                      <div>1 inch = 2.54 centimeters</div>
                      <div>1 yard = 0.9144 meters</div>
                    </>
                  )}
                  {currentCategory.name === 'Weight' && (
                    <>
                      <div>1 kilogram = 2.20462 pounds</div>
                      <div>1 pound = 16 ounces</div>
                      <div>1 ounce = 28.3495 grams</div>
                      <div>1 ton = 1000 kilograms</div>
                    </>
                  )}
                  {currentCategory.name === 'Temperature' && (
                    <>
                      <div>0°C = 32°F = 273.15K</div>
                      <div>100°C = 212°F = 373.15K</div>
                      <div>37°C = 98.6°F (body temperature)</div>
                      <div>-40°C = -40°F</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnitConverter;