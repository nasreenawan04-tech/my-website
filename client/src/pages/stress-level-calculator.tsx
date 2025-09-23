import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Activity, Users, Briefcase, Moon, Coffee, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import ToolHeroSection from '@/components/ToolHeroSection';
import ShareResultsButton from '@/components/ShareResultsButton';

interface StressResult {
  overallScore: number;
  level: string;
  category: 'Low' | 'Moderate' | 'High' | 'Very High';
  factors: {
    sleep: number;
    work: number;
    social: number;
    physical: number;
    lifestyle: number;
  };
  recommendations: string[];
  riskFactors: string[];
}

const StressLevelCalculator = () => {
  // Form state
  const [sleepHours, setSleepHours] = useState([7]);
  const [sleepQuality, setSleepQuality] = useState('');
  const [workStress, setWorkStress] = useState([5]);
  const [workHours, setWorkHours] = useState('');
  const [exerciseFrequency, setExerciseFrequency] = useState('');
  const [socialSupport, setSocialSupport] = useState('');
  const [workLifeBalance, setWorkLifeBalance] = useState([5]);
  const [anxietyLevel, setAnxietyLevel] = useState([5]);
  const [caffeineIntake, setCaffeineIntake] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [financialStress, setFinancialStress] = useState([5]);
  const [healthIssues, setHealthIssues] = useState('');
  const [copingMechanisms, setCopingMechanisms] = useState('');
  const [age, setAge] = useState('');
  const [result, setResult] = useState<StressResult | null>(null);

  const calculateStressLevel = () => {
    let totalScore = 0;
    let maxScore = 0;
    const factors = {
      sleep: 0,
      work: 0,
      social: 0,
      physical: 0,
      lifestyle: 0
    };

    // Sleep factors (25% weight)
    const sleepScore = calculateSleepScore();
    factors.sleep = sleepScore;
    totalScore += sleepScore * 0.25;
    maxScore += 100 * 0.25;

    // Work factors (25% weight)
    const workScore = calculateWorkScore();
    factors.work = workScore;
    totalScore += workScore * 0.25;
    maxScore += 100 * 0.25;

    // Social factors (20% weight)
    const socialScore = calculateSocialScore();
    factors.social = socialScore;
    totalScore += socialScore * 0.20;
    maxScore += 100 * 0.20;

    // Physical factors (15% weight)
    const physicalScore = calculatePhysicalScore();
    factors.physical = physicalScore;
    totalScore += physicalScore * 0.15;
    maxScore += 100 * 0.15;

    // Lifestyle factors (15% weight)
    const lifestyleScore = calculateLifestyleScore();
    factors.lifestyle = lifestyleScore;
    totalScore += lifestyleScore * 0.15;
    maxScore += 100 * 0.15;

    const overallScore = Math.round((totalScore / maxScore) * 100);
    
    let level = '';
    let category: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
    
    if (overallScore >= 80) {
      level = 'Very High Stress';
      category = 'Very High';
    } else if (overallScore >= 60) {
      level = 'High Stress';
      category = 'High';
    } else if (overallScore >= 40) {
      level = 'Moderate Stress';
      category = 'Moderate';
    } else {
      level = 'Low Stress';
      category = 'Low';
    }

    const recommendations = generateRecommendations(factors, overallScore);
    const riskFactors = identifyRiskFactors(factors);

    setResult({
      overallScore,
      level,
      category,
      factors,
      recommendations,
      riskFactors
    });
  };

  const calculateSleepScore = () => {
    let score = 0;
    
    // Sleep hours (0-40 points)
    const hours = sleepHours[0];
    if (hours < 6) score += 40;
    else if (hours < 7) score += 30;
    else if (hours <= 8) score += 10;
    else if (hours <= 9) score += 15;
    else score += 25;

    // Sleep quality (0-60 points)
    switch(sleepQuality) {
      case 'very-poor': score += 60; break;
      case 'poor': score += 45; break;
      case 'fair': score += 30; break;
      case 'good': score += 15; break;
      case 'excellent': score += 0; break;
    }

    return Math.min(score, 100);
  };

  const calculateWorkScore = () => {
    let score = 0;
    
    // Work stress level (0-50 points)
    score += workStress[0] * 10;

    // Work hours (0-30 points)
    switch(workHours) {
      case 'under-30': score += 5; break;
      case '30-40': score += 10; break;
      case '40-50': score += 20; break;
      case '50-60': score += 35; break;
      case 'over-60': score += 50; break;
    }

    // Work-life balance (0-20 points)
    score += (10 - workLifeBalance[0]) * 2;

    return Math.min(score, 100);
  };

  const calculateSocialScore = () => {
    let score = 0;
    
    // Social support (0-40 points)
    switch(socialSupport) {
      case 'none': score += 40; break;
      case 'limited': score += 30; break;
      case 'moderate': score += 20; break;
      case 'good': score += 10; break;
      case 'excellent': score += 0; break;
    }

    // Relationship status (0-30 points)
    switch(relationshipStatus) {
      case 'single-isolated': score += 30; break;
      case 'single-social': score += 15; break;
      case 'relationship-troubled': score += 25; break;
      case 'relationship-stable': score += 5; break;
      case 'married-happy': score += 0; break;
    }

    // Financial stress (0-30 points)
    score += financialStress[0] * 3;

    return Math.min(score, 100);
  };

  const calculatePhysicalScore = () => {
    let score = 0;
    
    // Exercise frequency (0-40 points)
    switch(exerciseFrequency) {
      case 'none': score += 40; break;
      case 'rarely': score += 30; break;
      case '1-2-weekly': score += 20; break;
      case '3-4-weekly': score += 10; break;
      case 'daily': score += 0; break;
    }

    // Health issues (0-35 points)
    switch(healthIssues) {
      case 'multiple-chronic': score += 35; break;
      case 'single-chronic': score += 25; break;
      case 'minor-occasional': score += 15; break;
      case 'rare-minor': score += 5; break;
      case 'none': score += 0; break;
    }

    // Anxiety level (0-25 points)
    score += anxietyLevel[0] * 2.5;

    return Math.min(score, 100);
  };

  const calculateLifestyleScore = () => {
    let score = 0;
    
    // Caffeine intake (0-30 points)
    switch(caffeineIntake) {
      case 'none': score += 0; break;
      case '1-2-cups': score += 5; break;
      case '3-4-cups': score += 15; break;
      case '5-plus-cups': score += 30; break;
    }

    // Coping mechanisms (0-40 points)
    switch(copingMechanisms) {
      case 'unhealthy': score += 40; break;
      case 'mixed': score += 25; break;
      case 'some-healthy': score += 15; break;
      case 'mostly-healthy': score += 5; break;
      case 'very-healthy': score += 0; break;
    }

    // Age factor (0-30 points)
    const ageNum = parseInt(age);
    if (ageNum >= 18 && ageNum <= 25) score += 15; // Higher stress in early adulthood
    else if (ageNum >= 26 && ageNum <= 35) score += 20; // Peak career stress
    else if (ageNum >= 36 && ageNum <= 50) score += 25; // Mid-life pressures
    else if (ageNum >= 51 && ageNum <= 65) score += 15; // Health concerns emerge
    else score += 10; // Lower baseline stress

    return Math.min(score, 100);
  };

  const generateRecommendations = (factors: any, score: number) => {
    const recommendations = [];
    
    if (factors.sleep > 60) {
      recommendations.push("Prioritize 7-9 hours of quality sleep each night");
      recommendations.push("Create a consistent bedtime routine and sleep schedule");
    }
    
    if (factors.work > 60) {
      recommendations.push("Consider discussing workload with your supervisor");
      recommendations.push("Practice time management and delegation techniques");
      recommendations.push("Take regular breaks during work hours");
    }
    
    if (factors.social > 60) {
      recommendations.push("Build stronger social connections and support networks");
      recommendations.push("Consider professional counseling for relationship issues");
      recommendations.push("Join community groups or activities");
    }
    
    if (factors.physical > 60) {
      recommendations.push("Incorporate regular physical exercise into your routine");
      recommendations.push("Practice relaxation techniques like meditation or yoga");
      recommendations.push("Consider consulting a healthcare professional");
    }
    
    if (factors.lifestyle > 60) {
      recommendations.push("Reduce caffeine intake, especially in the afternoon");
      recommendations.push("Develop healthy coping strategies");
      recommendations.push("Consider stress management workshops or therapy");
    }

    // General recommendations based on overall score
    if (score >= 70) {
      recommendations.push("Seek professional help from a mental health counselor");
      recommendations.push("Consider stress management medication if recommended by a doctor");
    }
    
    recommendations.push("Practice mindfulness and deep breathing exercises");
    recommendations.push("Maintain a balanced diet rich in nutrients");
    recommendations.push("Limit screen time before bed");

    return recommendations.slice(0, 8); // Limit to 8 recommendations
  };

  const identifyRiskFactors = (factors: any) => {
    const risks = [];
    
    if (factors.sleep > 70) risks.push("Severe sleep deprivation");
    if (factors.work > 70) risks.push("Work burnout risk");
    if (factors.social > 70) risks.push("Social isolation");
    if (factors.physical > 70) risks.push("Physical health impact");
    if (factors.lifestyle > 70) risks.push("Unhealthy coping patterns");
    
    return risks;
  };

  const resetCalculator = () => {
    setSleepHours([7]);
    setSleepQuality('');
    setWorkStress([5]);
    setWorkHours('');
    setExerciseFrequency('');
    setSocialSupport('');
    setWorkLifeBalance([5]);
    setAnxietyLevel([5]);
    setCaffeineIntake('');
    setRelationshipStatus('');
    setFinancialStress([5]);
    setHealthIssues('');
    setCopingMechanisms('');
    setAge('');
    setResult(null);
  };

  const getStressColor = (category: string) => {
    switch(category) {
      case 'Low': return 'text-green-600';
      case 'Moderate': return 'text-yellow-600';
      case 'High': return 'text-orange-600';
      case 'Very High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStressBgColor = (category: string) => {
    switch(category) {
      case 'Low': return 'bg-green-50 border-green-200';
      case 'Moderate': return 'bg-yellow-50 border-yellow-200';
      case 'High': return 'bg-orange-50 border-orange-200';
      case 'Very High': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const isFormValid = () => {
    return sleepQuality && workHours && exerciseFrequency && socialSupport && 
           relationshipStatus && caffeineIntake && healthIssues && copingMechanisms && age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Stress Level Calculator - Free Stress Assessment Tool | DapsiWow</title>
        <meta name="description" content="Assess your stress levels with our comprehensive stress calculator. Get personalized stress management recommendations based on lifestyle factors, work-life balance, sleep quality, and mental health indicators." />
        <meta name="keywords" content="stress calculator, stress assessment, stress level test, mental health calculator, work stress, anxiety assessment, stress management, wellness tool, psychological stress, burnout assessment" />
        <meta property="og:title" content="Stress Level Calculator - Free Stress Assessment Tool | DapsiWow" />
        <meta property="og:description" content="Comprehensive stress level assessment with personalized recommendations. Analyze work stress, sleep quality, social support, and lifestyle factors." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/stress-level-calculator" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/stress-level-calculator" />
      </Helmet>

      <Header />

      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="text-page-title">
            Stress Level Calculator
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Assess your stress levels and get personalized recommendations for better mental health and wellbeing
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg" data-testid="card-stress-calculator">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="text-2xl text-center text-purple-800">
                  Stress Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Sleep Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Sleep & Rest</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sleep-hours">Average Sleep Hours per Night</Label>
                    <div className="px-3">
                      <Slider
                        id="sleep-hours"
                        min={3}
                        max={12}
                        step={0.5}
                        value={sleepHours}
                        onValueChange={setSleepHours}
                        className="w-full"
                        data-testid="slider-sleep-hours"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>3h</span>
                        <span className="font-medium">{sleepHours[0]}h</span>
                        <span>12h</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleep-quality">Sleep Quality</Label>
                    <Select value={sleepQuality} onValueChange={setSleepQuality}>
                      <SelectTrigger data-testid="select-sleep-quality">
                        <SelectValue placeholder="Select sleep quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent - Restful and refreshing</SelectItem>
                        <SelectItem value="good">Good - Usually sleep well</SelectItem>
                        <SelectItem value="fair">Fair - Some restless nights</SelectItem>
                        <SelectItem value="poor">Poor - Often wake up tired</SelectItem>
                        <SelectItem value="very-poor">Very Poor - Chronic sleep issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Work Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Work & Career</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work-stress">Work Stress Level (1-10)</Label>
                    <div className="px-3">
                      <Slider
                        id="work-stress"
                        min={1}
                        max={10}
                        step={1}
                        value={workStress}
                        onValueChange={setWorkStress}
                        className="w-full"
                        data-testid="slider-work-stress"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Low</span>
                        <span className="font-medium">{workStress[0]}/10</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work-hours">Weekly Work Hours</Label>
                    <Select value={workHours} onValueChange={setWorkHours}>
                      <SelectTrigger data-testid="select-work-hours">
                        <SelectValue placeholder="Select work hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-30">Under 30 hours</SelectItem>
                        <SelectItem value="30-40">30-40 hours</SelectItem>
                        <SelectItem value="40-50">40-50 hours</SelectItem>
                        <SelectItem value="50-60">50-60 hours</SelectItem>
                        <SelectItem value="over-60">Over 60 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work-life-balance">Work-Life Balance (1-10)</Label>
                    <div className="px-3">
                      <Slider
                        id="work-life-balance"
                        min={1}
                        max={10}
                        step={1}
                        value={workLifeBalance}
                        onValueChange={setWorkLifeBalance}
                        className="w-full"
                        data-testid="slider-work-life-balance"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Poor</span>
                        <span className="font-medium">{workLifeBalance[0]}/10</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social & Relationships Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Social & Relationships</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="social-support">Social Support System</Label>
                    <Select value={socialSupport} onValueChange={setSocialSupport}>
                      <SelectTrigger data-testid="select-social-support">
                        <SelectValue placeholder="Select social support level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent - Strong support network</SelectItem>
                        <SelectItem value="good">Good - Several close friends/family</SelectItem>
                        <SelectItem value="moderate">Moderate - Some support available</SelectItem>
                        <SelectItem value="limited">Limited - Few people to rely on</SelectItem>
                        <SelectItem value="none">None - Feel isolated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship-status">Relationship Status</Label>
                    <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
                      <SelectTrigger data-testid="select-relationship-status">
                        <SelectValue placeholder="Select relationship status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="married-happy">Married/Partnered - Happy</SelectItem>
                        <SelectItem value="relationship-stable">In Relationship - Stable</SelectItem>
                        <SelectItem value="relationship-troubled">In Relationship - Troubled</SelectItem>
                        <SelectItem value="single-social">Single - Socially Active</SelectItem>
                        <SelectItem value="single-isolated">Single - Isolated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financial-stress">Financial Stress Level (1-10)</Label>
                    <div className="px-3">
                      <Slider
                        id="financial-stress"
                        min={1}
                        max={10}
                        step={1}
                        value={financialStress}
                        onValueChange={setFinancialStress}
                        className="w-full"
                        data-testid="slider-financial-stress"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Low</span>
                        <span className="font-medium">{financialStress[0]}/10</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physical Health Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Physical Health</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exercise-frequency">Exercise Frequency</Label>
                    <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                      <SelectTrigger data-testid="select-exercise-frequency">
                        <SelectValue placeholder="Select exercise frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily exercise</SelectItem>
                        <SelectItem value="3-4-weekly">3-4 times per week</SelectItem>
                        <SelectItem value="1-2-weekly">1-2 times per week</SelectItem>
                        <SelectItem value="rarely">Rarely exercise</SelectItem>
                        <SelectItem value="none">No regular exercise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="health-issues">Health Issues</Label>
                    <Select value={healthIssues} onValueChange={setHealthIssues}>
                      <SelectTrigger data-testid="select-health-issues">
                        <SelectValue placeholder="Select health status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No health issues</SelectItem>
                        <SelectItem value="rare-minor">Rare minor issues</SelectItem>
                        <SelectItem value="minor-occasional">Minor occasional issues</SelectItem>
                        <SelectItem value="single-chronic">Single chronic condition</SelectItem>
                        <SelectItem value="multiple-chronic">Multiple chronic conditions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anxiety-level">Anxiety Level (1-10)</Label>
                    <div className="px-3">
                      <Slider
                        id="anxiety-level"
                        min={1}
                        max={10}
                        step={1}
                        value={anxietyLevel}
                        onValueChange={setAnxietyLevel}
                        className="w-full"
                        data-testid="slider-anxiety-level"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Low</span>
                        <span className="font-medium">{anxietyLevel[0]}/10</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Lifestyle Factors</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="caffeine-intake">Daily Caffeine Intake</Label>
                    <Select value={caffeineIntake} onValueChange={setCaffeineIntake}>
                      <SelectTrigger data-testid="select-caffeine-intake">
                        <SelectValue placeholder="Select caffeine intake" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No caffeine</SelectItem>
                        <SelectItem value="1-2-cups">1-2 cups coffee/day</SelectItem>
                        <SelectItem value="3-4-cups">3-4 cups coffee/day</SelectItem>
                        <SelectItem value="5-plus-cups">5+ cups coffee/day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coping-mechanisms">Coping Mechanisms</Label>
                    <Select value={copingMechanisms} onValueChange={setCopingMechanisms}>
                      <SelectTrigger data-testid="select-coping-mechanisms">
                        <SelectValue placeholder="Select coping style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very-healthy">Very Healthy - Meditation, exercise, therapy</SelectItem>
                        <SelectItem value="mostly-healthy">Mostly Healthy - Exercise, hobbies, friends</SelectItem>
                        <SelectItem value="some-healthy">Some Healthy - Mix of good and bad habits</SelectItem>
                        <SelectItem value="mixed">Mixed - Some unhealthy patterns</SelectItem>
                        <SelectItem value="unhealthy">Unhealthy - Alcohol, smoking, isolation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="13"
                      max="120"
                      data-testid="input-age"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={calculateStressLevel}
                    disabled={!isFormValid()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    data-testid="button-calculate-stress"
                  >
                    Calculate Stress Level
                  </Button>
                  <Button 
                    onClick={resetCalculator}
                    variant="outline"
                    className="px-6"
                    data-testid="button-reset-stress"
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Result */}
                <Card className={`border-2 shadow-lg ${getStressBgColor(result.category)}`} data-testid="card-stress-result">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <Heart className={`w-12 h-12 ${getStressColor(result.category)}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2" data-testid="text-stress-level">
                        {result.level}
                      </h3>
                      <div className="text-4xl font-bold mb-2" data-testid="text-stress-score">
                        <span className={getStressColor(result.category)}>
                          {result.overallScore}/100
                        </span>
                      </div>
                      <Badge 
                        variant={result.category === 'Low' ? 'default' : 'destructive'}
                        className="text-sm px-4 py-1"
                        data-testid={`badge-stress-${result.category.toLowerCase().replace(' ', '-')}`}
                      >
                        {result.category} Stress Level
                      </Badge>
                      
                      <div className="mt-4">
                        <ShareResultsButton 
                          toolId="stress-level-calculator"
                          results={{
                            overallScore: result.overallScore,
                            level: result.level,
                            category: result.category
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Factor Breakdown */}
                <Card className="shadow-lg" data-testid="card-stress-factors">
                  <CardHeader>
                    <CardTitle className="text-xl text-center">Stress Factors Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(result.factors).map(([factor, score]) => (
                      <div key={factor} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="capitalize font-medium">{factor === 'physical' ? 'Physical Health' : factor}</span>
                          <span className={`font-bold ${score > 70 ? 'text-red-600' : score > 50 ? 'text-orange-600' : score > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {Math.round(score)}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${score > 70 ? 'bg-red-500' : score > 50 ? 'bg-orange-500' : score > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{width: `${score}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risk Factors */}
                {result.riskFactors.length > 0 && (
                  <Card className="shadow-lg border-orange-200" data-testid="card-risk-factors">
                    <CardHeader className="bg-orange-50">
                      <CardTitle className="text-xl text-center text-orange-800 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Risk Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-2">
                        {result.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-center gap-2 text-orange-700">
                            <AlertTriangle className="w-4 h-4" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="shadow-lg border-green-200" data-testid="card-recommendations">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-xl text-center text-green-800 flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Personalized Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-3">
                      {result.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-lg" data-testid="card-instructions">
                <CardHeader>
                  <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                    <Info className="w-5 h-5" />
                    How to Use This Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Complete all sections to get a comprehensive stress assessment:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-purple-600" />
                        <span><strong>Sleep & Rest:</strong> Sleep hours and quality</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        <span><strong>Work & Career:</strong> Work stress and hours</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span><strong>Social & Relationships:</strong> Support systems</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span><strong>Physical Health:</strong> Exercise and wellness</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-purple-600" />
                        <span><strong>Lifestyle:</strong> Daily habits and coping</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This assessment is for informational purposes only and should not replace professional medical or psychological advice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Understanding Stress Levels</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Learn about stress factors, their impact on your health, and effective management strategies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  What is Stress?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stress is your body's natural response to challenges and demands. While some stress can be beneficial, 
                  chronic stress can negatively impact your physical and mental health, relationships, and overall quality of life.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Health Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Chronic stress can lead to various health issues including high blood pressure, heart disease, 
                  weakened immune system, digestive problems, anxiety, depression, and sleep disorders.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Management Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Effective stress management includes regular exercise, adequate sleep, healthy diet, 
                  mindfulness practices, social support, time management, and professional help when needed.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Stress Level Categories</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <h4 className="font-bold text-green-800 mb-2">Low Stress (0-39)</h4>
                <p className="text-sm text-green-700">
                  Well-managed stress with healthy coping mechanisms. Minimal impact on daily life.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <h4 className="font-bold text-yellow-800 mb-2">Moderate Stress (40-59)</h4>
                <p className="text-sm text-yellow-700">
                  Some stress factors present. May benefit from improved stress management techniques.
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <h4 className="font-bold text-orange-800 mb-2">High Stress (60-79)</h4>
                <p className="text-sm text-orange-700">
                  Significant stress levels affecting daily life. Active intervention recommended.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <h4 className="font-bold text-red-800 mb-2">Very High Stress (80-100)</h4>
                <p className="text-sm text-red-700">
                  Severe stress levels requiring immediate attention and professional support.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4 text-center">Important Disclaimer</h3>
            <p className="text-blue-700 text-center">
              This stress calculator is designed for educational purposes and general awareness. It should not be used 
              as a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing severe 
              stress, anxiety, or depression, please consult with a qualified healthcare professional or mental health provider.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StressLevelCalculator;