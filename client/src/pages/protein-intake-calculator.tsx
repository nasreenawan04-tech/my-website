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
import { Calculator, Zap } from 'lucide-react';

interface ProteinIntakeResult {
  dailyProteinIntake: number;
  proteinPerMeal: number;
  proteinSources: {
    chicken: number;
    eggs: number;
    fish: number;
    beans: number;
    nuts: number;
    quinoa: number;
  };
  recommendations: string[];
  proteinTiming: string[];
}

const ProteinIntakeCalculator = () => {
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [isPregnant, setIsPregnant] = useState('');
  const [isBreastfeeding, setIsBreastfeeding] = useState('');
  const [result, setResult] = useState<ProteinIntakeResult | null>(null);

  const calculateProteinIntake = () => {
    if (!weight || !age || !gender || !activityLevel || !fitnessGoal) return;

    const weightKg = unitSystem === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    const ageNum = parseInt(age);

    // Base protein requirement calculation (grams per kg of body weight)
    let proteinPerKg = 0;

    // Set base protein requirements
    if (ageNum < 18) {
      proteinPerKg = 1.2; // Growing adolescents need more protein
    } else if (ageNum > 65) {
      proteinPerKg = 1.2; // Elderly need more protein to prevent muscle loss
    } else {
      proteinPerKg = 0.8; // Standard RDA for adults
    }

    // Adjust based on activity level
    switch (activityLevel) {
      case 'sedentary':
        // Base amount already set
        break;
      case 'light':
        proteinPerKg += 0.2;
        break;
      case 'moderate':
        proteinPerKg += 0.4;
        break;
      case 'active':
        proteinPerKg += 0.6;
        break;
      case 'very_active':
        proteinPerKg += 0.8;
        break;
    }

    // Adjust based on fitness goals
    switch (fitnessGoal) {
      case 'maintenance':
        // No additional adjustment
        break;
      case 'weight_loss':
        proteinPerKg += 0.3; // Higher protein helps preserve muscle during weight loss
        break;
      case 'muscle_gain':
        proteinPerKg += 0.6; // Higher protein for muscle building
        break;
      case 'athletic_performance':
        proteinPerKg += 0.8; // Athletes need more protein
        break;
      case 'recovery':
        proteinPerKg += 0.5; // Recovery from injury or intense training
        break;
    }

    // Health condition adjustments
    switch (healthConditions) {
      case 'none':
        break;
      case 'kidney_disease':
        proteinPerKg = Math.min(proteinPerKg, 0.6); // Reduce protein for kidney disease
        break;
      case 'diabetes':
        proteinPerKg += 0.2; // Slightly higher protein can help with blood sugar
        break;
      case 'liver_disease':
        proteinPerKg = Math.min(proteinPerKg, 0.8); // Moderate protein for liver issues
        break;
    }

    // Pregnancy and breastfeeding adjustments
    if (gender === 'female') {
      if (isPregnant === 'yes') {
        proteinPerKg += 0.3; // Additional protein during pregnancy
      }
      if (isBreastfeeding === 'yes') {
        proteinPerKg += 0.5; // Additional protein for breastfeeding
      }
    }

    const dailyProtein = weightKg * proteinPerKg;
    const proteinPerMeal = dailyProtein / 3; // Assuming 3 meals per day

    // Calculate protein sources (grams needed from each source)
    const proteinSources = {
      chicken: Math.ceil(dailyProtein / 0.31), // Chicken breast has ~31g protein per 100g
      eggs: Math.ceil(dailyProtein / 6), // One large egg has ~6g protein
      fish: Math.ceil(dailyProtein / 0.25), // Fish has ~25g protein per 100g
      beans: Math.ceil(dailyProtein / 0.09), // Beans have ~9g protein per 100g
      nuts: Math.ceil(dailyProtein / 0.15), // Nuts have ~15g protein per 100g
      quinoa: Math.ceil(dailyProtein / 0.14), // Quinoa has ~14g protein per 100g
    };

    // Generate recommendations
    const recommendations = [];
    
    if (fitnessGoal === 'muscle_gain' || activityLevel === 'very_active') {
      recommendations.push('Consider protein supplements if unable to meet needs through food');
    }
    
    if (ageNum > 50) {
      recommendations.push('Focus on high-quality, easily digestible protein sources');
    }
    
    recommendations.push('Spread protein intake evenly throughout the day');
    recommendations.push('Include both animal and plant-based protein sources for variety');
    
    if (fitnessGoal === 'weight_loss') {
      recommendations.push('Higher protein intake can help preserve muscle mass during weight loss');
    }

    // Protein timing recommendations
    const proteinTiming = [
      'Have protein within 2 hours after exercise',
      'Include protein in every meal',
      'Consider a protein-rich snack before bed for muscle recovery'
    ];

    if (activityLevel === 'very_active' || fitnessGoal === 'muscle_gain') {
      proteinTiming.push('Consume 20-25g protein within 30 minutes post-workout');
    }

    setResult({
      dailyProteinIntake: Math.round(dailyProtein),
      proteinPerMeal: Math.round(proteinPerMeal),
      proteinSources,
      recommendations,
      proteinTiming
    });
  };

  const resetCalculator = () => {
    setWeight('');
    setAge('');
    setGender('');
    setActivityLevel('');
    setFitnessGoal('');
    setHealthConditions('');
    setIsPregnant('');
    setIsBreastfeeding('');
    setUnitSystem('metric');
    setResult(null);
  };

  const formatWeight = (weight: number) => {
    const unit = unitSystem === 'metric' ? 'kg' : 'lbs';
    return `${weight.toFixed(0)} ${unit}`;
  };

  return (
    <>
      <Helmet>
        <title>Protein Intake Calculator - Calculate Your Daily Protein Needs | DapsiWow</title>
        <meta name="description" content="Calculate your daily protein intake requirements based on weight, activity level, and fitness goals. Get personalized protein recommendations and food source suggestions." />
        <meta name="keywords" content="protein intake calculator, daily protein needs, protein requirement, muscle building protein, weight loss protein, protein sources" />
        <meta property="og:title" content="Protein Intake Calculator - Calculate Your Daily Protein Needs | DapsiWow" />
        <meta property="og:description" content="Calculate your personalized daily protein requirements and get recommendations for optimal health and fitness goals." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/protein-intake-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-protein-intake-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="text-3xl w-8 h-8" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Protein Intake Calculator
              </h1>
              <p className="text-xl text-orange-100 max-w-2xl mx-auto">
                Calculate your daily protein needs based on your goals, activity level, and personal factors
              </p>
            </div>
          </section>

          {/* Calculator Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Personal Information</h2>
                      
                      {/* Unit System */}
                      <div className="space-y-3">
                        <Label>Unit System</Label>
                        <RadioGroup 
                          value={unitSystem} 
                          onValueChange={setUnitSystem}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                            <Label htmlFor="metric">Metric (kg)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                            <Label htmlFor="imperial">Imperial (lbs)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={unitSystem === 'metric' ? "70" : "154"}
                          min="0"
                          step="0.1"
                          data-testid="input-weight"
                        />
                      </div>

                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="30"
                          min="1"
                          max="120"
                          data-testid="input-age"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender <span className="text-red-500">*</span>
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Activity Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Activity Level <span className="text-red-500">*</span>
                        </Label>
                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-activity">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                            <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                            <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                            <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fitness Goal */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Fitness Goal <span className="text-red-500">*</span>
                        </Label>
                        <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-goal">
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                            <SelectItem value="weight_loss">Weight Loss</SelectItem>
                            <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                            <SelectItem value="athletic_performance">Athletic Performance</SelectItem>
                            <SelectItem value="recovery">Recovery/Rehabilitation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Health Conditions */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Health Conditions
                        </Label>
                        <Select value={healthConditions} onValueChange={setHealthConditions}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-health">
                            <SelectValue placeholder="Select any relevant conditions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="diabetes">Diabetes</SelectItem>
                            <SelectItem value="kidney_disease">Kidney Disease</SelectItem>
                            <SelectItem value="liver_disease">Liver Disease</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Female-specific options */}
                      {gender === 'female' && (
                        <>
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Are you pregnant?
                            </Label>
                            <Select value={isPregnant} onValueChange={setIsPregnant}>
                              <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-pregnant">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">
                              Are you breastfeeding?
                            </Label>
                            <Select value={isBreastfeeding} onValueChange={setIsBreastfeeding}>
                              <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-breastfeeding">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">No</SelectItem>
                                <SelectItem value="yes">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateProteinIntake}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f97316' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Protein Intake
                        </Button>
                        <Button
                          onClick={resetCalculator}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-reset"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Protein Intake Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="protein-intake-results">
                          {/* Daily Protein Intake */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Daily Protein Intake</span>
                              <span className="text-2xl font-bold text-orange-600" data-testid="text-daily-protein">
                                {result.dailyProteinIntake}g
                              </span>
                            </div>
                          </div>

                          {/* Protein Per Meal */}
                          <div className="bg-orange-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Protein Distribution</h3>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium" data-testid="text-protein-per-meal">
                                ~{result.proteinPerMeal}g per meal
                              </span>
                              <p className="text-xs text-gray-500 mt-1">Based on 3 meals per day</p>
                            </div>
                          </div>

                          {/* Protein Sources */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Food Sources (to meet daily needs)</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Chicken breast</span>
                                <span className="font-medium">{result.proteinSources.chicken}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Large eggs</span>
                                <span className="font-medium">{result.proteinSources.eggs} eggs</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fish (salmon/tuna)</span>
                                <span className="font-medium">{result.proteinSources.fish}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Beans/Lentils</span>
                                <span className="font-medium">{result.proteinSources.beans}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Mixed nuts</span>
                                <span className="font-medium">{result.proteinSources.nuts}g</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quinoa (cooked)</span>
                                <span className="font-medium">{result.proteinSources.quinoa}g</span>
                              </div>
                            </div>
                          </div>

                          {/* Protein Timing */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Protein Timing</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {result.proteinTiming.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {result.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your information to calculate daily protein intake</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Protein */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Protein Requirements</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Protein Matters</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Protein is essential for building and repairing tissues, making enzymes and hormones, 
                        and maintaining immune function. It's made up of amino acids, which are the building blocks 
                        your body needs for muscle growth, recovery, and overall health.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Factors Affecting Protein Needs</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Body weight and muscle mass</li>
                        <li>• Physical activity level and type</li>
                        <li>• Age and life stage</li>
                        <li>• Health conditions and goals</li>
                        <li>• Pregnancy and breastfeeding</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Protein Quality</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Complete Proteins</div>
                            <div className="text-sm text-gray-600">Contain all essential amino acids</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Animal Sources</div>
                            <div className="text-sm text-gray-600">Meat, fish, dairy, eggs</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Plant Sources</div>
                            <div className="text-sm text-gray-600">Beans, nuts, quinoa, tofu</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips and Guidelines */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Protein Optimization Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Maximizing Protein Benefits</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Combine different protein sources for complete amino acid profile</li>
                        <li>• Time protein intake around workouts for optimal recovery</li>
                        <li>• Include protein in every meal to maintain muscle protein synthesis</li>
                        <li>• Choose lean protein sources to manage calorie intake</li>
                        <li>• Stay hydrated when increasing protein intake</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Signs of Adequate Protein</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Stable energy levels throughout the day</li>
                        <li>• Good muscle recovery after exercise</li>
                        <li>• Healthy hair, skin, and nails</li>
                        <li>• Strong immune system</li>
                        <li>• Feeling satiated after meals</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ProteinIntakeCalculator;