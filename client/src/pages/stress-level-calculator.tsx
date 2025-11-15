
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    if (ageNum >= 18 && ageNum <= 25) score += 15;
    else if (ageNum >= 26 && ageNum <= 35) score += 20;
    else if (ageNum >= 36 && ageNum <= 50) score += 25;
    else if (ageNum >= 51 && ageNum <= 65) score += 15;
    else score += 10;

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

    if (score >= 70) {
      recommendations.push("Seek professional help from a mental health counselor");
      recommendations.push("Consider stress management medication if recommended by a doctor");
    }
    
    recommendations.push("Practice mindfulness and deep breathing exercises");
    recommendations.push("Maintain a balanced diet rich in nutrients");
    recommendations.push("Limit screen time before bed");

    return recommendations.slice(0, 8);
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

  const handleSampleData = () => {
    setSleepHours([6]);
    setSleepQuality('fair');
    setWorkStress([7]);
    setWorkHours('40-50');
    setExerciseFrequency('1-2-weekly');
    setSocialSupport('moderate');
    setWorkLifeBalance([4]);
    setAnxietyLevel([6]);
    setCaffeineIntake('3-4-cups');
    setRelationshipStatus('relationship-stable');
    setFinancialStress([6]);
    setHealthIssues('minor-occasional');
    setCopingMechanisms('some-healthy');
    setAge('30');
  };

  const resetTool = () => {
    resetCalculator();
    setShowAdvanced(false);
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

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Stress Level Calculator - Free Comprehensive Stress Assessment Tool | DapsiWow</title>
        <meta name="description" content="Comprehensive stress level assessment calculator with personalized recommendations. Analyze work stress, sleep quality, social support, and lifestyle factors for complete mental health evaluation and stress management guidance." />
        <meta name="keywords" content="stress calculator, stress assessment, stress level test, mental health calculator, work stress, anxiety assessment, stress management, wellness tool, psychological stress, burnout assessment, stress analysis, mental health evaluation" />
        <meta property="og:title" content="Stress Level Calculator - Free Comprehensive Stress Assessment Tool | DapsiWow" />
        <meta property="og:description" content="Professional stress level assessment with personalized recommendations. Analyze multiple stress factors and get actionable insights for better mental health and wellbeing management." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/stress-level-calculator" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/stress-level-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Stress Level Calculator",
            "description": "Professional stress level assessment calculator with comprehensive analysis of work stress, sleep quality, social support, and lifestyle factors for mental health evaluation and stress management guidance.",
            "url": "https://dapsiwow.com/tools/stress-level-calculator",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Comprehensive stress assessment across multiple factors",
              "Personalized stress management recommendations",
              "Work-life balance evaluation and analysis",
              "Sleep quality impact on stress levels",
              "Social support system assessment",
              "Physical health and exercise impact analysis"
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <span className="text-xs sm:text-sm font-medium text-purple-700">Mental Health Assessment Tool</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight" data-testid="page-title">
                <span className="block">Stress Level</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-1 sm:mt-2">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-slate-600 max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Comprehensive stress assessment with personalized recommendations based on work, sleep, relationships, and lifestyle factors
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Stress Assessment Tool</h2>
                    <p className="text-gray-600">Evaluate your stress levels across multiple life factors and receive personalized recommendations</p>
                  </div>

                  {/* Assessment Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Sleep & Rest */}
                    <div className="space-y-4 bg-blue-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-900">Sleep & Rest Quality</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="sleep-hours" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Average Sleep Hours per Night
                          </Label>
                          <div className="mt-2 px-3">
                            <Slider
                              id="sleep-hours"
                              min={3}
                              max={12}
                              step={0.5}
                              value={sleepHours}
                              onValueChange={setSleepHours}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-blue-600 mt-1">
                              <span>3h</span>
                              <span className="font-medium">{sleepHours[0]}h</span>
                              <span>12h</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="sleep-quality" className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                            Sleep Quality
                          </Label>
                          <Select value={sleepQuality} onValueChange={setSleepQuality}>
                            <SelectTrigger className="mt-1 h-12 border-2 border-blue-200 rounded-xl text-base focus:border-blue-500 focus:ring-blue-500">
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
                    </div>

                    {/* Work & Career */}
                    <div className="space-y-4 bg-green-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-green-900">Work & Career</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="work-stress" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Work Stress Level (1-10)
                          </Label>
                          <div className="mt-2 px-3">
                            <Slider
                              id="work-stress"
                              min={1}
                              max={10}
                              step={1}
                              value={workStress}
                              onValueChange={setWorkStress}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-green-600 mt-1">
                              <span>Low</span>
                              <span className="font-medium">{workStress[0]}/10</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="work-hours" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Weekly Work Hours
                          </Label>
                          <Select value={workHours} onValueChange={setWorkHours}>
                            <SelectTrigger className="mt-1 h-12 border-2 border-green-200 rounded-xl text-base focus:border-green-500 focus:ring-green-500">
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
                        <div>
                          <Label htmlFor="work-life-balance" className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                            Work-Life Balance (1-10)
                          </Label>
                          <div className="mt-2 px-3">
                            <Slider
                              id="work-life-balance"
                              min={1}
                              max={10}
                              step={1}
                              value={workLifeBalance}
                              onValueChange={setWorkLifeBalance}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-green-600 mt-1">
                              <span>Poor</span>
                              <span className="font-medium">{workLifeBalance[0]}/10</span>
                              <span>Excellent</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social & Relationships */}
                    <div className="space-y-4 bg-purple-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-purple-900">Social & Relationships</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="social-support" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Social Support System
                          </Label>
                          <Select value={socialSupport} onValueChange={setSocialSupport}>
                            <SelectTrigger className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500">
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
                        <div>
                          <Label htmlFor="relationship-status" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Relationship Status
                          </Label>
                          <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
                            <SelectTrigger className="mt-1 h-12 border-2 border-purple-200 rounded-xl text-base focus:border-purple-500 focus:ring-purple-500">
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
                        <div>
                          <Label htmlFor="financial-stress" className="text-sm font-semibold text-purple-800 uppercase tracking-wide">
                            Financial Stress Level (1-10)
                          </Label>
                          <div className="mt-2 px-3">
                            <Slider
                              id="financial-stress"
                              min={1}
                              max={10}
                              step={1}
                              value={financialStress}
                              onValueChange={setFinancialStress}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-purple-600 mt-1">
                              <span>Low</span>
                              <span className="font-medium">{financialStress[0]}/10</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Physical Health */}
                    <div className="space-y-4 bg-orange-50 rounded-xl p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-orange-900">Physical Health</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="exercise-frequency" className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                            Exercise Frequency
                          </Label>
                          <Select value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                            <SelectTrigger className="mt-1 h-12 border-2 border-orange-200 rounded-xl text-base focus:border-orange-500 focus:ring-orange-500">
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
                        <div>
                          <Label htmlFor="health-issues" className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                            Health Issues
                          </Label>
                          <Select value={healthIssues} onValueChange={setHealthIssues}>
                            <SelectTrigger className="mt-1 h-12 border-2 border-orange-200 rounded-xl text-base focus:border-orange-500 focus:ring-orange-500">
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
                        <div>
                          <Label htmlFor="anxiety-level" className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                            Anxiety Level (1-10)
                          </Label>
                          <div className="mt-2 px-3">
                            <Slider
                              id="anxiety-level"
                              min={1}
                              max={10}
                              step={1}
                              value={anxietyLevel}
                              onValueChange={setAnxietyLevel}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-orange-600 mt-1">
                              <span>Low</span>
                              <span className="font-medium">{anxietyLevel[0]}/10</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lifestyle Factors */}
                  <div className="space-y-4 bg-teal-50 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-teal-900">Lifestyle Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="caffeine-intake" className="text-sm font-semibold text-teal-800 uppercase tracking-wide">
                          Daily Caffeine Intake
                        </Label>
                        <Select value={caffeineIntake} onValueChange={setCaffeineIntake}>
                          <SelectTrigger className="mt-1 h-12 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 focus:ring-teal-500">
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
                      <div>
                        <Label htmlFor="coping-mechanisms" className="text-sm font-semibold text-teal-800 uppercase tracking-wide">
                          Coping Mechanisms
                        </Label>
                        <Select value={copingMechanisms} onValueChange={setCopingMechanisms}>
                          <SelectTrigger className="mt-1 h-12 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 focus:ring-teal-500">
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
                      <div>
                        <Label htmlFor="age" className="text-sm font-semibold text-teal-800 uppercase tracking-wide">
                          Age
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="Enter your age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          min="13"
                          max="120"
                          className="mt-1 h-12 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-6 sm:pt-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Assessment Options</h3>
                    
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between text-sm sm:text-base py-3 sm:py-4 h-auto"
                        >
                          <span className="flex items-center">
                            Advanced Assessment Information
                          </span>
                          <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 sm:space-y-6 mt-4">
                        <Separator />
                        
                        <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Assessment Features</h4>
                          <div className="space-y-3 text-sm text-gray-600">
                            <div>• Comprehensive multi-factor stress level analysis</div>
                            <div>• Personalized recommendations based on your specific stress factors</div>
                            <div>• Work-life balance assessment and optimization suggestions</div>
                            <div>• Sleep quality impact evaluation and improvement tips</div>
                            <div>• Social support system analysis and enhancement strategies</div>
                            <div>• Physical health and exercise impact on stress levels</div>
                          </div>
                        </div>
                        
                        <Separator />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button
                      onClick={calculateStressLevel}
                      disabled={!isFormValid()}
                      className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg transition-colors duration-200"
                    >
                      Calculate Stress Level
                    </Button>
                    <Button
                      onClick={handleSampleData}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                    >
                      Sample
                    </Button>
                    <Button
                      onClick={resetTool}
                      variant="outline"
                      className="h-12 sm:h-14 px-6 sm:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-base sm:text-lg rounded-xl"
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Results Section */}
                {result && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-t">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Stress Assessment Results</h2>

                    <div className="space-y-6 sm:space-y-8">
                      {/* Main Result */}
                      <div className={`rounded-xl p-4 sm:p-6 border-2 ${getStressBgColor(result.category)} text-center`}>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {result.level}
                        </h3>
                        <div className="text-4xl font-bold mb-4">
                          <span className={getStressColor(result.category)}>
                            {result.overallScore}/100
                          </span>
                        </div>
                        <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full border">
                          <span className="text-sm font-bold">
                            {result.category} Stress Level
                          </span>
                        </div>
                        
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

                      {/* Factor Breakdown */}
                      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Stress Factors Breakdown</h3>
                        <div className="space-y-4">
                          {Object.entries(result.factors).map(([factor, score]) => (
                            <div key={factor} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="capitalize font-medium">
                                  {factor === 'physical' ? 'Physical Health' : factor}
                                </span>
                                <span className={`font-bold ${
                                  score > 70 ? 'text-red-600' : 
                                  score > 50 ? 'text-orange-600' : 
                                  score > 30 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {Math.round(score)}/100
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full ${
                                    score > 70 ? 'bg-red-500' : 
                                    score > 50 ? 'bg-orange-500' : 
                                    score > 30 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{width: `${score}%`}}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          onClick={() => {
                            const resultText = `Stress Assessment: ${result.level} (${result.overallScore}/100)`;
                            handleCopyToClipboard(resultText);
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 rounded-lg"
                        >
                          Copy Results
                        </Button>
                      </div>

                      {/* Risk Factors */}
                      {result.riskFactors.length > 0 && (
                        <div className="bg-orange-50 rounded-xl p-4 sm:p-6 shadow-sm border border-orange-200">
                          <h3 className="text-lg font-bold text-orange-800 mb-4">Risk Factors Identified</h3>
                          <ul className="space-y-2">
                            {result.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-center gap-2 text-orange-700">
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="bg-green-50 rounded-xl p-4 sm:p-6 shadow-sm border border-green-200">
                        <h3 className="text-lg font-bold text-green-800 mb-4">Personalized Recommendations</h3>
                        <ul className="space-y-3">
                          {result.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start gap-2 text-green-700">
                              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-16 space-y-8">
            {/* What is a Stress Level Calculator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Stress Level Calculator?</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A <strong>stress level calculator</strong> is a comprehensive mental health assessment tool designed to evaluate psychological stress across multiple life domains and provide personalized stress management recommendations. This advanced calculator analyzes various stress factors including work pressure, sleep quality, social relationships, physical health, and lifestyle habits to generate a holistic stress profile and actionable wellness guidance.
                  </p>
                  <p>
                    Our professional stress assessment tool employs evidence-based psychological evaluation methods to measure stress intensity, identify primary stressors, and calculate overall stress burden using scientifically validated scoring algorithms. The calculator evaluates sleep patterns, work-life balance, social support systems, exercise habits, coping mechanisms, and lifestyle factors to provide accurate stress level determinations and targeted intervention strategies.
                  </p>
                  <p>
                    Whether you're experiencing workplace burnout, relationship challenges, financial stress, health concerns, or general life pressures, this calculator provides structured assessment methodology to quantify stress levels and generate personalized recommendations for stress reduction, mental health improvement, and overall wellbeing enhancement through evidence-based stress management techniques.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How Stress Assessment Works */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Comprehensive Stress Assessment Works</h2>
                <p className="text-gray-600 mb-8">Understanding the methodology behind stress level calculation helps individuals recognize stress patterns, identify contributing factors, and implement targeted stress management strategies for improved mental health and quality of life.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">Multi-Factor Analysis Process</h3>
                      <p className="text-purple-800 text-sm mb-4">
                        The calculator employs a weighted scoring system that evaluates five primary stress domains: sleep quality (25%), work stress (25%), social relationships (20%), physical health (15%), and lifestyle factors (15%). Each domain contributes proportionally to the overall stress score based on psychological research and clinical assessment standards.
                      </p>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Assessment Categories:</h4>
                        <div className="text-xs text-purple-800">
                          <div>• Sleep patterns and quality evaluation</div>
                          <div>• Work stress and professional pressure analysis</div>
                          <div>• Social support and relationship assessment</div>
                          <div>• Physical health and exercise impact</div>
                          <div>• Lifestyle habits and coping mechanisms</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Scoring Methodology</h3>
                      <p className="text-blue-800 text-sm mb-4">
                        Individual stress factors are evaluated using evidence-based criteria and converted to numerical scores. Sleep deprivation, excessive work hours, poor social support, sedentary lifestyle, and unhealthy coping mechanisms contribute higher stress scores, while positive factors reduce overall stress burden.
                      </p>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Score Interpretation:</h4>
                        <div className="text-xs text-blue-800">
                          <div>• 0-39: Low stress with healthy management</div>
                          <div>• 40-59: Moderate stress requiring attention</div>
                          <div>• 60-79: High stress needing intervention</div>
                          <div>• 80-100: Very high stress requiring professional help</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Personalized Recommendations</h3>
                      <p className="text-green-800 text-sm mb-4">
                        Based on individual stress profiles and factor analysis, the calculator generates targeted recommendations addressing specific stressors. Recommendations include sleep hygiene improvement, work-life balance strategies, social connection building, physical activity enhancement, and healthy coping skill development.
                      </p>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Intervention Strategies:</h4>
                        <div className="text-xs text-green-800">
                          <div>• Sleep optimization and bedtime routine improvement</div>
                          <div>• Workplace stress management and boundary setting</div>
                          <div>• Social support network strengthening techniques</div>
                          <div>• Exercise and physical wellness recommendations</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-3">Risk Factor Identification</h3>
                      <p className="text-orange-800 text-sm mb-4">
                        The assessment identifies critical risk factors that significantly contribute to stress burden, including chronic sleep deprivation, work burnout potential, social isolation, sedentary lifestyle, and maladaptive coping patterns. Early identification enables proactive stress management intervention.
                      </p>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Warning Indicators:</h4>
                        <div className="text-xs text-orange-800">
                          <div>• Chronic insomnia or sleep disturbances</div>
                          <div>• Excessive work hours and poor boundaries</div>
                          <div>• Limited social connections and support</div>
                          <div>• Physical health deterioration signs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Applications and Benefits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Who Benefits from Stress Assessment Tools?</h2>
                  <p className="text-gray-600 mb-6">Stress level calculators serve diverse populations across personal, professional, and healthcare contexts, providing essential mental health evaluation capabilities for stress management, wellness planning, and psychological wellbeing improvement.</p>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 mb-2">Individuals & Families</h3>
                      <p className="text-purple-800 text-sm">Personal stress evaluation for work-life balance improvement, relationship management, health optimization, and overall quality of life enhancement through targeted stress reduction strategies and wellness planning.</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Mental Health Professionals</h3>
                      <p className="text-blue-800 text-sm">Clinical assessment tool for therapists, counselors, and psychologists to evaluate client stress levels, track treatment progress, identify intervention priorities, and develop comprehensive stress management treatment plans.</p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">Workplace Wellness Programs</h3>
                      <p className="text-green-800 text-sm">Employee wellness assessment for human resources, occupational health, and corporate wellness initiatives to identify workplace stressors, improve job satisfaction, and enhance organizational productivity.</p>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 mb-2">Healthcare Providers</h3>
                      <p className="text-orange-800 text-sm">Primary care physicians, nurses, and health coaches use stress assessment for patient evaluation, preventive healthcare planning, chronic disease management, and holistic health improvement strategies.</p>
                    </div>

                    <div className="bg-teal-50 rounded-lg p-4">
                      <h3 className="font-semibold text-teal-900 mb-2">Students & Educators</h3>
                      <p className="text-teal-800 text-sm">Academic stress evaluation for students, teachers, and educational counselors to address performance anxiety, study-related stress, social pressures, and career development challenges in educational environments.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features & Assessment Capabilities</h2>
                  <p className="text-gray-600 mb-6">Our comprehensive stress level calculator offers advanced assessment features designed for accuracy, reliability, and actionable insight generation for effective stress management and mental health improvement.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Comprehensive Multi-Domain Analysis</h4>
                        <p className="text-gray-600 text-sm">Evaluates sleep quality, work stress, social relationships, physical health, and lifestyle factors using evidence-based assessment criteria for holistic stress evaluation and targeted intervention planning.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Personalized Recommendation System</h4>
                        <p className="text-gray-600 text-sm">Generates customized stress management recommendations based on individual stress profiles, addressing specific stressors with actionable strategies for sleep improvement, work-life balance, and wellness enhancement.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Risk Factor Identification</h4>
                        <p className="text-gray-600 text-sm">Identifies critical stress risk factors including chronic sleep deprivation, work burnout potential, social isolation, and unhealthy coping patterns for proactive mental health management and intervention planning.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Evidence-Based Scoring System</h4>
                        <p className="text-gray-600 text-sm">Utilizes scientifically validated stress assessment methodology with weighted scoring across multiple domains, providing accurate stress level determination and reliable mental health evaluation results.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Interactive Assessment Interface</h4>
                        <p className="text-gray-600 text-sm">User-friendly assessment experience with guided questionnaires, sliding scales, and dropdown selections for comprehensive stress evaluation with immediate results and detailed factor breakdown analysis.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stress Management Strategies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Evidence-Based Stress Management Strategies & Implementation Guidelines</h2>
                <p className="text-gray-600 mb-8">Implementing effective stress management techniques requires understanding various approaches, their mechanisms of action, and appropriate application contexts. These evidence-based strategies address different aspects of stress response and promote long-term mental health improvement.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Sleep & Recovery Optimization</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">Sleep Hygiene Protocol</h4>
                        <p className="text-blue-800 text-xs mt-1">Establish consistent sleep schedules, optimize bedroom environment temperature and lighting, limit screen exposure before bedtime, and develop relaxing pre-sleep routines for improved sleep quality and stress recovery.</p>
                      </div>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-indigo-900 text-sm">Stress Recovery Techniques</h4>
                        <p className="text-indigo-800 text-xs mt-1">Implement progressive muscle relaxation, guided imagery, and meditation practices to activate the parasympathetic nervous system, reduce cortisol levels, and enhance natural stress recovery processes.</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-purple-900 text-sm">Circadian Rhythm Regulation</h4>
                        <p className="text-purple-800 text-xs mt-1">Maintain regular sleep-wake cycles, utilize natural light exposure for circadian alignment, and avoid stimulants late in the day to support healthy melatonin production and stress hormone regulation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Cognitive & Emotional Regulation</h3>
                    <div className="space-y-3">
                      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-green-900 text-sm">Cognitive Restructuring</h4>
                        <p className="text-green-800 text-xs mt-1">Identify and challenge negative thought patterns, practice positive self-talk, and develop realistic perspective-taking skills to reduce cognitive stress contributors and improve emotional resilience.</p>
                      </div>
                      <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-teal-900 text-sm">Mindfulness Practices</h4>
                        <p className="text-teal-800 text-xs mt-1">Engage in mindfulness meditation, present-moment awareness exercises, and non-judgmental observation techniques to reduce stress reactivity and enhance emotional regulation capabilities.</p>
                      </div>
                      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-cyan-900 text-sm">Emotional Processing</h4>
                        <p className="text-cyan-800 text-xs mt-1">Develop healthy emotional expression outlets, practice journaling for stress processing, and utilize creative activities to process difficult emotions and reduce psychological stress accumulation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lifestyle & Social Support</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-orange-900 text-sm">Physical Activity Integration</h4>
                        <p className="text-orange-800 text-xs mt-1">Incorporate regular aerobic exercise, strength training, and flexibility work to reduce stress hormones, increase endorphin production, and improve overall stress resilience and physical wellbeing.</p>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-red-900 text-sm">Social Connection Building</h4>
                        <p className="text-red-800 text-xs mt-1">Cultivate supportive relationships, practice effective communication skills, and engage in community activities to build social support networks that buffer against stress and promote emotional wellbeing.</p>
                      </div>
                      <div className="bg-pink-50 border-l-4 border-pink-400 p-3 rounded-r-lg">
                        <h4 className="font-semibold text-pink-900 text-sm">Nutrition & Lifestyle</h4>
                        <p className="text-pink-800 text-xs mt-1">Maintain balanced nutrition with stress-reducing nutrients, limit caffeine and alcohol consumption, and establish healthy routines that support stable energy levels and stress management capacity.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Stress Management Implementation Framework</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Assessment & Planning Phase</h4>
                      <p className="text-gray-600 text-sm">Conduct comprehensive stress assessment, identify primary stressors and risk factors, establish baseline measurements, and develop personalized stress management plans with specific goals and measurable outcomes.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Implementation & Monitoring</h4>
                      <p className="text-gray-600 text-sm">Execute stress management interventions systematically, monitor progress through regular assessments, adjust strategies based on effectiveness, and maintain consistent practice for sustainable stress reduction and wellness improvement.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Professional Support Integration</h4>
                      <p className="text-gray-600 text-sm">Coordinate with mental health professionals when indicated, utilize employee assistance programs, and access community resources for comprehensive stress management support and specialized intervention when needed.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Long-term Maintenance Strategy</h4>
                      <p className="text-gray-600 text-sm">Establish sustainable stress management habits, develop relapse prevention strategies, maintain social support networks, and implement ongoing self-monitoring for continued mental health and stress management success.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Industry Applications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Industry Applications & Professional Stress Assessment Use Cases</h2>
                <p className="text-gray-600 mb-8">Stress level calculators serve specialized applications across various professional industries and organizational contexts, enabling systematic stress evaluation, workplace wellness improvement, and comprehensive mental health support program development.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Healthcare & Medical Organizations</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• Healthcare worker burnout assessment and prevention</li>
                      <li>• Patient stress evaluation in clinical settings</li>
                      <li>• Medical staff wellness program development</li>
                      <li>• Mental health screening in primary care</li>
                      <li>• Chronic disease stress impact evaluation</li>
                      <li>• Healthcare system stress management initiatives</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Corporate & Business Environment</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Employee wellness and engagement assessment</li>
                      <li>• Workplace stress reduction program planning</li>
                      <li>• Leadership stress management training</li>
                      <li>• Organizational culture and stress evaluation</li>
                      <li>• Remote work stress assessment and support</li>
                      <li>• Performance optimization through stress management</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-purple-900 mb-4">Educational Institutions & Academic Settings</h3>
                    <ul className="text-purple-800 text-sm space-y-2">
                      <li>• Student stress assessment and counseling support</li>
                      <li>• Faculty and staff wellness evaluation</li>
                      <li>• Academic performance and stress correlation analysis</li>
                      <li>• Campus mental health program development</li>
                      <li>• Examination stress management initiatives</li>
                      <li>• Educational environment stress optimization</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-4">Mental Health & Counseling Services</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Clinical stress assessment and treatment planning</li>
                      <li>• Therapy progress monitoring and evaluation</li>
                      <li>• Group therapy stress level comparison</li>
                      <li>• Mental health program effectiveness measurement</li>
                      <li>• Community mental health screening initiatives</li>
                      <li>• Preventive mental health intervention planning</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-900 mb-4">Human Resources & Organizational Development</h3>
                    <ul className="text-teal-800 text-sm space-y-2">
                      <li>• Employee assistance program assessment</li>
                      <li>• Workplace wellness initiative planning</li>
                      <li>• Stress-related absenteeism reduction strategies</li>
                      <li>• Team dynamics and stress evaluation</li>
                      <li>• Organizational change stress management</li>
                      <li>• Leadership development stress assessment</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h3 className="font-semibold text-red-900 mb-4">Public Health & Community Services</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Population stress level monitoring and analysis</li>
                      <li>• Community mental health program evaluation</li>
                      <li>• Public health stress intervention planning</li>
                      <li>• Emergency response team stress assessment</li>
                      <li>• Social services stress impact evaluation</li>
                      <li>• Community resilience building initiatives</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Professional Implementation Strategies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Organizational Integration Approach</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Systematic stress assessment integration into existing wellness programs</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Staff training for stress assessment interpretation and intervention</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Data collection protocols for organizational stress monitoring</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Policy development for stress management support systems</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Quality Assurance & Outcome Measurement</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Regular assessment tool validation and accuracy verification</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Longitudinal stress level tracking and trend analysis</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Intervention effectiveness measurement and program optimization</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">Return on investment analysis for stress management programs</span>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How accurate is the stress level assessment?</h3>
                      <p className="text-gray-600 text-sm">
                        Our stress calculator uses evidence-based assessment methodology validated through psychological research. While highly accurate for screening and self-awareness, it's designed for informational purposes and should complement, not replace, professional mental health evaluation when clinical assessment is needed.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">What factors contribute most to overall stress levels?</h3>
                      <p className="text-gray-600 text-sm">
                        Sleep quality and work stress typically contribute most significantly (25% each), followed by social relationships (20%), physical health (15%), and lifestyle factors (15%). However, individual stress patterns vary, and any single factor can be the primary contributor depending on personal circumstances.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How often should I assess my stress levels?</h3>
                      <p className="text-gray-600 text-sm">
                        For general wellness monitoring, monthly assessments provide good insight into stress trends. During high-stress periods, major life changes, or when implementing stress management strategies, weekly assessments can help track progress and adjust interventions as needed.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">When should I seek professional help for stress?</h3>
                      <p className="text-gray-600 text-sm">
                        Seek professional help if stress scores consistently remain high (70+), if stress significantly impacts daily functioning, relationships, or work performance, or if you experience persistent physical symptoms, sleep disturbances, or thoughts of self-harm. Mental health professionals can provide comprehensive evaluation and treatment.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can stress assessment help prevent burnout?</h3>
                      <p className="text-gray-600 text-sm">
                        Regular stress assessment can identify burnout risk factors early, including work overload, poor work-life balance, and inadequate recovery time. Early identification enables proactive intervention through workload management, boundary setting, and stress reduction strategies before burnout develops.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">How do lifestyle factors affect stress levels?</h3>
                      <p className="text-gray-600 text-sm">
                        Lifestyle factors including sleep patterns, exercise habits, caffeine consumption, and coping mechanisms significantly impact stress resilience. Poor sleep and sedentary lifestyle increase stress vulnerability, while regular exercise, healthy nutrition, and effective coping strategies enhance stress management capacity.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Are the recommendations personalized for individual needs?</h3>
                      <p className="text-gray-600 text-sm">
                        Yes, recommendations are generated based on your specific stress profile and factor scores. High sleep-related stress generates sleep improvement suggestions, while work stress triggers workplace management recommendations. The system provides targeted advice addressing your primary stress contributors.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Can this tool be used for workplace wellness programs?</h3>
                      <p className="text-gray-600 text-sm">
                        Absolutely. The assessment tool is excellent for organizational wellness initiatives, employee stress monitoring, and workplace mental health program development. It provides aggregate insights while maintaining individual privacy, helping organizations address systemic stressors and improve workplace wellbeing.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications & Assessment Methodology</h2>
                <p className="text-gray-600 mb-8">Our stress level calculator employs scientifically validated assessment methodology with modern web technologies to ensure accurate calculations, reliable performance, and seamless user experience across all devices and platforms.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment Algorithm Specifications</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Multi-Domain Scoring System</h4>
                        <ul className="text-blue-800 text-sm space-y-1">
                          <li>• Weighted assessment across five primary stress domains</li>
                          <li>• Evidence-based scoring criteria for each stress factor</li>
                          <li>• Normalization algorithms for consistent score interpretation</li>
                          <li>• Risk stratification based on psychological research</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Recommendation Engine</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Personalized intervention matching algorithms</li>
                          <li>• Priority-based recommendation ranking system</li>
                          <li>• Evidence-based stress management strategy database</li>
                          <li>• Adaptive recommendation refinement based on user profiles</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Validation & Quality Assurance</h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Cross-validation with established stress assessment tools</li>
                          <li>• Continuous algorithm refinement based on user feedback</li>
                          <li>• Statistical analysis for score reliability and validity</li>
                          <li>• Regular updates incorporating latest psychological research</li>
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
                          <li>• Firefox 88+ (full compatibility and functionality)</li>
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

export default StressLevelCalculator;
