import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    if (!fromUnit || !toUnit) return;
    
    const tempFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempFrom);
    
    if (result !== null && inputValue) {
      setInputValue(result.toString());
      performConversion();
    }
  };

  const resetCalculator = () => {
    setInputValue('');
    setFromUnit('');
    setToUnit('');
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
        <meta name="description" content="Free professional unit converter for length, weight, temperature. Convert between metric and imperial units instantly." />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Measurement Conversion Tool</span>
              </div>
              <h1 className="text-6xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="page-title">
                <span className="block">Unit Converter</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Convert between different units of measurement with instant precision across length, weight, and temperature
              </p>
            </div>
          </div>
        </section>

        {/* Main Tool Section */}
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl border border-gray-200 rounded-3xl p-8">
            
            {/* Category Selection */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-center mb-6">Unit Converter Tool</h2>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  CONVERSION CATEGORY
                </label>
                <select 
                  value={activeCategory} 
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full h-12 border-2 border-gray-200 rounded-xl text-lg px-4 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="select-category"
                >
                  {conversions.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversion Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* From Unit */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">From</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-2">Unit</label>
                    <select 
                      value={fromUnit} 
                      onChange={(e) => setFromUnit(e.target.value)}
                      className="w-full h-12 border-2 border-blue-200 rounded-xl px-4 focus:border-blue-500"
                      data-testid="select-from-unit"
                    >
                      <option value="">Select unit</option>
                      {currentCategory?.units.map((unit) => (
                        <option key={unit.name} value={unit.name}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-2">Value</label>
                    <input
                      type="number"
                      step="any"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full h-12 border-2 border-blue-200 rounded-xl px-4 text-lg focus:border-blue-500"
                      placeholder="Enter value"
                      data-testid="input-value"
                    />
                  </div>
                </div>
              </div>

              {/* To Unit */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-4">To</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">Unit</label>
                    <select 
                      value={toUnit} 
                      onChange={(e) => setToUnit(e.target.value)}
                      className="w-full h-12 border-2 border-green-200 rounded-xl px-4 focus:border-green-500"
                      data-testid="select-to-unit"
                    >
                      <option value="">Select unit</option>
                      {currentCategory?.units.map((unit) => (
                        <option key={unit.name} value={unit.name}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">Result</label>
                    {result !== null ? (
                      <div className="h-12 border-2 border-green-200 rounded-xl bg-green-100 flex items-center px-4">
                        <div className="text-2xl font-bold text-green-800" data-testid="conversion-result">
                          {formatResult(result)}
                        </div>
                      </div>
                    ) : (
                      <div className="h-12 border-2 border-green-200 rounded-xl bg-gray-50 flex items-center px-4 text-gray-500">
                        Result will appear here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={performConversion}
                disabled={!inputValue || !fromUnit || !toUnit}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg transition-all"
                data-testid="button-convert"
              >
                Convert
              </button>
              <button
                onClick={swapUnits}
                disabled={!fromUnit || !toUnit}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 font-semibold rounded-xl transition-all"
                data-testid="button-swap"
              >
                ⇄ Swap
              </button>
              <button
                onClick={resetCalculator}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all"
                data-testid="button-reset"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Common Conversions */}
          {currentCategory && (
            <div className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Common {currentCategory.name} Conversions</h3>
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnitConverter;