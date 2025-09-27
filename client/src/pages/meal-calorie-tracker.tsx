
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Utensils, Plus, Trash2, TrendingUp, Target, Calendar, Activity } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ShareResultsButton from '@/components/ShareResultsButton';

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

  const shareData = {
    title: 'My Daily Nutrition Tracker Results',
    description: `Calories: ${nutritionData.totalCalories}/${goals.calories} | Protein: ${nutritionData.totalProtein.toFixed(1)}g | Carbs: ${nutritionData.totalCarbs.toFixed(1)}g | Fat: ${nutritionData.totalFat.toFixed(1)}g`,
    url: window.location.href
  };

  return (
    <>
      <Helmet>
        <title>Meal Calorie Tracker - Track Daily Food Intake & Nutrition | DapsiWow</title>
        <meta name="description" content="Free meal calorie tracker to monitor your daily food intake, track macronutrients, and achieve your nutrition goals. Add meals, calculate calories, and monitor progress with our comprehensive nutrition tracker." />
        <meta name="keywords" content="meal tracker, calorie counter, food diary, nutrition tracker, daily calories, macro tracking, diet tracker, food log" />
        <meta property="og:title" content="Meal Calorie Tracker - Track Daily Food Intake & Nutrition | DapsiWow" />
        <meta property="og:description" content="Track your daily calorie intake and macronutrients with our comprehensive meal tracker. Monitor progress towards your nutrition goals." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/meal-calorie-tracker" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Meal Calorie Tracker",
            "description": "Track daily food intake, calories, and macronutrients to achieve nutrition goals",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="meal-calorie-tracker">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Utensils className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="page-title">
                  Meal Calorie Tracker
                </h1>
                <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
                  Track your daily calorie intake and macronutrients to achieve your nutrition goals with our comprehensive meal tracking tool
                </p>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Overview */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Daily Progress
                      </CardTitle>
                      <CardDescription>Track your nutrition goals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Calorie Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-sm font-medium">Calories</Label>
                          <span className="text-sm text-neutral-600">
                            {nutritionData.totalCalories.toFixed(0)} / {goals.calories}
                          </span>
                        </div>
                        <Progress value={nutritionData.progress} className="h-3" />
                        <Alert className={`mt-2 ${calorieStatus.status === 'over' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                          <AlertDescription className={calorieStatus.status === 'over' ? 'text-red-700' : 'text-green-700'}>
                            {calorieStatus.message}
                          </AlertDescription>
                        </Alert>
                      </div>

                      {/* Macronutrients */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Protein</span>
                          <span className="text-sm font-medium">
                            {nutritionData.totalProtein.toFixed(1)}g / {goals.protein}g
                          </span>
                        </div>
                        <Progress value={(nutritionData.totalProtein / goals.protein) * 100} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Carbs</span>
                          <span className="text-sm font-medium">
                            {nutritionData.totalCarbs.toFixed(1)}g / {goals.carbs}g
                          </span>
                        </div>
                        <Progress value={(nutritionData.totalCarbs / goals.carbs) * 100} className="h-2" />

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Fat</span>
                          <span className="text-sm font-medium">
                            {nutritionData.totalFat.toFixed(1)}g / {goals.fat}g
                          </span>
                        </div>
                        <Progress value={(nutritionData.totalFat / goals.fat) * 100} className="h-2" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <ShareResultsButton data={shareData} />
                        <Button variant="outline" onClick={handleClearAll} className="flex-1">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Tracker */}
                <div className="lg:col-span-2">
                  <Tabs defaultValue="add-meal">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="add-meal">Add Meal</TabsTrigger>
                      <TabsTrigger value="meal-log">Meal Log</TabsTrigger>
                      <TabsTrigger value="goals">Goals</TabsTrigger>
                    </TabsList>

                    <TabsContent value="add-meal" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            Add New Meal
                          </CardTitle>
                          <CardDescription>
                            Add meals to track your daily calorie and nutrient intake
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Quick Select */}
                          <div>
                            <Label htmlFor="common-foods" className="text-sm font-medium mb-2 block">
                              Quick Select Common Foods
                            </Label>
                            <Select value={selectedFood} onValueChange={(value) => {
                              setSelectedFood(value);
                              handleSelectCommonFood(value);
                            }}>
                              <SelectTrigger>
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="meal-name" className="text-sm font-medium">
                                Food Name *
                              </Label>
                              <Input
                                id="meal-name"
                                value={newMeal.name}
                                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                                placeholder="e.g., Grilled Chicken"
                              />
                            </div>

                            <div>
                              <Label htmlFor="serving-size" className="text-sm font-medium">
                                Serving Size
                              </Label>
                              <Input
                                id="serving-size"
                                value={newMeal.serving}
                                onChange={(e) => setNewMeal({ ...newMeal, serving: e.target.value })}
                                placeholder="e.g., 1 cup, 100g"
                              />
                            </div>

                            <div>
                              <Label htmlFor="calories" className="text-sm font-medium">
                                Calories *
                              </Label>
                              <Input
                                id="calories"
                                type="number"
                                value={newMeal.calories}
                                onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                                placeholder="0"
                                min="0"
                                step="1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="meal-time" className="text-sm font-medium">
                                Time
                              </Label>
                              <Input
                                id="meal-time"
                                type="time"
                                value={newMeal.time}
                                onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                              />
                            </div>

                            <div>
                              <Label htmlFor="protein" className="text-sm font-medium">
                                Protein (g)
                              </Label>
                              <Input
                                id="protein"
                                type="number"
                                value={newMeal.protein}
                                onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                                placeholder="0"
                                min="0"
                                step="0.1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="carbs" className="text-sm font-medium">
                                Carbs (g)
                              </Label>
                              <Input
                                id="carbs"
                                type="number"
                                value={newMeal.carbs}
                                onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                                placeholder="0"
                                min="0"
                                step="0.1"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <Label htmlFor="fat" className="text-sm font-medium">
                                Fat (g)
                              </Label>
                              <Input
                                id="fat"
                                type="number"
                                value={newMeal.fat}
                                onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
                                placeholder="0"
                                min="0"
                                step="0.1"
                              />
                            </div>
                          </div>

                          <Button onClick={handleAddMeal} className="w-full" disabled={!newMeal.name || !newMeal.calories}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Meal
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="meal-log" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-600" />
                            Today's Meals ({meals.length})
                          </CardTitle>
                          <CardDescription>
                            Review and manage your logged meals
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {meals.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                              <Utensils className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                              <p>No meals logged yet. Start by adding your first meal!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {meals.map((meal) => (
                                <div key={meal.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <h4 className="font-medium">{meal.name}</h4>
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        {meal.time}
                                      </span>
                                    </div>
                                    <p className="text-sm text-neutral-600 mt-1">
                                      {meal.serving} • {meal.calories} cal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMeal(meal.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="goals" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Daily Goals
                          </CardTitle>
                          <CardDescription>
                            Set your daily nutrition targets
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="goal-calories" className="text-sm font-medium">
                                Daily Calories Goal
                              </Label>
                              <Input
                                id="goal-calories"
                                type="number"
                                value={goals.calories}
                                onChange={(e) => setGoals({ ...goals, calories: parseInt(e.target.value) || 2000 })}
                                min="1200"
                                max="5000"
                                step="50"
                              />
                            </div>

                            <div>
                              <Label htmlFor="goal-protein" className="text-sm font-medium">
                                Protein Goal (g)
                              </Label>
                              <Input
                                id="goal-protein"
                                type="number"
                                value={goals.protein}
                                onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 150 })}
                                min="50"
                                max="300"
                                step="5"
                              />
                            </div>

                            <div>
                              <Label htmlFor="goal-carbs" className="text-sm font-medium">
                                Carbs Goal (g)
                              </Label>
                              <Input
                                id="goal-carbs"
                                type="number"
                                value={goals.carbs}
                                onChange={(e) => setGoals({ ...goals, carbs: parseInt(e.target.value) || 250 })}
                                min="100"
                                max="500"
                                step="10"
                              />
                            </div>

                            <div>
                              <Label htmlFor="goal-fat" className="text-sm font-medium">
                                Fat Goal (g)
                              </Label>
                              <Input
                                id="goal-fat"
                                type="number"
                                value={goals.fat}
                                onChange={(e) => setGoals({ ...goals, fat: parseInt(e.target.value) || 67 })}
                                min="30"
                                max="150"
                                step="5"
                              />
                            </div>
                          </div>

                          <Alert>
                            <AlertDescription>
                              Goals are automatically saved and applied to your daily tracking.
                              Recommended: 45-65% carbs, 20-35% fat, 10-35% protein of total calories.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </section>

          {/* Educational Content */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                  Complete Guide to Meal Tracking and Calorie Management
                </h2>
                <p className="text-lg text-neutral-600">
                  Learn how to effectively track your meals and achieve your nutrition goals
                </p>
              </div>

              <div className="prose prose-lg max-w-none">
                <h3>Why Track Your Meals?</h3>
                <p>
                  Meal tracking is one of the most effective ways to maintain a healthy diet and achieve your fitness goals. 
                  Research shows that people who track their food intake are more likely to lose weight and maintain healthy eating habits. 
                  Our meal calorie tracker helps you monitor your daily intake of calories and macronutrients (protein, carbohydrates, and fat).
                </p>

                <h3>How to Use the Meal Calorie Tracker</h3>
                <ol>
                  <li><strong>Set Your Goals:</strong> Start by setting realistic daily targets for calories, protein, carbs, and fat based on your health objectives.</li>
                  <li><strong>Add Meals:</strong> Log every meal and snack throughout the day. Use our quick-select common foods or manually enter nutrition information.</li>
                  <li><strong>Monitor Progress:</strong> Track your daily progress with visual indicators and see how close you are to meeting your goals.</li>
                  <li><strong>Adjust as Needed:</strong> Use the insights to make informed decisions about your remaining meals for the day.</li>
                </ol>

                <h3>Understanding Macronutrients</h3>
                <ul>
                  <li><strong>Protein (4 calories/gram):</strong> Essential for muscle building and repair. Aim for 0.8-1.2g per kg of body weight.</li>
                  <li><strong>Carbohydrates (4 calories/gram):</strong> Your body's primary energy source. Choose complex carbs for sustained energy.</li>
                  <li><strong>Fat (9 calories/gram):</strong> Important for hormone production and nutrient absorption. Focus on healthy unsaturated fats.</li>
                </ul>

                <h3>Tips for Successful Meal Tracking</h3>
                <ul>
                  <li>Be consistent - track every meal and snack</li>
                  <li>Measure portions accurately for better results</li>
                  <li>Plan your meals in advance when possible</li>
                  <li>Don't forget to log drinks that contain calories</li>
                  <li>Use the tracking data to identify eating patterns</li>
                  <li>Adjust your goals as your needs change</li>
                </ul>

                <h3>Common Foods Nutrition Reference</h3>
                <p>
                  Our tracker includes a database of common foods to make logging easier. Here are some examples:
                </p>
                <ul>
                  <li>Fruits: Generally 50-100 calories, high in carbs and vitamins</li>
                  <li>Lean proteins: 100-200 calories per 100g, high in protein</li>
                  <li>Whole grains: 200-300 calories per cooked cup, rich in complex carbs</li>
                  <li>Nuts and seeds: High in healthy fats and protein, calorie-dense</li>
                  <li>Vegetables: Low in calories, high in nutrients and fiber</li>
                </ul>

                <h3>Setting Realistic Goals</h3>
                <p>
                  Your daily calorie needs depend on factors like age, gender, weight, height, and activity level. 
                  A general guideline is 2000 calories for women and 2500 for men, but individual needs vary significantly. 
                  Consult with a healthcare provider or registered dietitian to determine your specific requirements.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MealCalorieTracker;
