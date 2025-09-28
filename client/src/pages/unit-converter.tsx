import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Helmet>
        <title>Unit Converter - Convert Length, Weight, Temperature & More | DapsiWow</title>
        <meta name="description" content="Free online unit converter for length, weight, temperature, volume, area, and speed. Convert between metric and imperial units instantly with accurate results." />
        <meta name="keywords" content="unit converter, metric conversion, imperial conversion, length converter, weight converter, temperature converter, volume converter" />
        <link rel="canonical" href="https://dapsiwow.com/tools/unit-converter" />
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Unit Converter
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Convert between different units of measurement including length, weight, temperature, volume, area, and speed. 
              Get accurate conversions instantly.
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Select Conversion Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                  {conversions.map((category) => (
                    <TabsTrigger 
                      key={category.name} 
                      value={category.name}
                      data-testid={`tab-${category.name.toLowerCase()}`}
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {conversions.map((category) => (
                  <TabsContent key={category.name} value={category.name}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* From Unit */}
                        <div className="space-y-4">
                          <Label htmlFor="from-unit" className="text-lg font-semibold">
                            From
                          </Label>
                          <Select value={fromUnit} onValueChange={setFromUnit}>
                            <SelectTrigger data-testid="select-from-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {category.units.map((unit) => (
                                <SelectItem key={unit.name} value={unit.name}>
                                  {unit.name} ({unit.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            id="input-value"
                            type="number"
                            placeholder="Enter value"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            data-testid="input-value"
                          />
                        </div>

                        {/* To Unit */}
                        <div className="space-y-4">
                          <Label htmlFor="to-unit" className="text-lg font-semibold">
                            To
                          </Label>
                          <Select value={toUnit} onValueChange={setToUnit}>
                            <SelectTrigger data-testid="select-to-unit">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {category.units.map((unit) => (
                                <SelectItem key={unit.name} value={unit.name}>
                                  {unit.name} ({unit.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {result !== null && (
                            <div 
                              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                              data-testid="conversion-result"
                            >
                              <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                                {result.toFixed(6).replace(/\.?0+$/, '')}
                              </div>
                              <div className="text-sm text-green-600 dark:text-green-400">
                                {category.units.find(u => u.name === toUnit)?.symbol}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={performConversion}
                          disabled={!inputValue || !fromUnit || !toUnit}
                          className="px-8"
                          data-testid="button-convert"
                        >
                          Convert
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={swapUnits}
                          disabled={!fromUnit || !toUnit}
                          data-testid="button-swap"
                        >
                          ⇄ Swap
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={resetCalculator}
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>

                      {/* Quick Examples */}
                      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Common {category.name} Conversions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                          {category.name === 'Length' && (
                            <>
                              <div>1 meter = 3.28084 feet</div>
                              <div>1 kilometer = 0.621371 miles</div>
                              <div>1 inch = 2.54 centimeters</div>
                              <div>1 yard = 0.9144 meters</div>
                            </>
                          )}
                          {category.name === 'Weight' && (
                            <>
                              <div>1 kilogram = 2.20462 pounds</div>
                              <div>1 pound = 16 ounces</div>
                              <div>1 stone = 14 pounds</div>
                              <div>1 ton = 1000 kilograms</div>
                            </>
                          )}
                          {category.name === 'Temperature' && (
                            <>
                              <div>0°C = 32°F = 273.15K</div>
                              <div>100°C = 212°F = 373.15K</div>
                              <div>Body temp: 37°C = 98.6°F</div>
                              <div>Room temp: 20°C = 68°F</div>
                            </>
                          )}
                          {category.name === 'Volume' && (
                            <>
                              <div>1 liter = 0.264172 gallons (US)</div>
                              <div>1 gallon (US) = 3.78541 liters</div>
                              <div>1 cup = 236.588 milliliters</div>
                              <div>1 fluid ounce = 29.5735 ml</div>
                            </>
                          )}
                          {category.name === 'Area' && (
                            <>
                              <div>1 square meter = 10.7639 sq feet</div>
                              <div>1 acre = 4,046.86 sq meters</div>
                              <div>1 hectare = 2.47105 acres</div>
                              <div>1 sq mile = 640 acres</div>
                            </>
                          )}
                          {category.name === 'Speed' && (
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
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>About Unit Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Unit conversion is the process of changing one unit of measurement to another. 
                  This tool supports conversion between metric and imperial systems across multiple 
                  measurement categories. All conversions use internationally recognized conversion factors.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precision & Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our converter uses precise conversion factors and displays results with up to 6 decimal places. 
                  Trailing zeros are automatically removed for cleaner results. Temperature conversions 
                  use exact formulas for maximum accuracy.
                </p>
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