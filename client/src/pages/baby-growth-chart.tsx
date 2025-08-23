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
import { Calculator, Baby } from 'lucide-react';

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

const BabyGrowthChart = () => {
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
      // Adjust for prematurity
      const correctionMonths = (40 - correctedAgeWeeks) / 4.33; // weeks to months
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
    // Simplified percentile calculation
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
    if (fromUnit === 'imperial') return weight * 0.453592; // lbs to kg
    return weight;
  };

  const convertHeight = (height: number, fromUnit: string): number => {
    if (fromUnit === 'imperial') return height * 2.54; // inches to cm
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
    
    // Growth assessment
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
    
    // Calculate ideal ranges (15th-85th percentiles)
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

  return (
    <>
      <Helmet>
        <title>Baby Growth Chart Calculator - Track Baby Development | DapsiWow</title>
        <meta name="description" content="Track your baby's growth and development with WHO growth standards. Calculate weight and height percentiles, get milestone information." />
        <meta name="keywords" content="baby growth chart, infant development, WHO growth standards, baby weight percentile, baby height percentile, pediatric growth" />
        <meta property="og:title" content="Baby Growth Chart Calculator - Track Baby Development | DapsiWow" />
        <meta property="og:description" content="Professional baby growth tracking tool using WHO standards to monitor healthy development and milestones." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/baby-growth-chart" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-baby-growth-chart">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Baby className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Baby Growth Chart Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Track your baby's growth and development using WHO growth standards with personalized milestone information
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Baby Information</h2>
                      
                      {/* Baby Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Baby's Gender *
                        </Label>
                        <RadioGroup 
                          value={babyGender} 
                          onValueChange={setBabyGender}
                          className="flex space-x-6"
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
                        <Label htmlFor="birth-date" className="text-sm font-medium text-gray-700">
                          Birth Date *
                        </Label>
                        <Input
                          id="birth-date"
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          max={getTodayDate()}
                          data-testid="input-birth-date"
                        />
                        <p className="text-xs text-gray-500">
                          Baby's actual birth date
                        </p>
                      </div>

                      {/* Measurement Unit */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Measurement Unit *
                        </Label>
                        <RadioGroup 
                          value={measurementUnit} 
                          onValueChange={setMeasurementUnit}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="metric" id="metric" data-testid="radio-metric" />
                            <Label htmlFor="metric" className="text-sm">Metric (kg, cm)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="imperial" id="imperial" data-testid="radio-imperial" />
                            <Label htmlFor="imperial" className="text-sm">Imperial (lbs, inches)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Current Weight */}
                      <div className="space-y-3">
                        <Label htmlFor="current-weight" className="text-sm font-medium text-gray-700">
                          Current Weight ({measurementUnit === 'metric' ? 'kg' : 'lbs'}) *
                        </Label>
                        <Input
                          id="current-weight"
                          type="number"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={measurementUnit === 'metric' ? '7.5' : '16.5'}
                          min="1"
                          max={measurementUnit === 'metric' ? '30' : '66'}
                          step="0.1"
                          data-testid="input-weight"
                        />
                        <p className="text-xs text-gray-500">
                          Baby's current weight
                        </p>
                      </div>

                      {/* Current Height */}
                      <div className="space-y-3">
                        <Label htmlFor="current-height" className="text-sm font-medium text-gray-700">
                          Current Height ({measurementUnit === 'metric' ? 'cm' : 'inches'}) *
                        </Label>
                        <Input
                          id="current-height"
                          type="number"
                          value={currentHeight}
                          onChange={(e) => setCurrentHeight(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={measurementUnit === 'metric' ? '68' : '27'}
                          min="30"
                          max={measurementUnit === 'metric' ? '120' : '47'}
                          step="0.1"
                          data-testid="input-height"
                        />
                        <p className="text-xs text-gray-500">
                          Baby's current height/length
                        </p>
                      </div>

                      {/* Head Circumference */}
                      <div className="space-y-3">
                        <Label htmlFor="head-circumference" className="text-sm font-medium text-gray-700">
                          Head Circumference ({measurementUnit === 'metric' ? 'cm' : 'inches'}) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="head-circumference"
                          type="number"
                          value={headCircumference}
                          onChange={(e) => setHeadCircumference(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder={measurementUnit === 'metric' ? '42' : '16.5'}
                          min="25"
                          max={measurementUnit === 'metric' ? '60' : '24'}
                          step="0.1"
                          data-testid="input-head"
                        />
                        <p className="text-xs text-gray-500">
                          Measured around the largest part of baby's head
                        </p>
                      </div>

                      {/* Premature Birth */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Was baby born prematurely? <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <RadioGroup 
                          value={premature} 
                          onValueChange={setPremature}
                          className="flex space-x-6"
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
                      </div>

                      {/* Corrected Age */}
                      {premature === 'yes' && (
                        <div className="space-y-3">
                          <Label htmlFor="corrected-age" className="text-sm font-medium text-gray-700">
                            Gestational Age at Birth (weeks)
                          </Label>
                          <Input
                            id="corrected-age"
                            type="number"
                            value={correctedAge}
                            onChange={(e) => setCorrectedAge(e.target.value)}
                            className="h-12 text-base border-gray-200 rounded-lg"
                            placeholder="32"
                            min="24"
                            max="36"
                            data-testid="input-corrected-age"
                          />
                          <p className="text-xs text-gray-500">
                            For corrected age calculation (normal is 40 weeks)
                          </p>
                        </div>
                      )}

                      {/* Information Box */}
                      <div className="bg-blue-50 rounded-lg p-4 mt-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Measurement Tips</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Weigh baby naked for accuracy</li>
                          <li>• Measure length lying down (under 2 years)</li>
                          <li>• Use most recent measurements</li>
                          <li>• Track growth trends over time</li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateGrowth}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Growth
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Growth Assessment</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="growth-results">
                          {/* Growth Percentiles */}
                          <div className="bg-white rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-gray-900 mb-2">Growth Percentiles</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Weight Percentile</span>
                                <span className={`font-bold ${getCategoryColor(result.weightCategory)}`} data-testid="text-weight-percentile">
                                  {result.weightPercentile}th
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Height Percentile</span>
                                <span className={`font-bold ${getCategoryColor(result.heightCategory)}`} data-testid="text-height-percentile">
                                  {result.heightPercentile}th
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Growth Categories */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Growth Categories</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Weight</span>
                                <span className={`font-medium ${getCategoryColor(result.weightCategory)}`} data-testid="text-weight-category">
                                  {result.weightCategory}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Height</span>
                                <span className={`font-medium ${getCategoryColor(result.heightCategory)}`} data-testid="text-height-category">
                                  {result.heightCategory}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Overall Assessment */}
                          <div className={`rounded-lg p-4 border-l-4 ${result.growth.isHealthy ? 'bg-green-50 border-l-green-500' : 'bg-yellow-50 border-l-yellow-500'}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Overall Growth</span>
                              <span className={`font-bold ${result.growth.isHealthy ? 'text-green-600' : 'text-yellow-600'}`} data-testid="text-growth-status">
                                {result.growth.isHealthy ? 'Healthy' : 'Needs Attention'}
                              </span>
                            </div>
                          </div>

                          {/* Ideal Ranges */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Ideal Ranges (15th-85th percentile)</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Weight</span>
                                <span className="font-medium">
                                  {result.idealRanges.weight.min.toFixed(1)} - {result.idealRanges.weight.max.toFixed(1)} kg
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Height</span>
                                <span className="font-medium">
                                  {result.idealRanges.height.min.toFixed(0)} - {result.idealRanges.height.max.toFixed(0)} cm
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Concerns */}
                          {result.growth.concerns.length > 0 && (
                            <div className="bg-red-50 rounded-lg p-4">
                              <h3 className="font-semibold text-red-900 mb-2">Areas of Concern</h3>
                              <ul className="text-sm text-red-700 space-y-1">
                                {result.growth.concerns.map((concern, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2">⚠️</span>
                                    <span>{concern}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Recommendations */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {result.growth.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Developmental Milestones */}
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Expected Milestones</h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Physical:</span>
                                <ul className="text-gray-600 mt-1">
                                  {result.milestones.physical.map((milestone, index) => (
                                    <li key={index}>• {milestone}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Developmental:</span>
                                <ul className="text-gray-600 mt-1">
                                  {result.milestones.developmental.map((milestone, index) => (
                                    <li key={index}>• {milestone}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Next Checkup */}
                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Next Recommended Checkup</span>
                              <span className="font-medium text-orange-600" data-testid="text-next-checkup">
                                {result.nextCheckup}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter baby's information to assess growth</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Growth Charts */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Growth Charts</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What are Percentiles?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Growth percentiles show how your baby compares to other babies of the same age and gender. 
                        The 50th percentile is the average. A baby in the 75th percentile is larger than 75% of babies the same age.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Normal?</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Most healthy babies fall between the 3rd and 97th percentiles. What matters most is that 
                        your baby is growing consistently along their own growth curve.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Percentile Ranges</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Below 3rd percentile</div>
                            <div className="text-sm text-gray-600">May need evaluation</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">3rd-15th percentile</div>
                            <div className="text-sm text-gray-600">Small but likely normal</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">15th-85th percentile</div>
                            <div className="text-sm text-gray-600">Typical range</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">85th-97th percentile</div>
                            <div className="text-sm text-gray-600">Large but likely normal</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Above 97th percentile</div>
                            <div className="text-sm text-gray-600">May need monitoring</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Healthy Growth Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Supporting Healthy Growth</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Exclusive breastfeeding for first 6 months</li>
                        <li>• Introduce solids gradually around 6 months</li>
                        <li>• Offer variety of healthy foods</li>
                        <li>• Follow baby's hunger cues</li>
                        <li>• Avoid added sugars and salt</li>
                        <li>• Ensure adequate vitamin D</li>
                        <li>• Stay hydrated (breastfeeding mothers)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Support</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Provide tummy time daily</li>
                        <li>• Read and talk to your baby</li>
                        <li>• Encourage safe exploration</li>
                        <li>• Maintain consistent sleep routines</li>
                        <li>• Regular pediatric check-ups</li>
                        <li>• Age-appropriate toys and activities</li>
                        <li>• Responsive, loving interactions</li>
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

export default BabyGrowthChart;