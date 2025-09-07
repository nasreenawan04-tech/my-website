import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Wine, Flame, Info } from 'lucide-react';

interface DrinkPreset {
  name: string;
  calories: number;
  servingSize: string;
  alcoholContent: number;
}

interface AlcoholResult {
  totalCalories: number;
  alcoholCalories: number;
  nonAlcoholCalories: number;
  numberOfDrinks: number;
  drinkType: string;
  totalAlcoholGrams: number;
}

const AlcoholCalorieCalculator = () => {
  const [drinkType, setDrinkType] = useState('beer');
  const [customDrink, setCustomDrink] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servingUnit, setServingUnit] = useState('oz');
  const [alcoholContent, setAlcoholContent] = useState('');
  const [numberOfDrinks, setNumberOfDrinks] = useState('1');
  const [result, setResult] = useState<AlcoholResult | null>(null);

  // Common alcoholic beverages with typical values
  const drinkPresets: Record<string, DrinkPreset[]> = {
    beer: [
      { name: 'Light Beer', calories: 103, servingSize: '12 oz', alcoholContent: 4.2 },
      { name: 'Regular Beer', calories: 153, servingSize: '12 oz', alcoholContent: 5.0 },
      { name: 'IPA/Craft Beer', calories: 180, servingSize: '12 oz', alcoholContent: 6.5 },
      { name: 'Stout/Porter', calories: 210, servingSize: '12 oz', alcoholContent: 7.0 }
    ],
    wine: [
      { name: 'White Wine', calories: 121, servingSize: '5 oz', alcoholContent: 12.0 },
      { name: 'Red Wine', calories: 125, servingSize: '5 oz', alcoholContent: 13.0 },
      { name: 'Rosé Wine', calories: 115, servingSize: '5 oz', alcoholContent: 11.5 },
      { name: 'Champagne/Sparkling', calories: 96, servingSize: '5 oz', alcoholContent: 11.0 },
      { name: 'Dessert Wine', calories: 165, servingSize: '3.5 oz', alcoholContent: 14.0 }
    ],
    spirits: [
      { name: 'Vodka (80 proof)', calories: 97, servingSize: '1.5 oz', alcoholContent: 40.0 },
      { name: 'Whiskey (80 proof)', calories: 97, servingSize: '1.5 oz', alcoholContent: 40.0 },
      { name: 'Rum (80 proof)', calories: 97, servingSize: '1.5 oz', alcoholContent: 40.0 },
      { name: 'Gin (80 proof)', calories: 97, servingSize: '1.5 oz', alcoholContent: 40.0 },
      { name: 'Tequila (80 proof)', calories: 97, servingSize: '1.5 oz', alcoholContent: 40.0 }
    ],
    cocktails: [
      { name: 'Martini', calories: 124, servingSize: '2.25 oz', alcoholContent: 35.0 },
      { name: 'Margarita', calories: 168, servingSize: '4 oz', alcoholContent: 18.0 },
      { name: 'Mojito', calories: 143, servingSize: '6 oz', alcoholContent: 13.0 },
      { name: 'Piña Colada', calories: 245, servingSize: '6 oz', alcoholContent: 10.0 },
      { name: 'Cosmopolitan', calories: 146, servingSize: '3 oz', alcoholContent: 22.0 },
      { name: 'Manhattan', calories: 130, servingSize: '2.5 oz', alcoholContent: 30.0 }
    ]
  };

  const drinkTypeOptions = [
    { value: 'beer', label: '🍺 Beer' },
    { value: 'wine', label: '🍷 Wine' },
    { value: 'spirits', label: '🥃 Spirits' },
    { value: 'cocktails', label: '🍸 Cocktails' },
    { value: 'custom', label: '🔧 Custom Drink' }
  ];

  const servingUnitOptions = [
    { value: 'oz', label: 'fl oz' },
    { value: 'ml', label: 'ml' },
    { value: 'cl', label: 'cl' },
    { value: 'l', label: 'L' }
  ];

  const calculateCalories = () => {
    let calories = 0;
    let alcoholPercent = 0;
    let serving = 0;

    if (drinkType === 'custom') {
      calories = parseFloat(customDrink) || 0;
      alcoholPercent = parseFloat(alcoholContent) || 0;
      serving = parseFloat(servingSize) || 0;
    } else {
      // Find the selected preset drink
      const presets = drinkPresets[drinkType] || [];
      const selectedPreset = presets[0]; // Default to first option for now
      
      if (selectedPreset) {
        calories = selectedPreset.calories;
        alcoholPercent = selectedPreset.alcoholContent;
        // Extract serving size number from string like "12 oz"
        const servingMatch = selectedPreset.servingSize.match(/(\d+(?:\.\d+)?)/);
        serving = servingMatch ? parseFloat(servingMatch[1]) : 0;
      }

      // Override with custom values if provided
      if (servingSize) {
        serving = parseFloat(servingSize);
        // Convert serving to oz if needed
        if (servingUnit === 'ml') serving = serving * 0.033814;
        else if (servingUnit === 'cl') serving = serving * 0.33814;
        else if (servingUnit === 'l') serving = serving * 33.814;
      }
      
      if (alcoholContent) {
        alcoholPercent = parseFloat(alcoholContent);
      }
    }

    const drinks = parseInt(numberOfDrinks) || 1;

    if (calories > 0 && serving > 0) {
      // Calculate alcohol calories (alcohol has 7 calories per gram)
      const alcoholVolumeOz = serving * (alcoholPercent / 100);
      const alcoholGrams = alcoholVolumeOz * 29.5735 * 0.789; // Convert to grams (density of ethanol)
      const alcoholCalories = alcoholGrams * 7;
      
      // Non-alcohol calories (sugars, carbs, etc.)
      const nonAlcoholCalories = Math.max(0, calories - alcoholCalories);
      
      const totalCalories = calories * drinks;
      const totalAlcoholCalories = alcoholCalories * drinks;
      const totalNonAlcoholCalories = nonAlcoholCalories * drinks;
      const totalAlcoholGrams = alcoholGrams * drinks;

      setResult({
        totalCalories: Math.round(totalCalories),
        alcoholCalories: Math.round(totalAlcoholCalories),
        nonAlcoholCalories: Math.round(totalNonAlcoholCalories),
        numberOfDrinks: drinks,
        drinkType: drinkTypeOptions.find(d => d.value === drinkType)?.label || drinkType,
        totalAlcoholGrams: Math.round(totalAlcoholGrams * 10) / 10
      });
    }
  };

  const loadPreset = (presetName: string) => {
    const presets = drinkPresets[drinkType] || [];
    const preset = presets.find(p => p.name === presetName);
    
    if (preset) {
      setAlcoholContent(preset.alcoholContent.toString());
      // Extract serving size number
      const servingMatch = preset.servingSize.match(/(\d+(?:\.\d+)?)/);
      if (servingMatch) {
        setServingSize(servingMatch[1]);
      }
    }
  };

  const resetCalculator = () => {
    setDrinkType('beer');
    setCustomDrink('');
    setServingSize('');
    setServingUnit('oz');
    setAlcoholContent('');
    setNumberOfDrinks('1');
    setResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Alcohol Calorie Calculator - Calculate Calories in Alcoholic Drinks | ToolsHub</title>
        <meta name="description" content="Free alcohol calorie calculator to calculate calories in beer, wine, spirits, and cocktails. Track your alcohol intake for better health." />
        <meta name="keywords" content="alcohol calorie calculator, drink calories, beer calories, wine calories, cocktail calories, alcohol nutrition" />
        <meta property="og:title" content="Alcohol Calorie Calculator - Calculate Calories in Alcoholic Drinks | ToolsHub" />
        <meta property="og:description" content="Calculate calories in your alcoholic beverages with our free alcohol calorie calculator." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/alcohol-calorie-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-alcohol-calories">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-600 text-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Wine className="w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Alcohol Calorie Calculator
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Calculate calories in beer, wine, spirits, and cocktails. Track your alcohol intake for better health and fitness goals.
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Calculator className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Alcohol Calorie Calculator</h2>
                    <p className="text-gray-600">Calculate calories in your alcoholic beverages</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                      {/* Drink Type Selection */}
                      <div>
                        <Label htmlFor="drink-type" className="text-base font-medium text-gray-700 mb-2 block">
                          Drink Type
                        </Label>
                        <Select value={drinkType} onValueChange={setDrinkType}>
                          <SelectTrigger data-testid="select-drink-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {drinkTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preset Selection for non-custom drinks */}
                      {drinkType !== 'custom' && (
                        <div>
                          <Label htmlFor="preset" className="text-base font-medium text-gray-700 mb-2 block">
                            Common {drinkTypeOptions.find(d => d.value === drinkType)?.label.replace(/[🍺🍷🥃🍸]/g, '').trim()} Options
                          </Label>
                          <Select onValueChange={loadPreset}>
                            <SelectTrigger data-testid="select-preset">
                              <SelectValue placeholder="Select a common drink" />
                            </SelectTrigger>
                            <SelectContent>
                              {(drinkPresets[drinkType] || []).map((preset) => (
                                <SelectItem key={preset.name} value={preset.name}>
                                  {preset.name} ({preset.calories} cal, {preset.servingSize})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Custom Drink Calories */}
                      {drinkType === 'custom' && (
                        <div>
                          <Label htmlFor="custom-drink" className="text-base font-medium text-gray-700 mb-2 block">
                            Calories per Serving
                          </Label>
                          <Input
                            id="custom-drink"
                            type="number"
                            value={customDrink}
                            onChange={(e) => setCustomDrink(e.target.value)}
                            placeholder="Enter calories per serving"
                            min="0"
                            data-testid="input-custom-calories"
                          />
                        </div>
                      )}

                      {/* Serving Size */}
                      <div>
                        <Label htmlFor="serving-size" className="text-base font-medium text-gray-700 mb-2 block">
                          Serving Size {drinkType !== 'custom' ? '(optional - uses standard if empty)' : ''}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="serving-size"
                            type="number"
                            value={servingSize}
                            onChange={(e) => setServingSize(e.target.value)}
                            placeholder="Enter serving size"
                            step="0.1"
                            min="0"
                            className="flex-1"
                            data-testid="input-serving-size"
                          />
                          <Select value={servingUnit} onValueChange={setServingUnit}>
                            <SelectTrigger className="w-20" data-testid="select-serving-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {servingUnitOptions.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Alcohol Content */}
                      <div>
                        <Label htmlFor="alcohol-content" className="text-base font-medium text-gray-700 mb-2 block">
                          Alcohol Content (% ABV) {drinkType !== 'custom' ? '(optional - uses standard if empty)' : ''}
                        </Label>
                        <Input
                          id="alcohol-content"
                          type="number"
                          value={alcoholContent}
                          onChange={(e) => setAlcoholContent(e.target.value)}
                          placeholder="Enter alcohol percentage"
                          step="0.1"
                          min="0"
                          max="100"
                          data-testid="input-alcohol-content"
                        />
                      </div>

                      {/* Number of Drinks */}
                      <div>
                        <Label htmlFor="number-drinks" className="text-base font-medium text-gray-700 mb-2 block">
                          Number of Drinks
                        </Label>
                        <Input
                          id="number-drinks"
                          type="number"
                          value={numberOfDrinks}
                          onChange={(e) => setNumberOfDrinks(e.target.value)}
                          placeholder="Number of drinks"
                          min="1"
                          data-testid="input-number-drinks"
                        />
                      </div>
                    </div>

                    {/* Actions and Tips */}
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-4">
                        <Button
                          onClick={calculateCalories}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Calories
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                          data-testid="button-reset"
                        >
                          Reset Calculator
                        </Button>
                      </div>

                      {/* Health Tips */}
                      <Card className="bg-purple-50 border-purple-200">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Health Tips
                          </h3>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Moderate drinking: 1 drink/day (women), 2 drinks/day (men)</li>
                            <li>• Alcohol has 7 calories per gram</li>
                            <li>• Choose lower-calorie options like light beer or dry wine</li>
                            <li>• Alternate with water to stay hydrated</li>
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Quick Reference */}
                      <Card className="bg-gray-50 border-gray-200">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">Quick Reference</h3>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>🍺 Light Beer: ~100 cal</p>
                            <p>🍷 Wine (5oz): ~120 cal</p>
                            <p>🥃 Spirit (1.5oz): ~95 cal</p>
                            <p>🍸 Cocktail: ~150-300 cal</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              {result && (
                <Card className="mt-8 bg-purple-50 border-purple-200" data-testid="results-section">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Flame className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Calorie Breakdown</h3>
                      <p className="text-gray-600">
                        {result.numberOfDrinks} {result.numberOfDrinks === 1 ? 'serving' : 'servings'} of {result.drinkType.replace(/[🍺🍷🥃🍸🔧]/g, '').trim()}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-total-calories">
                          {result.totalCalories}
                        </div>
                        <div className="text-sm text-gray-600">Total Calories</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <Wine className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-alcohol-calories">
                          {result.alcoholCalories}
                        </div>
                        <div className="text-sm text-gray-600">Alcohol Calories</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <Calculator className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-other-calories">
                          {result.nonAlcoholCalories}
                        </div>
                        <div className="text-sm text-gray-600">Other Calories</div>
                      </div>

                      <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                        <Info className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-gray-900" data-testid="result-alcohol-grams">
                          {result.totalAlcoholGrams}g
                        </div>
                        <div className="text-sm text-gray-600">Total Alcohol</div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                      <p className="text-sm text-gray-600 text-center">
                        💡 Alcohol contains 7 calories per gram. Other calories come from sugars, carbohydrates, and other ingredients in the beverage.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Calorie Comparison */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Alcohol Calorie Comparison</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <h3 className="font-semibold text-gray-900 mb-2">🍺 Light Beer</h3>
                        <p className="text-2xl font-bold text-gray-900">~100</p>
                        <p className="text-sm text-gray-600">calories per 12 oz</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <h3 className="font-semibold text-gray-900 mb-2">🍷 Wine</h3>
                        <p className="text-2xl font-bold text-gray-900">~120</p>
                        <p className="text-sm text-gray-600">calories per 5 oz</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <h3 className="font-semibold text-gray-900 mb-2">🥃 Spirits</h3>
                        <p className="text-2xl font-bold text-gray-900">~95</p>
                        <p className="text-sm text-gray-600">calories per 1.5 oz</p>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg text-center">
                        <h3 className="font-semibold text-gray-900 mb-2">🍸 Cocktails</h3>
                        <p className="text-2xl font-bold text-gray-900">150-300</p>
                        <p className="text-sm text-gray-600">calories varies widely</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Health Guidelines */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Alcohol & Health Guidelines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Moderate Drinking Guidelines</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Women: Up to 1 drink per day</li>
                          <li>• Men: Up to 2 drinks per day</li>
                          <li>• 1 drink = 12 oz beer, 5 oz wine, or 1.5 oz spirits</li>
                          <li>• Have alcohol-free days each week</li>
                          <li>• Never drink and drive</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Calorie Impact</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Alcohol = 7 calories per gram</li>
                          <li>• Often called "empty calories" (no nutrients)</li>
                          <li>• Can contribute to weight gain</li>
                          <li>• May increase appetite</li>
                          <li>• Choose lower-calorie options when possible</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">How accurate is this calculator?</h3>
                        <p className="text-gray-600 text-sm">
                          The calculator uses standard values for common drinks and scientific formulas for alcohol calories. Results are estimates and actual calories may vary by brand and preparation.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Which alcoholic drinks are lowest in calories?</h3>
                        <p className="text-gray-600 text-sm">
                          Generally, straight spirits (vodka, gin, whiskey) have the fewest calories per serving, followed by dry wines and light beers. Cocktails with mixers tend to be highest.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Do all calories from alcohol get stored as fat?</h3>
                        <p className="text-gray-600 text-sm">
                          Alcohol calories are metabolized differently than food calories. Your body prioritizes metabolizing alcohol, which can slow fat burning, but alcohol calories don't directly convert to fat.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Can I include alcohol in a weight loss diet?</h3>
                        <p className="text-gray-600 text-sm">
                          Moderate alcohol consumption can fit into a weight loss plan if you account for the calories in your daily total. Choose lower-calorie options and drink in moderation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default AlcoholCalorieCalculator;