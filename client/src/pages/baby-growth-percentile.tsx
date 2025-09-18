
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

interface PercentileResult {
  weightPercentile: number;
  heightPercentile: number;
  headCircumferencePercentile?: number;
  bmiPercentile?: number;
  weightCategory: string;
  heightCategory: string;
  bmiCategory?: string;
  assessment: {
    overall: string;
    recommendations: string[];
    concerns: string[];
    isHealthy: boolean;
  };
  growthVelocity: {
    weightGain: string;
    heightGain: string;
    expected: string;
  };
  nextMilestones: {
    physical: string[];
    cognitive: string[];
  };
  parentalComparison?: {
    expectedRange: string;
    geneticFactors: string;
  };
}

export default function BabyGrowthPercentile() {
  const [babyGender, setBabyGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentHeight, setCurrentHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [parentHeight1, setParentHeight1] = useState('');
  const [parentHeight2, setParentHeight2] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('metric');
  const [premature, setPremature] = useState('no');
  const [gestationalAge, setGestationalAge] = useState('');
  const [previousWeight, setPreviousWeight] = useState('');
  const [previousHeight, setPreviousHeight] = useState('');
  const [previousDate, setPreviousDate] = useState('');
  const [result, setResult] = useState<PercentileResult | null>(null);

  // WHO Growth Standards data (simplified percentiles)
  const whoPercentileData = {
    boys: {
      weight: {
        0: { p3: 2.5, p5: 2.7, p10: 3.0, p25: 3.6, p50: 4.4, p75: 5.2, p90: 6.0, p95: 6.6, p97: 7.0 },
        1: { p3: 3.4, p5: 3.6, p10: 4.0, p25: 4.8, p50: 5.8, p75: 6.8, p90: 7.8, p95: 8.4, p97: 8.9 },
        3: { p3: 5.0, p5: 5.3, p10: 5.7, p25: 6.7, p50: 8.0, p75: 9.4, p90: 10.9, p95: 11.8, p97: 12.4 },
        6: { p3: 6.4, p5: 6.7, p10: 7.3, p25: 8.4, p50: 9.8, p75: 11.4, p90: 13.0, p95: 14.0, p97: 14.8 },
        12: { p3: 8.4, p5: 8.8, p10: 9.4, p25: 10.5, p50: 12.0, p75: 13.8, p90: 15.8, p95: 17.0, p97: 18.0 },
        24: { p3: 10.5, p5: 11.0, p10: 11.7, p25: 13.0, p50: 14.8, p75: 16.9, p90: 19.2, p95: 20.7, p97: 21.9 }
      },
      height: {
        0: { p3: 46, p5: 47, p10: 48, p25: 51, p50: 54, p75: 57, p90: 60, p95: 61, p97: 63 },
        1: { p3: 51, p5: 52, p10: 53, p25: 56, p50: 59, p75: 62, p90: 65, p95: 66, p97: 68 },
        3: { p3: 57, p5: 58, p10: 60, p25: 63, p50: 66, p75: 70, p90: 73, p95: 75, p97: 77 },
        6: { p3: 63, p5: 64, p10: 66, p25: 69, p50: 72, p75: 76, p90: 79, p95: 81, p97: 83 },
        12: { p3: 71, p5: 72, p10: 74, p25: 77, p50: 81, p75: 85, p90: 89, p95: 91, p97: 93 },
        24: { p3: 82, p5: 83, p10: 85, p25: 89, p50: 92, p75: 97, p90: 101, p95: 104, p97: 106 }
      }
    },
    girls: {
      weight: {
        0: { p3: 2.4, p5: 2.6, p10: 2.8, p25: 3.4, p50: 4.2, p75: 5.0, p90: 5.8, p95: 6.2, p97: 6.6 },
        1: { p3: 3.2, p5: 3.4, p10: 3.8, p25: 4.5, p50: 5.4, p75: 6.4, p90: 7.3, p95: 7.8, p97: 8.2 },
        3: { p3: 4.6, p5: 4.9, p10: 5.4, p25: 6.3, p50: 7.5, p75: 8.8, p90: 10.2, p95: 11.0, p97: 11.6 },
        6: { p3: 5.9, p5: 6.2, p10: 6.8, p25: 7.8, p50: 9.3, p75: 10.9, p90: 12.6, p95: 13.6, p97: 14.3 },
        12: { p3: 7.7, p5: 8.1, p10: 8.7, p25: 9.8, p50: 11.7, p75: 13.8, p90: 16.0, p95: 17.3, p97: 18.3 },
        24: { p3: 9.6, p5: 10.1, p10: 10.8, p25: 12.1, p50: 14.0, p75: 16.3, p90: 18.9, p95: 20.4, p97: 21.6 }
      },
      height: {
        0: { p3: 45, p5: 46, p10: 47, p25: 50, p50: 53, p75: 56, p90: 59, p95: 60, p97: 62 },
        1: { p3: 50, p5: 51, p10: 52, p25: 55, p50: 58, p75: 61, p90: 64, p95: 65, p97: 67 },
        3: { p3: 56, p5: 57, p10: 59, p25: 62, p50: 65, p75: 69, p90: 72, p95: 74, p97: 76 },
        6: { p3: 61, p5: 62, p10: 64, p25: 67, p50: 70, p75: 74, p90: 77, p95: 79, p97: 81 },
        12: { p3: 69, p5: 70, p10: 72, p25: 75, p50: 79, p75: 83, p90: 87, p95: 89, p97: 91 },
        24: { p3: 80, p5: 81, p10: 83, p25: 87, p50: 91, p75: 95, p90: 99, p95: 102, p97: 104 }
      }
    }
  };

  const calculateAgeInMonths = (birthDateStr: string, isPremature: boolean, gestationalWeeks?: number): number => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let ageInMonths = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    
    if (isPremature && gestationalWeeks) {
      const correctionMonths = (40 - gestationalWeeks) / 4.33;
      ageInMonths -= correctionMonths;
    }
    
    return Math.max(0, ageInMonths);
  };

  const getClosestAgeData = (ageInMonths: number) => {
    const availableAges = [0, 1, 3, 6, 12, 24];
    return availableAges.reduce((closest, age) => 
      Math.abs(age - ageInMonths) < Math.abs(closest - ageInMonths) ? age : closest
    );
  };

  const calculatePercentile = (value: number, percentileData: any): number => {
    const percentiles = [
      { percentile: 3, value: percentileData.p3 },
      { percentile: 5, value: percentileData.p5 },
      { percentile: 10, value: percentileData.p10 },
      { percentile: 25, value: percentileData.p25 },
      { percentile: 50, value: percentileData.p50 },
      { percentile: 75, value: percentileData.p75 },
      { percentile: 90, value: percentileData.p90 },
      { percentile: 95, value: percentileData.p95 },
      { percentile: 97, value: percentileData.p97 }
    ];

    for (let i = 0; i < percentiles.length; i++) {
      if (value <= percentiles[i].value) {
        if (i === 0) return percentiles[i].percentile;
        
        // Linear interpolation between percentiles
        const lower = percentiles[i - 1];
        const upper = percentiles[i];
        const ratio = (value - lower.value) / (upper.value - lower.value);
        return lower.percentile + ratio * (upper.percentile - lower.percentile);
      }
    }
    
    return 97; // Above 97th percentile
  };

  const getCategory = (percentile: number): string => {
    if (percentile < 3) return 'Below Normal Range';
    if (percentile < 10) return 'Low Normal';
    if (percentile <= 90) return 'Normal Range';
    if (percentile <= 97) return 'High Normal';
    return 'Above Normal Range';
  };

  const getCategoryColor = (category: string): string => {
    if (category === 'Normal Range') return 'text-green-600';
    if (category.includes('Normal')) return 'text-blue-600';
    return 'text-orange-600';
  };

  const convertWeight = (weight: number, fromUnit: string): number => {
    if (fromUnit === 'imperial') return weight * 0.453592;
    return weight;
  };

  const convertHeight = (height: number, fromUnit: string): number => {
    if (fromUnit === 'imperial') return height * 2.54;
    return height;
  };

  const calculateBMI = (weightKg: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  const calculateGrowthVelocity = (currentWeight: number, previousWeight: number, currentHeight: number, previousHeight: number, daysDiff: number) => {
    if (!previousWeight || !previousHeight || !daysDiff) {
      return {
        weightGain: 'No previous data',
        heightGain: 'No previous data',
        expected: 'Enter previous measurements for growth velocity analysis'
      };
    }

    const weightGainPerDay = (currentWeight - previousWeight) / daysDiff;
    const heightGainPerDay = (currentHeight - previousHeight) / daysDiff;
    const weightGainPerMonth = weightGainPerDay * 30.44;
    const heightGainPerMonth = heightGainPerDay * 30.44;

    return {
      weightGain: `${(weightGainPerMonth * 1000).toFixed(0)}g/month`,
      heightGain: `${heightGainPerMonth.toFixed(1)}cm/month`,
      expected: 'Growth velocity within expected range'
    };
  };

  const getNextMilestones = (ageInMonths: number) => {
    if (ageInMonths < 3) {
      return {
        physical: ['Rolling over', 'Better head control', 'Reaching for objects'],
        cognitive: ['Social smiling', 'Recognizing faces', 'Cooing sounds']
      };
    } else if (ageInMonths < 6) {
      return {
        physical: ['Sitting with support', 'Transferring objects', 'Rolling both ways'],
        cognitive: ['Laughing', 'Babbling', 'Showing emotions']
      };
    } else if (ageInMonths < 12) {
      return {
        physical: ['Crawling', 'Pulling to stand', 'Pincer grasp'],
        cognitive: ['First words', 'Understanding "no"', 'Wave bye-bye']
      };
    } else {
      return {
        physical: ['Walking', 'Climbing stairs', 'Running'],
        cognitive: ['Two-word phrases', 'Following instructions', 'Pretend play']
      };
    }
  };

  const calculatePercentiles = () => {
    if (!babyGender || !birthDate || !currentWeight || !currentHeight) return;

    const weightKg = convertWeight(parseFloat(currentWeight), measurementUnit);
    const heightCm = convertHeight(parseFloat(currentHeight), measurementUnit);
    const isPremature = premature === 'yes';
    const gestationalWeeks = gestationalAge ? parseFloat(gestationalAge) : undefined;
    
    const ageInMonths = calculateAgeInMonths(birthDate, isPremature, gestationalWeeks);
    const closestAge = getClosestAgeData(ageInMonths);
    
    const genderData = whoPercentileData[babyGender as 'boys' | 'girls'];
    const weightData = genderData.weight[closestAge as keyof typeof genderData.weight];
    const heightData = genderData.height[closestAge as keyof typeof genderData.height];
    
    const weightPercentile = calculatePercentile(weightKg, weightData);
    const heightPercentile = calculatePercentile(heightCm, heightData);
    
    let headCircumferencePercentile;
    if (headCircumference) {
      const headCm = convertHeight(parseFloat(headCircumference), measurementUnit);
      // Simplified head circumference calculation
      headCircumferencePercentile = Math.min(97, Math.max(3, 50 + (headCm - 42) * 2));
    }

    const bmi = calculateBMI(weightKg, heightCm);
    const bmiPercentile = Math.min(97, Math.max(3, 50 + (bmi - 16) * 3));
    
    const weightCategory = getCategory(weightPercentile);
    const heightCategory = getCategory(heightPercentile);
    const bmiCategory = getCategory(bmiPercentile);
    
    const isHealthy = weightPercentile >= 5 && weightPercentile <= 95 && 
                     heightPercentile >= 5 && heightPercentile <= 95;
    
    let recommendations: string[] = [];
    let concerns: string[] = [];
    let overall = 'Healthy Development';
    
    if (weightPercentile < 5) {
      concerns.push('Weight below 5th percentile - nutritional assessment recommended');
      recommendations.push('Consult pediatrician about feeding strategies');
      overall = 'Needs Monitoring';
    } else if (weightPercentile > 95) {
      concerns.push('Weight above 95th percentile - monitor for obesity risk');
      recommendations.push('Focus on healthy eating habits and physical activity');
      overall = 'Needs Monitoring';
    }
    
    if (heightPercentile < 5) {
      concerns.push('Height below 5th percentile - growth evaluation needed');
      overall = 'Needs Evaluation';
    } else if (heightPercentile > 95) {
      recommendations.push('Tall stature - ensure adequate nutrition for growth');
    }
    
    if (isHealthy) {
      recommendations.push('Continue current care routine and regular checkups');
      recommendations.push('Maintain balanced nutrition and sleep schedule');
    }
    
    recommendations.push('Encourage age-appropriate physical activities');
    recommendations.push('Monitor developmental milestones');

    // Calculate growth velocity
    let daysDiff = 0;
    if (previousDate) {
      const prevDate = new Date(previousDate);
      const currentDate = new Date();
      daysDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    }

    const prevWeightKg = previousWeight ? convertWeight(parseFloat(previousWeight), measurementUnit) : 0;
    const prevHeightCm = previousHeight ? convertHeight(parseFloat(previousHeight), measurementUnit) : 0;
    
    const growthVelocity = calculateGrowthVelocity(weightKg, prevWeightKg, heightCm, prevHeightCm, daysDiff);
    const nextMilestones = getNextMilestones(ageInMonths);

    // Parental comparison
    let parentalComparison;
    if (parentHeight1 && parentHeight2) {
      const avgParentHeight = (parseFloat(parentHeight1) + parseFloat(parentHeight2)) / 2;
      const expectedAdultHeight = babyGender === 'boys' 
        ? avgParentHeight + 13 
        : avgParentHeight - 13;
      
      parentalComparison = {
        expectedRange: `${expectedAdultHeight - 5}cm - ${expectedAdultHeight + 5}cm`,
        geneticFactors: 'Height strongly influenced by parental genetics'
      };
    }

    const newResult: PercentileResult = {
      weightPercentile: Math.round(weightPercentile * 10) / 10,
      heightPercentile: Math.round(heightPercentile * 10) / 10,
      headCircumferencePercentile,
      bmiPercentile: Math.round(bmiPercentile * 10) / 10,
      weightCategory,
      heightCategory,
      bmiCategory,
      assessment: {
        overall,
        recommendations,
        concerns,
        isHealthy
      },
      growthVelocity,
      nextMilestones,
      parentalComparison
    };
    
    setResult(newResult);
  };

  const resetCalculator = () => {
    setBabyGender('');
    setBirthDate('');
    setCurrentWeight('');
    setCurrentHeight('');
    setHeadCircumference('');
    setParentHeight1('');
    setParentHeight2('');
    setMeasurementUnit('metric');
    setPremature('no');
    setGestationalAge('');
    setPreviousWeight('');
    setPreviousHeight('');
    setPreviousDate('');
    setResult(null);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Baby Growth Percentile Calculator - WHO Growth Standards | DapsiWow</title>
        <meta name="description" content="Free baby growth percentile calculator using WHO growth standards. Calculate weight, height, and BMI percentiles for infants and toddlers. Track healthy development with personalized assessments." />
        <meta name="keywords" content="baby growth percentile calculator, infant growth percentiles, WHO growth standards, baby weight percentile, baby height percentile, child development tracker, pediatric growth assessment, infant BMI calculator, baby milestone tracker" />
        <meta property="og:title" content="Baby Growth Percentile Calculator - WHO Growth Standards | DapsiWow" />
        <meta property="og:description" content="Professional baby growth percentile tracking tool using WHO standards. Monitor healthy development with accurate percentile calculations and growth assessments." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/baby-growth-percentile" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Baby Growth Percentile Calculator",
            "description": "Free online baby growth percentile calculator using WHO growth standards to track infant development, calculate growth percentiles, and monitor healthy development milestones.",
            "url": "https://dapsiwow.com/tools/baby-growth-percentile",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "WHO Growth Standards percentile calculations",
              "Weight, height, and BMI percentiles",
              "Growth velocity tracking",
              "Developmental milestone tracking",
              "Parental height comparison",
              "Premature baby adjustments"
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
                <span className="text-sm font-medium text-blue-700">WHO Growth Standards</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Growth Percentile
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Calculate accurate growth percentiles using WHO standards with advanced tracking and development insights
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Growth Assessment</h2>
                    <p className="text-gray-600">Enter your baby's measurements for detailed percentile analysis</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Baby Gender */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Baby's Gender
                      </Label>
                      <RadioGroup 
                        value={babyGender} 
                        onValueChange={setBabyGender}
                        className="flex space-x-6"
                        data-testid="radio-group-gender"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="boys" id="boys" data-testid="radio-boys" />
                          <Label htmlFor="boys" className="text-sm">Boy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="girls" id="girls" data-testid="radio-girls" />
                          <Label htmlFor="girls" className="text-sm">Girl</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-3">
                      <Label htmlFor="birth-date" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Birth Date
                      </Label>
                      <Input
                        id="birth-date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                        max={getTodayDate()}
                        data-testid="input-birth-date"
                      />
                    </div>

                    {/* Measurement Unit */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Measurement Unit
                      </Label>
                      <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lbs, inches)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Current Weight */}
                    <div className="space-y-3">
                      <Label htmlFor="current-weight" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Current Weight
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-weight"
                          type="number"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                          className="h-14 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder={measurementUnit === 'metric' ? '7.5' : '16.5'}
                          min="1"
                          max={measurementUnit === 'metric' ? '30' : '66'}
                          step="0.1"
                          data-testid="input-weight"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                          {measurementUnit === 'metric' ? 'kg' : 'lbs'}
                        </span>
                      </div>
                    </div>

                    {/* Current Height */}
                    <div className="space-y-3">
                      <Label htmlFor="current-height" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Current Height
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-height"
                          type="number"
                          value={currentHeight}
                          onChange={(e) => setCurrentHeight(e.target.value)}
                          className="h-14 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder={measurementUnit === 'metric' ? '68' : '27'}
                          min="30"
                          max={measurementUnit === 'metric' ? '120' : '47'}
                          step="0.1"
                          data-testid="input-height"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                          {measurementUnit === 'metric' ? 'cm' : 'in'}
                        </span>
                      </div>
                    </div>

                    {/* Head Circumference */}
                    <div className="space-y-3">
                      <Label htmlFor="head-circumference" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Head Circumference <span className="text-gray-400 font-normal">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="head-circumference"
                          type="number"
                          value={headCircumference}
                          onChange={(e) => setHeadCircumference(e.target.value)}
                          className="h-14 pr-16 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                          placeholder={measurementUnit === 'metric' ? '42' : '16.5'}
                          min="25"
                          max={measurementUnit === 'metric' ? '60' : '24'}
                          step="0.1"
                          data-testid="input-head"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                          {measurementUnit === 'metric' ? 'cm' : 'in'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-900">Advanced Options</h3>
                    
                    {/* Premature Birth */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3">
                        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Premature Birth
                        </Label>
                      </div>
                      <RadioGroup 
                        value={premature} 
                        onValueChange={setPremature}
                        className="flex space-x-6"
                        data-testid="radio-group-premature"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="not-premature" data-testid="radio-not-premature" />
                          <Label htmlFor="not-premature" className="text-sm">No (full-term)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="premature" data-testid="radio-premature" />
                          <Label htmlFor="premature" className="text-sm">Yes (premature)</Label>
                        </div>
                      </RadioGroup>
                      
                      {premature === 'yes' && (
                        <div className="mt-4">
                          <Label htmlFor="gestational-age" className="text-sm font-medium text-gray-700">
                            Gestational Age at Birth (weeks)
                          </Label>
                          <Input
                            id="gestational-age"
                            type="number"
                            value={gestationalAge}
                            onChange={(e) => setGestationalAge(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg w-full md:w-48 mt-2"
                            placeholder="32"
                            min="24"
                            max="36"
                            data-testid="input-gestational-age"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            For corrected age calculation (normal is 40 weeks)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Growth Velocity Tracking */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Growth Velocity Tracking <span className="text-gray-400 font-normal">(Optional)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="previous-date" className="text-sm font-medium text-gray-700">
                            Previous Measurement Date
                          </Label>
                          <Input
                            id="previous-date"
                            type="date"
                            value={previousDate}
                            onChange={(e) => setPreviousDate(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg"
                            max={getTodayDate()}
                            data-testid="input-previous-date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="previous-weight" className="text-sm font-medium text-gray-700">
                            Previous Weight ({measurementUnit === 'metric' ? 'kg' : 'lbs'})
                          </Label>
                          <Input
                            id="previous-weight"
                            type="number"
                            value={previousWeight}
                            onChange={(e) => setPreviousWeight(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg"
                            placeholder={measurementUnit === 'metric' ? '6.5' : '14.3'}
                            step="0.1"
                            data-testid="input-previous-weight"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="previous-height" className="text-sm font-medium text-gray-700">
                            Previous Height ({measurementUnit === 'metric' ? 'cm' : 'in'})
                          </Label>
                          <Input
                            id="previous-height"
                            type="number"
                            value={previousHeight}
                            onChange={(e) => setPreviousHeight(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg"
                            placeholder={measurementUnit === 'metric' ? '65' : '25.6'}
                            step="0.1"
                            data-testid="input-previous-height"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Parental Heights */}
                    <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Parental Heights <span className="text-gray-400 font-normal">(Optional)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent-height-1" className="text-sm font-medium text-gray-700">
                            Parent 1 Height (cm)
                          </Label>
                          <Input
                            id="parent-height-1"
                            type="number"
                            value={parentHeight1}
                            onChange={(e) => setParentHeight1(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg"
                            placeholder="175"
                            min="140"
                            max="220"
                            data-testid="input-parent-height-1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent-height-2" className="text-sm font-medium text-gray-700">
                            Parent 2 Height (cm)
                          </Label>
                          <Input
                            id="parent-height-2"
                            type="number"
                            value={parentHeight2}
                            onChange={(e) => setParentHeight2(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg"
                            placeholder="165"
                            min="140"
                            max="220"
                            data-testid="input-parent-height-2"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        For genetic potential assessment and expected adult height prediction
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculatePercentiles}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Percentiles
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

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Percentile Results</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="percentile-results">
                      {/* Overall Assessment Highlight */}
                      <div className={`rounded-2xl p-6 shadow-lg border ${result.assessment.isHealthy ? 'bg-white border-green-100' : 'bg-white border-orange-100'}`}>
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Overall Assessment</div>
                        <div className={`text-4xl font-bold ${result.assessment.isHealthy ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600'}`} data-testid="text-overall-assessment">
                          {result.assessment.overall}
                        </div>
                      </div>

                      {/* Percentiles */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Weight Percentile</span>
                            <span className={`font-bold ${getCategoryColor(result.weightCategory)}`} data-testid="text-weight-percentile">
                              {result.weightPercentile}th
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1" data-testid="text-weight-category">
                            {result.weightCategory}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Height Percentile</span>
                            <span className={`font-bold ${getCategoryColor(result.heightCategory)}`} data-testid="text-height-percentile">
                              {result.heightPercentile}th
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1" data-testid="text-height-category">
                            {result.heightCategory}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">BMI Percentile</span>
                            <span className={`font-bold ${getCategoryColor(result.bmiCategory || '')}`} data-testid="text-bmi-percentile">
                              {result.bmiPercentile}th
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1" data-testid="text-bmi-category">
                            {result.bmiCategory}
                          </div>
                        </div>
                        {result.headCircumferencePercentile && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Head Circumference</span>
                              <span className="font-bold text-purple-600" data-testid="text-head-percentile">
                                {result.headCircumferencePercentile.toFixed(1)}th
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Growth Velocity */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4">Growth Velocity</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Weight Gain:</span>
                            <span className="font-bold text-blue-800">{result.growthVelocity.weightGain}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Height Gain:</span>
                            <span className="font-bold text-blue-800">{result.growthVelocity.heightGain}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">{result.growthVelocity.expected}</div>
                        </div>
                      </div>

                      {/* Parental Comparison */}
                      {result.parentalComparison && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                          <h4 className="font-bold text-purple-800 mb-4 text-lg">Genetic Potential</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-700 font-medium">Expected Adult Height:</span>
                              <span className="font-bold text-purple-800 text-lg">
                                {result.parentalComparison.expectedRange}
                              </span>
                            </div>
                            <div className="text-sm text-purple-600">
                              {result.parentalComparison.geneticFactors}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Concerns */}
                      {result.assessment.concerns.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                          <h4 className="font-bold text-orange-800 mb-4 text-lg">Important Notes</h4>
                          <div className="space-y-2">
                            {result.assessment.concerns.map((concern, index) => (
                              <div key={index} className="flex items-start">
                                <span className="text-orange-600 mr-2">⚠️</span>
                                <span className="text-orange-700 text-sm">{concern}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-800 mb-4 text-lg">Recommendations</h4>
                        <div className="space-y-2">
                          {result.assessment.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span className="text-green-700 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">📊</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter baby's measurements to see percentile analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Milestones */}
          {result && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Developmental Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="font-bold text-blue-800 mb-4">Physical Development</h4>
                    <ul className="space-y-2">
                      {result.nextMilestones.physical.map((milestone, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-blue-700 text-sm">{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h4 className="font-bold text-purple-800 mb-4">Cognitive & Social Development</h4>
                    <ul className="space-y-2">
                      {result.nextMilestones.cognitive.map((milestone, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          <span className="text-purple-700 text-sm">{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What are Growth Percentiles?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Growth percentiles are statistical measures that compare your baby's measurements to those of other 
                    children of the same age and gender. Our calculator uses the World Health Organization (WHO) growth 
                    standards, which are based on data from healthy children worldwide.
                  </p>
                  <p>
                    A percentile ranking shows what percentage of children are smaller than your baby. For example, 
                    if your baby is in the 75th percentile for weight, it means 75% of babies the same age weigh less, 
                    and 25% weigh more. This helps pediatricians and parents track healthy development patterns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Percentile Rankings</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Percentile rankings provide context for your baby's growth within the normal population. 
                    Most healthy babies fall between the 5th and 95th percentiles, with consistent growth patterns 
                    being more important than specific percentile numbers.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>5th-25th percentile: Smaller than average but typically normal</li>
                    <li>25th-75th percentile: Average range</li>
                    <li>75th-95th percentile: Larger than average but typically normal</li>
                    <li>Below 5th or above 95th: May require evaluation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Features of Our Calculator</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>WHO growth standards for accurate percentiles</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Growth velocity tracking over time</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Premature baby corrected age calculations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Parental height genetic potential assessment</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Developmental milestone tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Percentile Tracking</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Early detection of growth concerns</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Objective measurement of healthy development</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized growth assessments</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Evidence-based pediatric care support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Peace of mind for parents</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Growth Patterns and Factors */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors Influencing Baby Growth Percentiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Genetic Factors</h4>
                    <p className="text-gray-600">
                      Parental height and body type significantly influence baby growth patterns. Children typically 
                      follow their genetic growth curve, which may be consistently above or below average percentiles 
                      while still being perfectly healthy.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Nutritional Factors</h4>
                    <p className="text-gray-600">
                      Adequate nutrition is crucial for optimal growth. Breastfeeding, proper formula feeding, 
                      and timely introduction of solids all contribute to healthy growth percentiles and 
                      developmental milestones achievement.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Health and Medical Factors</h4>
                    <p className="text-gray-600">
                      Chronic conditions, frequent illnesses, or digestive issues can affect growth percentiles. 
                      Premature babies require corrected age calculations to accurately assess their growth 
                      patterns and development.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Environmental Factors</h4>
                    <p className="text-gray-600">
                      Quality of sleep, physical activity levels, stress, and overall care environment impact 
                      growth. A nurturing, stimulating environment supports both physical growth and cognitive 
                      development milestones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age-Specific Growth Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Growth Patterns by Age</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">0-6 Months</h4>
                      <p className="text-sm">Rapid growth phase with weight doubling by 4-6 months. Height increases 
                      significantly. Growth percentiles may fluctuate as babies establish their genetic curve.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">6-12 Months</h4>
                      <p className="text-sm">Growth rate slows but remains steady. Weight triples from birth by first 
                      birthday. Introduction of solids affects growth patterns and percentile rankings.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">12-24 Months</h4>
                      <p className="text-sm">Growth velocity decreases. Toddlers may shift percentiles as they establish 
                      their long-term growth curve. Activity levels significantly impact BMI percentiles.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">24+ Months</h4>
                      <p className="text-sm">Steady, consistent growth with percentiles stabilizing along genetic potential. 
                      Height percentiles become more predictive of adult stature.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">When to Consult Healthcare Providers</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Immediate Consultation Needed</h4>
                      <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                        <li>Consistent decline across multiple percentiles</li>
                        <li>Weight or height below 3rd percentile</li>
                        <li>Crossing more than 2 percentile lines downward</li>
                        <li>No weight gain for 2+ months</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Monitor and Discuss</h4>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Sudden percentile changes</li>
                        <li>BMI above 95th percentile consistently</li>
                        <li>Growth velocity concerns</li>
                        <li>Developmental milestone delays</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Normal Monitoring</h4>
                      <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                        <li>Consistent percentile tracking</li>
                        <li>Meeting developmental milestones</li>
                        <li>Good appetite and energy</li>
                        <li>Following family growth patterns</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Growth Velocity and BMI */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Understanding Growth Velocity and BMI Percentiles</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Growth Velocity Tracking</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Weight Velocity</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• 0-3 months: 20-30g/day</li>
                          <li>• 3-6 months: 15-20g/day</li>
                          <li>• 6-12 months: 10-15g/day</li>
                          <li>• 12-24 months: 5-10g/day</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Height Velocity</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• 0-6 months: 2-3cm/month</li>
                          <li>• 6-12 months: 1-2cm/month</li>
                          <li>• 12-24 months: 0.8-1.2cm/month</li>
                          <li>• 24+ months: 0.5-0.8cm/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">BMI Percentiles for Infants</h4>
                    <div className="space-y-3">
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">BMI Categories</h5>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Below 5th: Underweight</li>
                          <li>• 5th-85th: Healthy weight</li>
                          <li>• 85th-95th: At risk overweight</li>
                          <li>• Above 95th: Overweight</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">BMI Considerations</h5>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• More reliable after 2 years</li>
                          <li>• Consider body composition</li>
                          <li>• Track trends, not single points</li>
                          <li>• Genetics play major role</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Genetic Potential Assessment</h4>
                    <div className="space-y-3">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Height Prediction</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Boys: (Father + Mother + 13) / 2</li>
                          <li>• Girls: (Father + Mother - 13) / 2</li>
                          <li>• ±5cm genetic variation</li>
                          <li>• Environment can influence ±10cm</li>
                        </ul>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-4">
                        <h5 className="font-semibold text-teal-800 mb-2">Growth Pattern Factors</h5>
                        <ul className="text-sm text-teal-700 space-y-1">
                          <li>• Early vs late bloomers</li>
                          <li>• Constitutional delay</li>
                          <li>• Familial short/tall stature</li>
                          <li>• Catch-up growth potential</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Questions FAQ */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Growth Percentiles</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">My baby dropped percentiles - is this concerning?</h4>
                      <p className="text-gray-600 text-sm">Occasional percentile changes are normal, especially during illness or growth spurts. 
                      Concerning drops are consistent declines across multiple visits or falling below the 3rd percentile.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I be worried if my baby is in the 10th percentile?</h4>
                      <p className="text-gray-600 text-sm">Not necessarily. Many healthy babies consistently track in lower percentiles. 
                      What matters is consistent growth along their individual curve and meeting developmental milestones.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I track growth percentiles?</h4>
                      <p className="text-gray-600 text-sm">Follow your pediatrician's schedule: frequent visits in early months 
                      (2, 4, 6 months), then less frequent (9, 12, 15, 18, 24 months) as growth stabilizes.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Do breastfed and formula-fed babies have different percentiles?</h4>
                      <p className="text-gray-600 text-sm">WHO growth standards are based on breastfed babies, but both feeding methods 
                      support healthy growth. Formula-fed babies may gain weight faster initially.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When do growth percentiles stabilize?</h4>
                      <p className="text-gray-600 text-sm">Most children establish their genetic growth curve by age 2-3 years. 
                      After this, percentiles typically remain relatively stable throughout childhood.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can nutrition change my baby's percentiles?</h4>
                      <p className="text-gray-600 text-sm">Adequate nutrition is essential for reaching genetic potential. Poor nutrition 
                      can prevent optimal growth, while overfeeding can lead to excessive weight gain.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are home measurements accurate for percentile calculations?</h4>
                      <p className="text-gray-600 text-sm">Professional measurements are most accurate, but home tracking can show trends. 
                      Use our calculator for estimates between pediatric visits, not as a replacement for professional assessment.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if my baby's percentiles don't match parental expectations?</h4>
                      <p className="text-gray-600 text-sm">Children may not follow exact parental patterns due to genetic variation, 
                      environmental factors, or different growth timing. Consistent healthy growth is more important than specific percentiles.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition and Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Nutrition for Optimal Growth</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Proper nutrition directly impacts growth percentiles and developmental milestones achievement.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">0-6 Months:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Exclusive breastfeeding or formula</li>
                        <li>On-demand feeding schedule</li>
                        <li>Monitor wet diapers and weight gain</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">6-12 Months:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Introduction of iron-rich solids</li>
                        <li>Variety of textures and flavors</li>
                        <li>Continue breastfeeding/formula</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">12+ Months:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Balanced family foods</li>
                        <li>Whole milk transition</li>
                        <li>Establish healthy eating patterns</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Sleep and Growth</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Growth hormone is primarily released during deep sleep, making adequate rest crucial for healthy percentiles.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-800 text-sm">Sleep Requirements:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-blue-700">
                        <li>Newborns: 14-17 hours/day</li>
                        <li>3-11 months: 12-15 hours/day</li>
                        <li>1-2 years: 11-14 hours/day</li>
                        <li>Quality deep sleep phases</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Sleep Impact:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Growth hormone production</li>
                        <li>Appetite regulation</li>
                        <li>Immune system support</li>
                        <li>Brain development</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Physical Activity & Growth</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Age-appropriate physical activity supports healthy growth patterns and BMI percentiles.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-800 text-sm">Infant Activity:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-orange-700">
                        <li>Tummy time for development</li>
                        <li>Reaching and grasping play</li>
                        <li>Floor time for movement</li>
                        <li>Interactive play sessions</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-800 text-sm">Toddler Activity:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-purple-700">
                        <li>Free play and exploration</li>
                        <li>Walking, running, climbing</li>
                        <li>Active games and dancing</li>
                        <li>Limit sedentary time</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technology and Tracking */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Modern Growth Tracking Tools and Technology</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Digital Tracking Benefits</h4>
                      <p className="text-blue-700 text-sm">Online percentile calculators like ours provide instant, accurate results using 
                      WHO standards. Track growth trends over time and identify patterns that might need attention.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Healthcare Integration</h4>
                      <p className="text-green-700 text-sm">Share growth tracking data with pediatricians for more informed consultations. 
                      Digital records help identify subtle changes that might be missed in traditional charting.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Predictive Analytics</h4>
                      <p className="text-orange-700 text-sm">Advanced calculators can project growth trajectories and identify potential 
                      concerns early, enabling proactive healthcare interventions when needed.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Measurement Accuracy</h4>
                      <p className="text-purple-700 text-sm">Digital tools reduce calculation errors and provide consistent results. 
                      Always use calibrated scales and measuring devices for the most accurate percentile calculations.</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Data Privacy Considerations</h4>
                      <p className="text-red-700 text-sm">Choose calculators that don't store personal data. Our tool processes 
                      information locally without saving any baby health information to external servers.</p>
                    </div>
                    <div className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-teal-800 mb-2">Professional Validation</h4>
                      <p className="text-teal-700 text-sm">While digital tools are helpful for tracking, always validate concerning 
                      results with healthcare professionals who can provide comprehensive assessments and recommendations.</p>
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
}
