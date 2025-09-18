
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

interface GrowthResult {
  weightPercentile: number;
  heightPercentile: number;
  headCircumferencePercentile?: number;
  weightCategory: string;
  heightCategory: string;
  growth: {
    isHealthy: boolean;
    recommendations: string[];
    concerns: string[];
  };
  milestones: {
    physical: string[];
    developmental: string[];
  };
  nextCheckup: string;
  idealRanges: {
    weight: { min: number; max: number; };
    height: { min: number; max: number; };
  };
}

export default function BabyGrowthChart() {
  const [babyGender, setBabyGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentHeight, setCurrentHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('metric');
  const [premature, setPremature] = useState('no');
  const [correctedAge, setCorrectedAge] = useState('');
  const [result, setResult] = useState<GrowthResult | null>(null);

  // WHO Growth Standards data (simplified percentiles)
  const whoGrowthData = {
    // Weight percentiles for boys (kg) by month
    boys: {
      weight: {
        0: [2.5, 3.3, 4.4, 5.8], // 3rd, 15th, 85th, 97th percentiles
        1: [3.4, 4.5, 5.8, 7.5],
        2: [4.3, 5.6, 7.1, 9.0],
        3: [5.0, 6.4, 8.0, 10.0],
        6: [6.4, 7.9, 9.8, 12.1],
        9: [7.6, 9.2, 11.2, 13.7],
        12: [8.4, 10.0, 12.0, 14.8],
        18: [9.6, 11.3, 13.3, 16.3],
        24: [10.5, 12.2, 14.3, 17.4]
      },
      height: {
        0: [46, 50, 54, 57], // 3rd, 15th, 85th, 97th percentiles (cm)
        1: [51, 55, 59, 62],
        2: [54, 58, 63, 67],
        3: [57, 61, 66, 70],
        6: [63, 67, 72, 76],
        9: [68, 72, 77, 81],
        12: [71, 76, 81, 86],
        18: [77, 82, 87, 92],
        24: [82, 87, 92, 98]
      }
    },
    // Weight percentiles for girls (kg) by month
    girls: {
      weight: {
        0: [2.4, 3.2, 4.2, 5.5],
        1: [3.2, 4.2, 5.4, 6.9],
        2: [4.0, 5.1, 6.6, 8.4],
        3: [4.6, 5.8, 7.5, 9.5],
        6: [5.9, 7.3, 9.3, 11.6],
        9: [7.0, 8.5, 10.9, 13.5],
        12: [7.7, 9.2, 11.7, 14.6],
        18: [8.7, 10.4, 13.0, 16.1],
        24: [9.6, 11.3, 14.0, 17.3]
      },
      height: {
        0: [45, 49, 53, 56],
        1: [50, 54, 58, 61],
        2: [53, 57, 62, 66],
        3: [56, 60, 65, 69],
        6: [61, 65, 70, 75],
        9: [66, 70, 75, 80],
        12: [69, 74, 79, 84],
        18: [75, 80, 86, 91],
        24: [80, 85, 91, 96]
      }
    }
  };

  const calculateAgeInMonths = (birthDateStr: string, isPremature: boolean, correctedAgeWeeks?: number): number => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let ageInMonths = (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    
    if (isPremature && correctedAgeWeeks) {
      const correctionMonths = (40 - correctedAgeWeeks) / 4.33;
      ageInMonths -= correctionMonths;
    }
    
    return Math.max(0, ageInMonths);
  };

  const getClosestAgeData = (ageInMonths: number) => {
    const availableAges = [0, 1, 2, 3, 6, 9, 12, 18, 24];
    return availableAges.reduce((closest, age) => 
      Math.abs(age - ageInMonths) < Math.abs(closest - ageInMonths) ? age : closest
    );
  };

  const calculatePercentile = (value: number, percentileData: number[]): number => {
    const [p3, p15, p85, p97] = percentileData;
    
    if (value <= p3) return 3;
    if (value <= p15) return 3 + (value - p3) / (p15 - p3) * 12;
    if (value <= p85) return 15 + (value - p15) / (p85 - p15) * 70;
    if (value <= p97) return 85 + (value - p85) / (p97 - p85) * 12;
    return 97;
  };

  const getCategory = (percentile: number): string => {
    if (percentile < 3) return 'Below Normal Range';
    if (percentile < 15) return 'Low Normal';
    if (percentile <= 85) return 'Normal';
    if (percentile <= 97) return 'High Normal';
    return 'Above Normal Range';
  };

  const getCategoryColor = (category: string): string => {
    if (category === 'Normal') return 'text-green-600';
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

  const getDevelopmentalMilestones = (ageInMonths: number) => {
    if (ageInMonths < 1) {
      return {
        physical: ['Lifts head briefly', 'Reflexes present', 'Focuses on faces'],
        developmental: ['Responds to sounds', 'Makes eye contact', 'Sleeps 14-17 hours/day']
      };
    } else if (ageInMonths < 3) {
      return {
        physical: ['Holds head up', 'Follows objects', 'Smiles'],
        developmental: ['Coos and gurgles', 'Recognizes parents', 'Shows interest in toys']
      };
    } else if (ageInMonths < 6) {
      return {
        physical: ['Rolls over', 'Sits with support', 'Reaches for objects'],
        developmental: ['Laughs', 'Responds to name', 'Explores with mouth']
      };
    } else if (ageInMonths < 12) {
      return {
        physical: ['Sits without support', 'Crawls', 'Pulls to stand'],
        developmental: ['Says first words', 'Plays peek-a-boo', 'Shows stranger anxiety']
      };
    } else if (ageInMonths < 18) {
      return {
        physical: ['Walks independently', 'Climbs', 'Uses pincer grasp'],
        developmental: ['Says 10+ words', 'Points to objects', 'Shows independence']
      };
    } else {
      return {
        physical: ['Runs', 'Kicks ball', 'Builds towers'],
        developmental: ['2-word phrases', 'Follows instructions', 'Pretend play']
      };
    }
  };

  const calculateGrowth = () => {
    if (!babyGender || !birthDate || !currentWeight || !currentHeight) return;

    const weightKg = convertWeight(parseFloat(currentWeight), measurementUnit);
    const heightCm = convertHeight(parseFloat(currentHeight), measurementUnit);
    const isPremature = premature === 'yes';
    const correctedAgeWeeks = correctedAge ? parseFloat(correctedAge) : undefined;
    
    const ageInMonths = calculateAgeInMonths(birthDate, isPremature, correctedAgeWeeks);
    const closestAge = getClosestAgeData(ageInMonths);
    
    const genderData = whoGrowthData[babyGender as 'boys' | 'girls'];
    const weightPercentiles = genderData.weight[closestAge as keyof typeof genderData.weight];
    const heightPercentiles = genderData.height[closestAge as keyof typeof genderData.height];
    
    const weightPercentile = calculatePercentile(weightKg, weightPercentiles);
    const heightPercentile = calculatePercentile(heightCm, heightPercentiles);
    
    const weightCategory = getCategory(weightPercentile);
    const heightCategory = getCategory(heightPercentile);
    
    const isHealthy = weightPercentile >= 3 && weightPercentile <= 97 && 
                     heightPercentile >= 3 && heightPercentile <= 97;
    
    let recommendations: string[] = [];
    let concerns: string[] = [];
    
    if (weightPercentile < 3) {
      concerns.push('Weight below 3rd percentile - consult pediatrician');
      recommendations.push('Discuss feeding schedule and nutrition with doctor');
    } else if (weightPercentile > 97) {
      concerns.push('Weight above 97th percentile - monitor closely');
      recommendations.push('Review feeding patterns and activity level');
    }
    
    if (heightPercentile < 3) {
      concerns.push('Height below 3rd percentile - growth evaluation needed');
    } else if (heightPercentile > 97) {
      recommendations.push('Tall stature - ensure adequate nutrition for growth');
    }
    
    if (isHealthy) {
      recommendations.push('Continue current feeding and care routine');
      recommendations.push('Maintain regular pediatric check-ups');
    }
    
    recommendations.push('Ensure adequate sleep and nutrition');
    recommendations.push('Encourage age-appropriate activities');
    
    const milestones = getDevelopmentalMilestones(ageInMonths);
    
    const idealWeight = {
      min: weightPercentiles[1],
      max: weightPercentiles[2]
    };
    
    const idealHeight = {
      min: heightPercentiles[1],
      max: heightPercentiles[2]
    };
    
    const newResult: GrowthResult = {
      weightPercentile: Math.round(weightPercentile),
      heightPercentile: Math.round(heightPercentile),
      weightCategory,
      heightCategory,
      growth: {
        isHealthy,
        recommendations,
        concerns
      },
      milestones,
      nextCheckup: getNextCheckupSchedule(ageInMonths),
      idealRanges: {
        weight: idealWeight,
        height: idealHeight
      }
    };
    
    setResult(newResult);
  };

  const getNextCheckupSchedule = (ageInMonths: number): string => {
    if (ageInMonths < 1) return '2-4 weeks';
    if (ageInMonths < 2) return '2 months';
    if (ageInMonths < 4) return '4 months';
    if (ageInMonths < 6) return '6 months';
    if (ageInMonths < 9) return '9 months';
    if (ageInMonths < 12) return '12 months';
    if (ageInMonths < 15) return '15 months';
    if (ageInMonths < 18) return '18 months';
    if (ageInMonths < 24) return '24 months';
    return 'Every 6 months';
  };

  const resetCalculator = () => {
    setBabyGender('');
    setBirthDate('');
    setCurrentWeight('');
    setCurrentHeight('');
    setHeadCircumference('');
    setMeasurementUnit('metric');
    setPremature('no');
    setCorrectedAge('');
    setResult(null);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(1)} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Baby Growth Chart Calculator - Track Your Baby's Development | DapsiWow</title>
        <meta name="description" content="Free baby growth chart calculator using WHO growth standards. Track your baby's weight, height percentiles, and developmental milestones. Get personalized growth assessments and recommendations." />
        <meta name="keywords" content="baby growth chart, infant development tracker, WHO growth standards, baby weight percentile, baby height percentile, child growth calculator, pediatric growth chart, baby milestone tracker, infant growth assessment, newborn growth calculator" />
        <meta property="og:title" content="Baby Growth Chart Calculator - Track Your Baby's Development | DapsiWow" />
        <meta property="og:description" content="Professional baby growth tracking tool using WHO standards. Monitor healthy development with personalized assessments and milestone tracking." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/baby-growth-chart" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Baby Growth Chart Calculator",
            "description": "Free online baby growth chart calculator using WHO growth standards to track infant development, weight and height percentiles, and developmental milestones.",
            "url": "https://dapsiwow.com/tools/baby-growth-chart",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "WHO Growth Standards tracking",
              "Weight and height percentiles",
              "Developmental milestone tracking",
              "Personalized growth assessments",
              "Premature baby adjustments",
              "Multiple measurement units"
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
                <span className="text-sm font-medium text-blue-700">Professional Growth Tracker</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Baby Growth
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Calculator
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Track your baby's development with WHO growth standards and personalized milestone assessments
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Baby Information</h2>
                    <p className="text-gray-600">Enter your baby's details for accurate growth assessment</p>
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
                          <Label htmlFor="corrected-age" className="text-sm font-medium text-gray-700">
                            Gestational Age at Birth (weeks)
                          </Label>
                          <Input
                            id="corrected-age"
                            type="number"
                            value={correctedAge}
                            onChange={(e) => setCorrectedAge(e.target.value)}
                            className="h-12 border-2 border-gray-200 rounded-lg w-full md:w-48 mt-2"
                            placeholder="32"
                            min="24"
                            max="36"
                            data-testid="input-corrected-age"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            For corrected age calculation (normal is 40 weeks)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={calculateGrowth}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      Calculate Growth
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Growth Assessment</h2>
                  
                  {result ? (
                    <div className="space-y-6" data-testid="growth-results">
                      {/* Growth Status Highlight */}
                      <div className={`rounded-2xl p-6 shadow-lg border ${result.growth.isHealthy ? 'bg-white border-green-100' : 'bg-white border-orange-100'}`}>
                        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Overall Growth Status</div>
                        <div className={`text-4xl font-bold ${result.growth.isHealthy ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600' : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600'}`} data-testid="text-growth-status">
                          {result.growth.isHealthy ? 'Healthy' : 'Needs Attention'}
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
                      </div>

                      {/* Ideal Ranges */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4">Healthy Ranges (15th-85th percentile)</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Weight Range:</span>
                            <span className="font-bold text-blue-800">
                              {formatValue(result.idealRanges.weight.min, measurementUnit === 'metric' ? 'kg' : 'lbs')} - {formatValue(result.idealRanges.weight.max, measurementUnit === 'metric' ? 'kg' : 'lbs')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Height Range:</span>
                            <span className="font-bold text-blue-800">
                              {formatValue(result.idealRanges.height.min, measurementUnit === 'metric' ? 'cm' : 'in')} - {formatValue(result.idealRanges.height.max, measurementUnit === 'metric' ? 'cm' : 'in')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Concerns */}
                      {result.growth.concerns.length > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                          <h4 className="font-bold text-orange-800 mb-4 text-lg">Important Notes</h4>
                          <div className="space-y-2">
                            {result.growth.concerns.map((concern, index) => (
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
                          {result.growth.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span className="text-green-700 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next Checkup */}
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Next Recommended Checkup</span>
                          <span className="font-bold text-indigo-600" data-testid="text-next-checkup">
                            {result.nextCheckup}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16" data-testid="no-results">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <div className="text-3xl font-bold text-gray-400">👶</div>
                      </div>
                      <p className="text-gray-500 text-lg">Enter baby's information to see growth assessment</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developmental Milestones */}
          {result && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Expected Developmental Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="font-bold text-blue-800 mb-4">Physical Development</h4>
                    <ul className="space-y-2">
                      {result.milestones.physical.map((milestone, index) => (
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
                      {result.milestones.developmental.map((milestone, index) => (
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is a Baby Growth Chart?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    A baby growth chart is a standardized tool used by pediatricians and parents worldwide to track 
                    infant development. Our calculator uses the World Health Organization (WHO) growth standards, 
                    which are based on data from healthy breastfed babies from diverse ethnic backgrounds.
                  </p>
                  <p>
                    Growth charts help identify whether a baby is growing at a healthy rate by comparing their 
                    measurements to those of other babies of the same age and gender. The percentile ranking shows 
                    what percentage of babies are smaller than your child.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Understanding Growth Percentiles</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Growth percentiles indicate your baby's position relative to other babies. A 50th percentile 
                    means your baby is average-sized. The 25th percentile means 25% of babies are smaller, while 
                    75% are larger.
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>3rd-15th percentile: Small but typically normal</li>
                    <li>15th-85th percentile: Average range</li>
                    <li>85th-97th percentile: Large but typically normal</li>
                    <li>Below 3rd or above 97th: May need evaluation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Growth Tracking</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Early detection of growth problems</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor nutritional adequacy</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track developmental milestones</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Optimize pediatric care</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Peace of mind for parents</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">WHO Growth Standards</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Based on healthy breastfed babies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>International standard for child growth</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Accounts for genetic diversity</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Updated with modern data</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Trusted by pediatricians worldwide</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Factors Affecting Growth */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Factors That Influence Baby Growth</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Genetic Factors</h4>
                    <p className="text-gray-600">
                      Parents' height and weight significantly influence their baby's growth pattern. Tall parents 
                      typically have taller babies, while shorter parents may have smaller babies. Family growth 
                      patterns often repeat across generations.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Nutritional Factors</h4>
                    <p className="text-gray-600">
                      Proper nutrition is crucial for healthy growth. Breastfeeding provides optimal nutrition 
                      for the first six months, while appropriate introduction of solid foods supports continued 
                      growth and development.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Health Conditions</h4>
                    <p className="text-gray-600">
                      Chronic illnesses, digestive issues, or hormonal imbalances can affect growth rates. 
                      Regular pediatric checkups help identify and address any health concerns that might 
                      impact development.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Environmental Factors</h4>
                    <p className="text-gray-600">
                      Sleep quality, physical activity, stress levels, and overall care environment all 
                      contribute to healthy growth. A loving, stimulating environment promotes both physical 
                      and cognitive development.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age-Based Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Growth Milestones by Age</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">0-3 Months</h4>
                      <p className="text-sm">Rapid weight gain, doubles birth weight by 3-4 months. Height increases by 3-4 cm per month. Head circumference grows significantly.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">3-6 Months</h4>
                      <p className="text-sm">Weight gain slows to 140-200g per week. Height growth continues at 2-3 cm per month. Motor skills develop rapidly.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">6-12 Months</h4>
                      <p className="text-sm">Weight triples from birth by first birthday. Height increases by 50% from birth. Solid food introduction affects growth patterns.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">12-24 Months</h4>
                      <p className="text-sm">Growth rate slows but remains steady. Weight quadruples from birth by age 2. Height doubles from birth by age 4.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">When to Consult a Pediatrician</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Immediate Consultation</h4>
                      <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                        <li>Consistent percentile drops across multiple visits</li>
                        <li>Weight or height below 3rd percentile</li>
                        <li>No weight gain for extended periods</li>
                        <li>Signs of developmental delays</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Monitor Closely</h4>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Crossing percentile lines suddenly</li>
                        <li>Feeding difficulties or refusal</li>
                        <li>Above 97th percentile consistently</li>
                        <li>Growth pattern changes significantly</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Regular Monitoring</h4>
                      <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                        <li>Consistent growth along percentile lines</li>
                        <li>Meeting age-appropriate milestones</li>
                        <li>Good appetite and energy levels</li>
                        <li>Following family growth patterns</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feeding and Nutrition */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Nutrition Guidelines for Optimal Growth</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">0-6 Months</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Breastfeeding</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Exclusive breastfeeding recommended</li>
                          <li>• 8-12 feedings per day</li>
                          <li>• On-demand feeding schedule</li>
                          <li>• No water or other liquids needed</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Formula Feeding</h5>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Iron-fortified formula</li>
                          <li>• 2-4 ounces per feeding initially</li>
                          <li>• Every 2-4 hours</li>
                          <li>• Follow pediatrician's guidance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">6-12 Months</h4>
                    <div className="space-y-3">
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-800 mb-2">Introducing Solids</h5>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Start with single-grain cereals</li>
                          <li>• Introduce pureed fruits/vegetables</li>
                          <li>• One new food every 3-5 days</li>
                          <li>• Continue breastfeeding/formula</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Texture Progression</h5>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Progress to mashed foods</li>
                          <li>• Introduce finger foods</li>
                          <li>• Small, soft pieces</li>
                          <li>• Encourage self-feeding</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">12+ Months</h4>
                    <div className="space-y-3">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Toddler Nutrition</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Transition to whole milk</li>
                          <li>• Variety of family foods</li>
                          <li>• 3 meals + 2 snacks daily</li>
                          <li>• Encourage independence</li>
                        </ul>
                      </div>
                      <div className="bg-teal-50 rounded-lg p-4">
                        <h5 className="font-semibold text-teal-800 mb-2">Balanced Diet</h5>
                        <ul className="text-sm text-teal-700 space-y-1">
                          <li>• Include all food groups</li>
                          <li>• Limit processed foods</li>
                          <li>• Offer water between meals</li>
                          <li>• Model healthy eating habits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Common Concerns FAQ */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Baby Growth</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is my baby growing too fast or too slow?</h4>
                      <p className="text-gray-600 text-sm">Growth patterns vary significantly among healthy babies. What matters most is consistent growth along your baby's individual curve. Sudden changes in percentile rankings may warrant pediatric evaluation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I be concerned if my baby is in a low percentile?</h4>
                      <p className="text-gray-600 text-sm">Not necessarily. Many healthy babies consistently track in lower percentiles. Concern arises when there's a significant drop across percentiles or when growth completely stops.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How often should I track my baby's growth?</h4>
                      <p className="text-gray-600 text-sm">Follow your pediatrician's schedule: frequent visits in the first months, then less frequent as your baby grows. Regular checkups typically occur at 2, 4, 6, 9, 12, 15, 18, and 24 months.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if my baby was born prematurely?</h4>
                      <p className="text-gray-600 text-sm">Premature babies use corrected age for growth assessment until age 2. This adjusts for the weeks they were born early, providing a more accurate growth evaluation.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can feeding method affect growth patterns?</h4>
                      <p className="text-gray-600 text-sm">Breastfed and formula-fed babies may show different growth patterns. Breastfed babies often gain weight more rapidly initially, then slow down around 3-4 months. Both feeding methods support healthy growth.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">When do growth spurts typically occur?</h4>
                      <p className="text-gray-600 text-sm">Common growth spurts occur around 2-3 weeks, 6 weeks, 3 months, and 6 months. During these periods, babies may feed more frequently and seem fussier than usual.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Are home scales accurate enough for tracking growth?</h4>
                      <p className="text-gray-600 text-sm">While home scales can provide general trends, pediatric office scales are more accurate. Use home measurements as reference points between official checkups, not as primary growth tracking tools.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What role does sleep play in growth?</h4>
                      <p className="text-gray-600 text-sm">Growth hormone is primarily released during deep sleep, making adequate rest crucial for healthy development. Newborns need 14-17 hours daily, gradually decreasing with age.</p>
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
