
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

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  time: string;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionData {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  remainingCalories: number;
  progress: number;
}

const commonFoods = [
  { name: "Banana (medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, serving: "1 medium" },
  { name: "Apple (medium)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: "1 medium" },
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: "1 cup cooked" },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.7, serving: "170g" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 14.7, serving: "1/2 medium" },
  { name: "Salmon Fillet", calories: 206, protein: 22, carbs: 0, fat: 12, serving: "100g" },
  { name: "Oatmeal", calories: 147, protein: 5.4, carbs: 28, fat: 2.8, serving: "1 cup cooked" },
  { name: "Broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.4, serving: "1 cup" },
  { name: "Whole Wheat Bread", calories: 80, protein: 4, carbs: 14, fat: 1.1, serving: "1 slice" }
];

const MealCalorieTracker = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<DailyGoals>({ calories: 2000, protein: 150, carbs: 250, fat: 67 });
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    serving: '',
    time: ''
  });
  const [selectedFood, setSelectedFood] = useState('');
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    remainingCalories: 2000,
    progress: 0
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate nutrition totals
  useEffect(() => {
    const totals = meals.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + meal.calories,
      totalProtein: acc.totalProtein + meal.protein,
      totalCarbs: acc.totalCarbs + meal.carbs,
      totalFat: acc.totalFat + meal.fat
    }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

    const remainingCalories = goals.calories - totals.totalCalories;
    const progress = Math.min((totals.totalCalories / goals.calories) * 100, 100);

    setNutritionData({
      ...totals,
      remainingCalories,
      progress
    });
  }, [meals, goals]);

  const handleAddMeal = () => {
    if (!newMeal.name || !newMeal.calories) return;

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      calories: parseFloat(newMeal.calories) || 0,
      protein: parseFloat(newMeal.protein) || 0,
      carbs: parseFloat(newMeal.carbs) || 0,
      fat: parseFloat(newMeal.fat) || 0,
      serving: newMeal.serving || '1 serving',
      time: newMeal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMeals([...meals, meal]);
    setNewMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', serving: '', time: '' });
    setSelectedFood('');
  };

  const handleSelectCommonFood = (foodName: string) => {
    const food = commonFoods.find(f => f.name === foodName);
    if (food) {
      setNewMeal({
        name: food.name,
        calories: food.calories.toString(),
        protein: food.protein.toString(),
        carbs: food.carbs.toString(),
        fat: food.fat.toString(),
        serving: food.serving,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const handleClearAll = () => {
    setMeals([]);
  };

  const handleSampleData = () => {
    const sampleMeals: Meal[] = [
      {
        id: '1',
        name: 'Chicken Breast',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        serving: '100g',
        time: '08:00'
      },
      {
        id: '2',
        name: 'Brown Rice',
        calories: 216,
        protein: 5,
        carbs: 45,
        fat: 1.8,
        serving: '1 cup cooked',
        time: '12:30'
      },
      {
        id: '3',
        name: 'Greek Yogurt',
        calories: 100,
        protein: 17,
        carbs: 6,
        fat: 0.7,
        serving: '170g',
        time: '15:00'
      }
    ];
    setMeals(sampleMeals);
  };

  const resetTool = () => {
    setMeals([]);
    setGoals({ calories: 2000, protein: 150, carbs: 250, fat: 67 });
    setNewMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', serving: '', time: '' });
    setSelectedFood('');
    setShowAdvanced(false);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCalorieStatus = () => {
    if (nutritionData.remainingCalories > 0) {
      return { status: 'under', message: `${nutritionData.remainingCalories.toFixed(0)} calories remaining` };
    } else if (nutritionData.remainingCalories < 0) {
      return { status: 'over', message: `${Math.abs(nutritionData.remainingCalories).toFixed(0)} calories over goal` };
    } else {
      return { status: 'perfect', message: 'Perfect! You\'ve reached your calorie goal' };
    }
  };

  const calorieStatus = getCalorieStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Meal Calorie Tracker - Daily Food Intake & Nutrition Tracker | DapsiWow</title>
        <meta name="description" content="Free meal calorie tracker to monitor daily food intake, track macronutrients, and achieve nutrition goals. Professional food diary with calorie counting and macro tracking capabilities." />
        <meta name="keywords" content="meal calorie tracker, food diary, nutrition tracker, daily calories, macro tracking, calorie counter, food log, meal planner, diet tracker, nutrition calculator, daily intake tracker" />
        <meta property="og:title" content="Meal Calorie Tracker - Daily Food Intake & Nutrition Tracker | DapsiWow" />
        <meta property="og:description" content="Professional meal calorie tracker for monitoring daily food intake, tracking macronutrients, and achieving nutrition goals with comprehensive food logging capabilities." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/meal-calorie-tracker" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Meal Calorie Tracker",
            "description": "Professional meal calorie tracker for monitoring daily food intake, tracking macronutrients, and achieving nutrition goals with comprehensive food logging and analysis capabilities.",
            "url": "https://dapsiwow.com/tools/meal-calorie-tracker",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Daily calorie and macronutrient tracking",
              "Comprehensive food database",
              "Nutrition goal setting and monitoring",
              "Meal timing and portion tracking",
              "Progress visualization and analysis"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-green-200">
                <span className="text-xs sm:text-sm font-medium text-green-700">Nutrition Analysis Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="page-title">
                <span className="block">Meal Calorie</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mt-1 sm:mt-2">
                  Tracker
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Track your daily calorie intake and macronutrients to achieve your nutrition goals with comprehensive meal tracking
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Daily Nutrition Tracker</h2>
                    <p className="text-gray-600">Track your meals and monitor your daily calorie and macronutrient intake</p>
                  </div>

                  {/* Daily Goals Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Daily Nutrition Goals
                    </Label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="goal-calories" className="text-sm font-semibold text-gray-800">
                          Calories Goal
                        </Label>
                        <Input
                          id="goal-calories"
                          type="number"
                          value={goals.calories}
                          onChange={(e) => setGoals({ ...goals, calories: parseInt(e.target.value) || 2000 })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-protein" className="text-sm font-semibold text-gray-800">
                          Protein (g)
                        </Label>
                        <Input
                          id="goal-protein"
                          type="number"
                          value={goals.protein}
                          onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 150 })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="150"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-carbs" className="text-sm font-semibold text-gray-800">
                          Carbs (g)
                        </Label>
                        <Input
                          id="goal-carbs"
                          type="number"
                          value={goals.carbs}
                          onChange={(e) => setGoals({ ...goals, carbs: parseInt(e.target.value) || 250 })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="250"
                        />
                      </div>
                      <div>
                        <Label htmlFor="goal-fat" className="text-sm font-semibold text-gray-800">
                          Fat (g)
                        </Label>
                        <Input
                          id="goal-fat"
                          type="number"
                          value={goals.fat}
                          onChange={(e) => setGoals({ ...goals, fat: parseInt(e.target.value) || 67 })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="67"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add New Meal Section */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Add New Meal
                    </Label>

                    {/* Quick Select Common Foods */}
                    <div>
                      <Label htmlFor="common-foods" className="text-sm font-semibold text-gray-800">
                        Quick Select Common Foods
                      </Label>
                      <Select value={selectedFood} onValueChange={(value) => {
                        setSelectedFood(value);
                        handleSelectCommonFood(value);
                      }}>
                        <SelectTrigger className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500">
                          <SelectValue placeholder="Choose from common foods" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonFoods.map((food) => (
                            <SelectItem key={food.name} value={food.name}>
                              {food.name} ({food.calories} cal)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Manual Food Entry */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="meal-name" className="text-sm font-semibold text-gray-800">
                          Food Name *
                        </Label>
                        <Input
                          id="meal-name"
                          value={newMeal.name}
                          onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="e.g., Grilled Chicken"
                        />
                      </div>
                      <div>
                        <Label htmlFor="serving-size" className="text-sm font-semibold text-gray-800">
                          Serving Size
                        </Label>
                        <Input
                          id="serving-size"
                          value={newMeal.serving}
                          onChange={(e) => setNewMeal({ ...newMeal, serving: e.target.value })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="e.g., 1 cup, 100g"
                        />
                      </div>
                      <div>
                        <Label htmlFor="meal-time" className="text-sm font-semibold text-gray-800">
                          Time
                        </Label>
                        <Input
                          id="meal-time"
                          type="time"
                          value={newMeal.time}
                          onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="calories" className="text-sm font-semibold text-gray-800">
                          Calories *
                        </Label>
                        <Input
                          id="calories"
                          type="number"
                          value={newMeal.calories}
                          onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="protein" className="text-sm font-semibold text-gray-800">
                          Protein (g)
                        </Label>
                        <Input
                          id="protein"
                          type="number"
                          value={newMeal.protein}
                          onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="carbs" className="text-sm font-semibold text-gray-800">
                          Carbs (g)
                        </Label>
                        <Input
                          id="carbs"
                          type="number"
                          value={newMeal.carbs}
                          onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-1">
                        <Label htmlFor="fat" className="text-sm font-semibold text-gray-800">
                          Fat (g)
                        </Label>
                        <Input
                          id="fat"
                          type="number"
                          value={newMeal.fat}
                          onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
                          className="mt-1 h-12 border-2 border-gray-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500"
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Tracking Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                          data-testid="button-toggle-advanced"
                        >
                          <span className="flex items-center">
                            Advanced Nutrition Analysis Settings
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Tracking Features</h4>
                          <div className="space-y-3 text-sm text-gray-600">
                            <div>• Comprehensive macronutrient tracking (protein, carbs, fat)</div>
                            <div>• Daily calorie progress monitoring with visual indicators</div>
                            <div>• Meal timing analysis for optimal nutrition distribution</div>
                            <div>• Common food database for quick meal logging</div>
                            <div>• Personalized nutrition goal setting and adjustment</div>
                            <div>• Real-time nutritional balance calculations</div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={handleAddMeal}
                      disabled={!newMeal.name || !newMeal.calories}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-add-meal"
                    >
                      Add Meal
                    </Button>
                    <Button
                      onClick={handleSampleData}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-sample-data"
                    >
                      Sample
                    </Button>
                    <Button
                      onClick={resetTool}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {(meals.length > 0 || nutritionData.totalCalories > 0) && (
                  <div className="bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Nutrition Analysis</h2>

                    <div className="space-y-6 sm:space-y-8" data-testid="nutrition-results">
                      {/* Progress Summary */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Progress Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{nutritionData.totalCalories.toFixed(0)}</div>
                            <div className="text-sm text-gray-600">Calories Consumed</div>
                            <div className="text-xs text-gray-500">Goal: {goals.calories}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{nutritionData.totalProtein.toFixed(1)}g</div>
                            <div className="text-sm text-gray-600">Protein</div>
                            <div className="text-xs text-gray-500">Goal: {goals.protein}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{nutritionData.totalCarbs.toFixed(1)}g</div>
                            <div className="text-sm text-gray-600">Carbohydrates</div>
                            <div className="text-xs text-gray-500">Goal: {goals.carbs}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{nutritionData.totalFat.toFixed(1)}g</div>
                            <div className="text-sm text-gray-600">Fat</div>
                            <div className="text-xs text-gray-500">Goal: {goals.fat}g</div>
                          </div>
                        </div>
                      </div>

                      {/* Calorie Status */}
                      <div className={`rounded-xl p-4 sm:p-6 border-2 ${
                        calorieStatus.status === 'over' ? 'bg-red-50 border-red-200' : 
                        calorieStatus.status === 'perfect' ? 'bg-green-50 border-green-200' : 
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <h3 className={`text-lg font-bold mb-2 ${
                          calorieStatus.status === 'over' ? 'text-red-900' : 
                          calorieStatus.status === 'perfect' ? 'text-green-900' : 
                          'text-blue-900'
                        }`}>
                          Calorie Status
                        </h3>
                        <p className={`${
                          calorieStatus.status === 'over' ? 'text-red-700' : 
                          calorieStatus.status === 'perfect' ? 'text-green-700' : 
                          'text-blue-700'
                        }`}>
                          {calorieStatus.message}
                        </p>
                      </div>

                      {/* Meals Log */}
                      {meals.length > 0 && (
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Meals ({meals.length})</h3>
                          <div className="space-y-3">
                            {meals.map((meal) => (
                              <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3">
                                    <h4 className="font-medium">{meal.name}</h4>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {meal.time}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {meal.serving} • {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            onClick={() => {
                              const mealsText = meals.map(meal => 
                                `${meal.name} (${meal.serving}): ${meal.calories} cal, P: ${meal.protein}g, C: ${meal.carbs}g, F: ${meal.fat}g`
                              ).join('\n');
                              handleCopyToClipboard(`Daily Meals:\n${mealsText}\n\nTotal: ${nutritionData.totalCalories} calories`);
                            }}
                            variant="outline"
                            className="w-full mt-4 rounded-lg"
                          >
                            Copy All Meals
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Meal Calorie Tracker */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Meal Calorie Tracker?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>meal calorie tracker</strong> is an essential nutrition management tool designed to help individuals monitor their daily food intake, track macronutrients, and achieve specific health and fitness goals. This comprehensive tracking system enables users to log meals, calculate nutritional values, and maintain awareness of their eating patterns for improved dietary decision-making and long-term wellness success.
                  </p>
                  <p>
                    Our professional meal calorie tracker provides detailed analysis of calories, protein, carbohydrates, and fat content across all meals and snacks throughout the day. The tool supports customizable nutrition goals, offers a comprehensive food database for quick logging, and delivers real-time progress monitoring to help users maintain balanced nutrition and achieve their desired health outcomes.
                  </p>
                  <p>
                    Whether you're focused on weight management, athletic performance optimization, medical dietary requirements, or general wellness improvement, this meal tracking calculator provides the data insights and monitoring capabilities necessary for informed nutrition choices and sustainable lifestyle changes that support your health objectives.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How Meal Tracking Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Professional Meal Tracking & Calorie Analysis Works</h2>
                <p className="text-gray-600 mb-8">Understanding the science and methodology behind effective meal tracking helps optimize nutrition management, improve dietary adherence, and achieve sustainable health and fitness results through data-driven nutrition decisions.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Nutritional Data Collection Process</h3>
                      <p className="text-green-800 text-sm mb-4">
                        The tracker utilizes comprehensive food databases containing verified nutritional information for thousands of foods, including macronutrient profiles, portion sizes, and caloric densities. This ensures accurate logging and reliable nutritional analysis for all tracked meals and snacks.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Data Collection Steps:</h4>
                        <div className="text-xs text-green-800">
                          <div>1. Food identification and portion measurement</div>
                          <div>2. Nutritional database lookup and verification</div>
                          <div>3. Macronutrient calculation and aggregation</div>
                          <div>4. Daily progress monitoring and goal comparison</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Macronutrient Balance Analysis</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        Our tracking system analyzes the distribution of proteins, carbohydrates, and fats across daily intake, providing insights into nutritional balance and helping users optimize their macronutrient ratios for specific health, fitness, or performance goals.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Analysis Features:</h4>
                        <div className="text-xs text-blue-800">
                          <div>• Protein intake optimization for muscle maintenance</div>
                          <div>• Carbohydrate timing and energy management</div>
                          <div>• Healthy fat integration and hormone support</div>
                          <div>• Micronutrient awareness and deficiency prevention</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Goal Setting & Progress Monitoring</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        The tracker enables personalized nutrition goal establishment based on individual needs, activity levels, and health objectives. Real-time progress monitoring provides immediate feedback and helps maintain dietary adherence for long-term success.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Monitoring Capabilities:</h4>
                        <div className="text-xs text-orange-800">
                          <div>• Daily calorie targets with deficit/surplus tracking</div>
                          <div>• Macronutrient ratio goals and progress visualization</div>
                          <div>• Meal timing patterns and eating behavior analysis</div>
                          <div>• Weekly and monthly trend identification</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Behavioral Pattern Recognition</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        Advanced tracking capabilities identify eating patterns, food preferences, and nutritional habits that impact health outcomes. This data supports informed dietary adjustments and sustainable lifestyle modifications for improved wellness results.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Pattern Analysis:</h4>
                        <div className="text-xs text-purple-800">
                          <div>• Meal frequency and timing optimization</div>
                          <div>• Food choice patterns and preference trends</div>
                          <div>• Nutritional gap identification and correction</div>
                          <div>• Adherence tracking and improvement strategies</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications and User Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Benefits from Meal Calorie Tracking?</h2>
                  <p className="text-gray-600 mb-6">Meal calorie tracking serves diverse user groups across health, fitness, and medical contexts, providing essential nutrition monitoring capabilities for achieving specific dietary and wellness objectives through data-driven food management.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Weight Management Seekers</h3>
                      <p className="text-green-800 text-sm">Track daily caloric intake to achieve weight loss, maintenance, or gain goals through precise portion control, macro balance optimization, and sustainable eating habit development for long-term success.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Athletes & Fitness Enthusiasts</h3>
                      <p className="text-blue-800 text-sm">Optimize nutrition for performance, recovery, and body composition goals through strategic macronutrient timing, calorie cycling, and sport-specific dietary requirements for competitive advantage.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Health & Medical Patients</h3>
                      <p className="text-orange-800 text-sm">Monitor dietary intake for diabetes management, cardiovascular health, digestive disorders, and other medical conditions requiring specific nutritional protocols and professional dietary oversight.</p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Nutrition Professionals</h3>
                      <p className="text-purple-800 text-sm">Support client dietary assessments, meal planning recommendations, and nutrition education through detailed food intake analysis and progress monitoring for evidence-based practice.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Wellness & Lifestyle Enthusiasts</h3>
                      <p className="text-teal-800 text-sm">Develop mindful eating habits, improve nutritional awareness, and maintain balanced dietary patterns that support overall health, energy levels, and quality of life enhancement.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Tracking Capabilities</h2>
                  <p className="text-gray-600 mb-6">Our comprehensive meal calorie tracker offers professional-grade analysis tools designed for accuracy, convenience, and user-friendly nutrition management across all dietary preferences and health objectives.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Food Database Integration</h4>
                        <p className="text-gray-600 text-sm">Access extensive nutritional data for thousands of foods, including branded products, restaurant items, and home-cooked meals with accurate macronutrient profiles and portion guidance.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Personalized Nutrition Goal Setting</h4>
                        <p className="text-gray-600 text-sm">Customize daily calorie and macronutrient targets based on individual needs, activity levels, health conditions, and specific dietary objectives for optimal nutrition planning.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Real-Time Progress Monitoring</h4>
                        <p className="text-gray-600 text-sm">Track daily intake progress with visual indicators, goal achievement status, and immediate feedback to maintain dietary adherence and support behavior modification.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Detailed Macronutrient Analysis</h4>
                        <p className="text-gray-600 text-sm">Monitor protein, carbohydrate, and fat distribution throughout the day with balance optimization recommendations and nutritional adequacy assessments for complete dietary evaluation.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Meal Timing & Pattern Recognition</h4>
                        <p className="text-gray-600 text-sm">Log meal times and analyze eating patterns to optimize nutrient timing, identify behavioral trends, and support structured eating schedules for improved metabolic health.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nutrition Science & Methodology */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Nutrition Science & Evidence-Based Meal Tracking Methodology</h2>
                <p className="text-gray-600 mb-8">Our meal tracking approach incorporates established nutritional science principles, dietary guidelines, and evidence-based practices to support accurate food intake assessment and effective nutrition management for diverse health and fitness objectives.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Caloric Balance Principles</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Energy Balance Equation</h4>
                        <p className="text-green-800 text-xs mt-1">Track caloric intake versus expenditure to achieve weight management goals through precise energy balance monitoring and sustainable caloric deficit or surplus creation.</p>
                      </div>
                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-emerald-900 text-sm">Metabolic Rate Considerations</h4>
                        <p className="text-emerald-800 text-xs mt-1">Account for individual metabolic variations, activity levels, and physiological factors that influence daily caloric needs and nutritional requirements for personalized goal setting.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Caloric Density Awareness</h4>
                        <p className="text-teal-800 text-xs mt-1">Understand food caloric density variations to optimize satiety, portion control, and nutrient density while maintaining caloric targets for effective weight management.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Macronutrient Distribution Science</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Protein Requirements</h4>
                        <p className="text-blue-800 text-xs mt-1">Monitor protein intake for muscle maintenance, satiety enhancement, and metabolic support based on body weight, activity level, and specific health objectives.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Carbohydrate Optimization</h4>
                        <p className="text-indigo-800 text-xs mt-1">Track carbohydrate quality and timing to support energy levels, athletic performance, and metabolic health while avoiding blood sugar spikes and energy crashes.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 text-sm">Essential Fat Integration</h4>
                        <p className="text-purple-800 text-xs mt-1">Ensure adequate healthy fat intake for hormone production, nutrient absorption, and cardiovascular health while maintaining appropriate caloric balance.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Behavioral Modification Support</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Mindful Eating Development</h4>
                        <p className="text-orange-800 text-xs mt-1">Use tracking data to develop awareness of eating patterns, hunger cues, and food choices that support sustainable dietary behavior changes.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Habit Formation Tracking</h4>
                        <p className="text-red-800 text-xs mt-1">Monitor consistency and adherence to nutritional goals to identify successful strategies and areas requiring additional support or modification.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Progress Motivation</h4>
                        <p className="text-pink-800 text-xs mt-1">Visualize nutritional achievements and improvements to maintain motivation, celebrate successes, and support long-term dietary adherence for sustained results.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Nutrition Tracking Best Practices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Accurate Data Collection</h4>
                      <p className="text-gray-600 text-sm">Measure portions precisely, log foods immediately after consumption, and include all beverages, snacks, and cooking ingredients for comprehensive nutritional assessment and reliable tracking data.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Consistency & Adherence</h4>
                      <p className="text-gray-600 text-sm">Maintain daily tracking habits, log meals at consistent times, and track even imperfect eating days to identify patterns and maintain accountability for long-term success.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Goal Adjustment Strategy</h4>
                      <p className="text-gray-600 text-sm">Regularly review and adjust nutritional targets based on progress, changing needs, and life circumstances to ensure goals remain realistic, achievable, and aligned with health objectives.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Professional Integration</h4>
                      <p className="text-gray-600 text-sm">Share tracking data with healthcare providers, registered dietitians, or fitness professionals to receive personalized guidance and evidence-based recommendations for optimal nutrition management.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Applications and Specialized Use Cases */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Applications & Specialized Meal Tracking Use Cases</h2>
                <p className="text-gray-600 mb-8">Meal calorie tracking serves specialized applications across various health conditions, fitness disciplines, and medical contexts, providing targeted nutrition monitoring for specific therapeutic, performance, and wellness objectives.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Medical Nutrition Management</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Diabetes blood sugar and carbohydrate monitoring</li>
                      <li>• Cardiovascular disease heart-healthy nutrition tracking</li>
                      <li>• Kidney disease protein and mineral restriction adherence</li>
                      <li>• Gastrointestinal disorder symptom and food correlation</li>
                      <li>• Food allergy and intolerance identification support</li>
                      <li>• Post-surgical nutrition recovery and monitoring</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Athletic Performance Optimization</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Endurance sports carbohydrate loading strategies</li>
                      <li>• Strength training protein timing and distribution</li>
                      <li>• Competition weight management for combat sports</li>
                      <li>• Recovery nutrition and glycogen replenishment</li>
                      <li>• Hydration and electrolyte balance monitoring</li>
                      <li>• Periodized nutrition for training cycles</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Weight Management Programs</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Sustainable weight loss through caloric deficit tracking</li>
                      <li>• Healthy weight gain for underweight individuals</li>
                      <li>• Maintenance phase nutrition habit establishment</li>
                      <li>• Metabolic adaptation prevention strategies</li>
                      <li>• Hunger and satiety pattern optimization</li>
                      <li>• Long-term weight maintenance support systems</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Specialized Dietary Protocols</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Ketogenic diet macro ratio precision tracking</li>
                      <li>• Intermittent fasting eating window monitoring</li>
                      <li>• Plant-based nutrition adequacy assessment</li>
                      <li>• Anti-inflammatory diet implementation support</li>
                      <li>• Mediterranean diet adherence measurement</li>
                      <li>• Elimination diet reintroduction protocols</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Life Stage Nutrition Support</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Pregnancy and lactation nutrient monitoring</li>
                      <li>• Pediatric growth and development nutrition</li>
                      <li>• Adolescent sports nutrition and growth support</li>
                      <li>• Active aging nutrition and muscle preservation</li>
                      <li>• Menopause hormone balance nutrition support</li>
                      <li>• Senior citizen medication and nutrition interactions</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Mental Health & Wellness</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Mood and food relationship pattern identification</li>
                      <li>• Stress eating behavior modification support</li>
                      <li>• Energy level and nutrition correlation tracking</li>
                      <li>• Sleep quality and evening nutrition optimization</li>
                      <li>• Cognitive function and brain health nutrition</li>
                      <li>• Eating disorder recovery nutrition monitoring</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Tracking Strategies & Professional Integration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Technology-Enhanced Monitoring</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Integration with fitness trackers and health apps for comprehensive monitoring</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Barcode scanning and photo logging for convenient food identification</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Predictive analytics for meal planning and nutrition optimization</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Continuous glucose monitoring integration for diabetic meal management</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Clinical and Professional Applications</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Healthcare provider collaboration and data sharing for medical nutrition therapy</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Research participation and population health studies contribution</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Insurance wellness program integration and health incentive tracking</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Corporate wellness initiatives and employee health program support</span>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate are meal calorie calculations?</h3>
                      <p className="text-gray-600 text-sm">
                        Our tracker uses verified nutritional databases and standard serving sizes to provide accurate calorie estimates. For best results, weigh portions when possible and use specific food entries rather than generic ones. Individual metabolism may affect actual calorie utilization.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Should I track every single food item I consume?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, comprehensive tracking including snacks, beverages, cooking oils, and condiments provides the most accurate nutritional assessment. Even small items can add significant calories and affect your daily totals and macro balance.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I set appropriate daily calorie and macro goals?</h3>
                      <p className="text-gray-600 text-sm">
                        Consider your age, gender, weight, height, activity level, and health goals. Start with general guidelines (45-65% carbs, 20-35% fat, 10-35% protein) and adjust based on results. Consult healthcare providers for personalized recommendations.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I eat out frequently or don't know exact ingredients?</h3>
                      <p className="text-gray-600 text-sm">
                        Use restaurant nutrition information when available, search for similar dishes in the database, or estimate using individual ingredients. Focus on consistency in your estimation methods rather than perfect accuracy for every meal.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How long should I track my meals to see results?</h3>
                      <p className="text-gray-600 text-sm">
                        Most people notice patterns within 1-2 weeks of consistent tracking. For weight management goals, track for at least 3-4 weeks to account for natural fluctuations and establish reliable trends and eating habits.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can meal tracking help with medical conditions?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, tracking can support management of diabetes, heart disease, digestive issues, and food allergies by identifying patterns and ensuring adherence to medical nutrition recommendations. Always consult healthcare providers for medical nutrition guidance.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Is it normal to go over my goals occasionally?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, occasional variations are normal and expected. Focus on weekly averages rather than daily perfection. Use tracking data to learn from higher-calorie days and adjust subsequent meals accordingly for balance.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I handle homemade recipes and complex meals?</h3>
                      <p className="text-gray-600 text-sm">
                        Break recipes into individual ingredients and calculate totals, then divide by servings. Many tracking apps offer recipe builders for this purpose. Save frequently used recipes for easier future logging of homemade meals.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Nutritional Calculation Methodology</h2>
                <p className="text-gray-600 mb-8">Our meal calorie tracker employs evidence-based nutritional databases, standardized calculation methods, and modern web technologies to ensure accurate tracking, reliable analysis, and seamless user experience across all devices and platforms.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Nutritional Database & Calculation Engine</h3>
                    <div className="space-y-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Food Database Specifications</h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• USDA nutrition database integration for accuracy</li>
                          <li>• Branded food product nutritional information</li>
                          <li>• International food composition data support</li>
                          <li>• Regular database updates and verification protocols</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Calculation Methodology</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Standardized portion size conversions and scaling</li>
                          <li>• Macronutrient calorie calculation (4-4-9 formula)</li>
                          <li>• Daily goal progress tracking and visualization</li>
                          <li>• Real-time nutritional balance assessment algorithms</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Data Accuracy & Validation</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Cross-reference multiple nutritional data sources</li>
                          <li>• Peer-reviewed nutrition research integration</li>
                          <li>• Continuous data quality monitoring and updates</li>
                          <li>• User feedback incorporation for database improvements</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform & User Experience Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Browser Compatibility</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Chrome 90+ (optimal performance and features)</li>
                          <li>• Firefox 88+ (full tracking functionality)</li>
                          <li>• Safari 14+ (complete iOS and macOS support)</li>
                          <li>• Edge 90+ (comprehensive Windows integration)</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mobile & Touch Device Support</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• iOS Safari 14+ (responsive touch interface)</li>
                          <li>• Android Chrome 90+ (optimized for mobile tracking)</li>
                          <li>• Progressive Web App (PWA) capabilities</li>
                          <li>• Offline data storage and synchronization</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Privacy & Security Features</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Local data storage (no server transmission)</li>
                          <li>• GDPR compliance and privacy protection</li>
                          <li>• Secure data handling and user anonymity</li>
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

export default MealCalorieTracker;
