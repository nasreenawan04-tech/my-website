
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    { value: 'beer', label: 'Beer' },
    { value: 'wine', label: 'Wine' },
    { value: 'spirits', label: 'Spirits' },
    { value: 'cocktails', label: 'Cocktails' },
    { value: 'custom', label: 'Custom Drink' }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Alcohol Calorie Calculator - Calculate Drink Calories Accurately | DapsiWow</title>
        <meta name="description" content="Free alcohol calorie calculator to accurately calculate calories in beer, wine, spirits, and cocktails. Track your alcohol intake for better health and weight management with our comprehensive drink calorie tool." />
        <meta name="keywords" content="alcohol calorie calculator, drink calories, beer calories, wine calories, cocktail calories, alcohol nutrition facts, drink calorie counter, alcoholic beverage calories" />
        <meta property="og:title" content="Alcohol Calorie Calculator - Calculate Drink Calories Accurately | DapsiWow" />
        <meta property="og:description" content="Calculate calories in alcoholic beverages with precision. Free tool for tracking drink calories including beer, wine, spirits, and cocktails for health-conscious individuals." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/alcohol-calorie-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Alcohol Calorie Calculator",
            "description": "Professional alcohol calorie calculator for accurately determining calories in beer, wine, spirits, and cocktails. Essential tool for health-conscious drinking and weight management.",
            "url": "https://dapsiwow.com/alcohol-calorie-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate calories in all types of alcoholic beverages",
              "Preset values for common drinks",
              "Custom drink calorie calculation",
              "Alcohol vs non-alcohol calorie breakdown",
              "Multiple serving size units supported"
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
                <span className="text-sm font-medium text-blue-700">Health & Nutrition Calculator</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Alcohol Calorie
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate calories in beer, wine, spirits, and cocktails for better health and weight management
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Input Section */}
                <div className="p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Drink Details</h2>
                    <p className="text-gray-600">Configure your alcoholic beverage information</p>
                  </div>

                  <div className="space-y-6">
                    {/* Drink Type Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="drink-type" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Drink Type
                      </Label>
                      <Select value={drinkType} onValueChange={setDrinkType}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-drink-type">
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
                      <div className="space-y-3">
                        <Label htmlFor="preset" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Common {drinkTypeOptions.find(d => d.value === drinkType)?.label} Options
                        </Label>
                        <Select onValueChange={loadPreset}>
                          <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-preset">
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
                      <div className="space-y-3">
                        <Label htmlFor="custom-drink" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Calories per Serving
                        </Label>
                        <Input
                          id="custom-drink"
                          type="number"
                          value={customDrink}
                          onChange={(e) => setCustomDrink(e.target.value)}
                          placeholder="Enter calories per serving"
                          min="0"
                          className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          data-testid="input-custom-calories"
                        />
                      </div>
                    )}

                    {/* Serving Size */}
                    <div className="space-y-3">
                      <Label htmlFor="serving-size" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Serving Size {drinkType !== 'custom' ? '(optional)' : ''}
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
                          className="flex-1 h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          data-testid="input-serving-size"
                        />
                        <Select value={servingUnit} onValueChange={setServingUnit}>
                          <SelectTrigger className="w-20 h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-serving-unit">
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
                    <div className="space-y-3">
                      <Label htmlFor="alcohol-content" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Alcohol Content (% ABV) {drinkType !== 'custom' ? '(optional)' : ''}
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
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        data-testid="input-alcohol-content"
                      />
                    </div>

                    {/* Number of Drinks */}
                    <div className="space-y-3">
                      <Label htmlFor="number-drinks" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Number of Drinks
                      </Label>
                      <Input
                        id="number-drinks"
                        type="number"
                        value={numberOfDrinks}
                        onChange={(e) => setNumberOfDrinks(e.target.value)}
                        placeholder="Number of drinks"
                        min="1"
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        data-testid="input-number-drinks"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        onClick={calculateCalories}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                        data-testid="button-calculate"
                      >
                        Calculate Calories
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
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Calorie Breakdown</h2>

                  {result ? (
                    <div className="space-y-6" data-testid="results-section">
                      {/* Result Summary */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {result.numberOfDrinks} {result.numberOfDrinks === 1 ? 'serving' : 'servings'} of {result.drinkType}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600" data-testid="result-total-calories">
                              {result.totalCalories}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">Total Calories</div>
                          </div>

                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600" data-testid="result-alcohol-calories">
                              {result.alcoholCalories}
                            </div>
                            <div className="text-sm text-purple-700 font-medium">From Alcohol</div>
                          </div>

                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600" data-testid="result-other-calories">
                              {result.nonAlcoholCalories}
                            </div>
                            <div className="text-sm text-green-700 font-medium">Other Calories</div>
                          </div>

                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-3xl font-bold text-orange-600" data-testid="result-alcohol-grams">
                              {result.totalAlcoholGrams}g
                            </div>
                            <div className="text-sm text-orange-700 font-medium">Pure Alcohol</div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Alcohol contains 7 calories per gram. Other calories come from sugars, carbohydrates, and additional ingredients.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">🍷</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter drink details and calculate to see calorie breakdown</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Alcohol Calories</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Alcoholic beverages contain calories from both alcohol and other ingredients like sugars, 
                    carbohydrates, and additives. Understanding the caloric content of your drinks is essential 
                    for maintaining a healthy diet and managing weight effectively.
                  </p>
                  <p>
                    Our alcohol calorie calculator provides accurate calculations based on the alcohol by volume 
                    (ABV) percentage and serving size, giving you detailed insights into both alcohol-derived 
                    calories and calories from other sources in your beverage.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Track Alcohol Calories?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Alcohol calories are often called "empty calories" because they provide energy without 
                    essential nutrients. These calories can significantly impact your daily caloric intake 
                    and weight management goals, making tracking crucial for health-conscious individuals.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Better weight management and control</li>
                    <li>Informed decision-making about drink choices</li>
                    <li>Understanding nutritional impact of alcohol consumption</li>
                    <li>Support for fitness and health goals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Calculator Features</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Preset values for common alcoholic beverages</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Custom drink calorie calculation support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple serving size units (oz, ml, cl, L)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Alcohol vs non-alcohol calorie breakdown</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Pure alcohol content calculation in grams</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Health Applications</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Weight loss and management programs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Fitness and bodybuilding nutrition planning</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Diabetes and blood sugar management</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Heart health and cardiovascular wellness</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>General nutritional awareness and education</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Comprehensive Drink Calorie Guide */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Alcoholic Beverage Calorie Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Beer Calories</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Light Beer (12 oz): 100-110 calories</p>
                      <p>Regular Beer (12 oz): 140-160 calories</p>
                      <p>IPA/Craft Beer (12 oz): 170-190 calories</p>
                      <p>Stout/Porter (12 oz): 200-220 calories</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Wine Calories</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>White Wine (5 oz): 115-125 calories</p>
                      <p>Red Wine (5 oz): 120-130 calories</p>
                      <p>Rosé Wine (5 oz): 110-120 calories</p>
                      <p>Champagne (5 oz): 95-105 calories</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Spirits Calories</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Vodka (1.5 oz): 95-100 calories</p>
                      <p>Whiskey (1.5 oz): 95-100 calories</p>
                      <p>Rum (1.5 oz): 95-100 calories</p>
                      <p>Gin (1.5 oz): 95-100 calories</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Cocktail Calories</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Martini: 120-140 calories</p>
                      <p>Margarita: 160-180 calories</p>
                      <p>Mojito: 140-160 calories</p>
                      <p>Piña Colada: 240-260 calories</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Guidelines and Recommendations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Alcohol Consumption Guidelines & Health Impact</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Moderate Drinking Guidelines</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>According to health authorities, moderate drinking is defined as:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Women: Up to 1 standard drink per day</li>
                          <li>Men: Up to 2 standard drinks per day</li>
                          <li>1 standard drink = 12 oz beer, 5 oz wine, or 1.5 oz spirits</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Calorie Impact on Weight</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Alcohol calories can significantly impact weight management:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Alcohol contains 7 calories per gram (nearly as much as fat)</li>
                          <li>These are "empty calories" with no nutritional value</li>
                          <li>Regular consumption can lead to weight gain</li>
                          <li>Alcohol may increase appetite and reduce inhibitions around food</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Health Benefits & Risks</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Potential Benefits (moderate consumption):</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                          <li>May reduce risk of heart disease</li>
                          <li>Potential antioxidant properties in wine</li>
                          <li>Social and relaxation benefits</li>
                        </ul>
                        
                        <p><strong>Health Risks (excessive consumption):</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Increased risk of liver disease</li>
                          <li>Higher cancer risk</li>
                          <li>Cardiovascular problems</li>
                          <li>Mental health impacts</li>
                          <li>Addiction potential</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions About Alcohol Calories</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How accurate is this alcohol calorie calculator?</h4>
                      <p className="text-gray-600 text-sm">
                        Our calculator uses scientifically accurate formulas based on alcohol content and standard 
                        nutritional data. It provides highly accurate estimates for common beverages and allows 
                        custom calculations for precise tracking.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Which alcoholic drinks are lowest in calories?</h4>
                      <p className="text-gray-600 text-sm">
                        Generally, straight spirits (vodka, gin, whiskey) have the lowest calories per standard 
                        serving, followed by dry wines and light beers. Mixed drinks and cocktails with added 
                        sugars tend to be highest in calories.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do alcohol calories contribute to weight gain?</h4>
                      <p className="text-gray-600 text-sm">
                        Yes, alcohol calories contribute to your daily caloric intake and can lead to weight gain 
                        if consumed in excess. Your body prioritizes metabolizing alcohol, which can slow down 
                        fat burning and promote fat storage.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I include alcohol in a weight loss diet?</h4>
                      <p className="text-gray-600 text-sm">
                        Moderate alcohol consumption can fit into a weight loss plan if you account for the 
                        calories in your daily total. Choose lower-calorie options, limit frequency, and 
                        maintain overall caloric deficit for weight loss.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How do I reduce calories from alcoholic drinks?</h4>
                      <p className="text-gray-600 text-sm">
                        Choose spirits with low-calorie mixers, opt for dry wines over sweet varieties, select 
                        light beers, avoid sugary cocktails, use fresh lime/lemon instead of juice, and 
                        alternate alcoholic drinks with water.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is this calculator suitable for diabetics?</h4>
                      <p className="text-gray-600 text-sm">
                        While this calculator provides calorie information, diabetics should consult healthcare 
                        providers about alcohol consumption. Alcohol can affect blood sugar levels and 
                        interfere with diabetes medications.
                      </p>
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

export default AlcoholCalorieCalculator;
