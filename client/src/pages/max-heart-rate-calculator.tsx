import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Heart } from 'lucide-react';

interface MaxHeartRateResult {
  traditional: number;
  tanaka: number;
  gulati?: number;
  nes: number;
  roppeLynch?: number;
  recommended: number;
  recommendedFormula: string;
  ageGroup: string;
  percentages: {
    fifty: number;
    sixty: number;
    seventy: number;
    eighty: number;
    ninety: number;
  };
}

const MaxHeartRateCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [result, setResult] = useState<MaxHeartRateResult | null>(null);

  const calculateMaxHeartRate = () => {
    const ageNum = parseFloat(age);

    if (ageNum && ageNum >= 15 && ageNum <= 100) {
      // Calculate using different formulas
      const traditional = 220 - ageNum;
      const tanaka = 208 - (0.7 * ageNum);
      const nes = 211 - (0.64 * ageNum);
      let gulati: number | undefined;
      let roppeLynch: number | undefined;

      // Gender-specific formulas
      if (gender === 'female') {
        gulati = 206 - (0.88 * ageNum);
        roppeLynch = 209 - (0.7 * ageNum);
      }

      // Determine recommended formula based on age, gender, and fitness level
      let recommended: number;
      let recommendedFormula: string;

      if (gender === 'female' && gulati) {
        recommended = gulati;
        recommendedFormula = 'Gulati (Female-specific)';
      } else if (fitnessLevel === 'athlete' || fitnessLevel === 'advanced') {
        recommended = nes;
        recommendedFormula = 'Nes (Active individuals)';
      } else if (ageNum > 40) {
        recommended = tanaka;
        recommendedFormula = 'Tanaka (Age-adjusted)';
      } else {
        recommended = tanaka;
        recommendedFormula = 'Tanaka (Most accurate)';
      }

      // Determine age group
      let ageGroup: string;
      if (ageNum < 25) {
        ageGroup = 'Young Adult';
      } else if (ageNum < 40) {
        ageGroup = 'Adult';
      } else if (ageNum < 55) {
        ageGroup = 'Middle-aged';
      } else {
        ageGroup = 'Older Adult';
      }

      // Calculate percentage zones based on recommended max HR
      const percentages = {
        fifty: Math.round(recommended * 0.50),
        sixty: Math.round(recommended * 0.60),
        seventy: Math.round(recommended * 0.70),
        eighty: Math.round(recommended * 0.80),
        ninety: Math.round(recommended * 0.90)
      };

      setResult({
        traditional: Math.round(traditional),
        tanaka: Math.round(tanaka),
        gulati: gulati ? Math.round(gulati) : undefined,
        nes: Math.round(nes),
        roppeLynch: roppeLynch ? Math.round(roppeLynch) : undefined,
        recommended: Math.round(recommended),
        recommendedFormula,
        ageGroup,
        percentages
      });
    }
  };

  const resetCalculator = () => {
    setAge('');
    setGender('');
    setFitnessLevel('');
    setResult(null);
  };

  const getFormulaDescription = (formula: string) => {
    const descriptions = {
      traditional: 'Widely used but less accurate for all populations',
      tanaka: 'More accurate than traditional, especially for adults',
      gulati: 'Specifically developed for women, more accurate than traditional',
      nes: 'Best for active individuals and athletes',
      roppeLynch: 'Alternative formula for women'
    };
    return descriptions[formula as keyof typeof descriptions] || '';
  };

  return (
    <>
      <Helmet>
        <title>Max Heart Rate Calculator - Calculate Maximum Heart Rate | DapsiWow</title>
        <meta name="description" content="Calculate your maximum heart rate using multiple formulas. Get accurate max heart rate calculations based on age, gender, and fitness level for optimal training." />
        <meta name="keywords" content="max heart rate calculator, maximum heart rate formula, heart rate training, cardio fitness, age-predicted heart rate, HRmax calculator" />
        <meta property="og:title" content="Max Heart Rate Calculator - Calculate Maximum Heart Rate | DapsiWow" />
        <meta property="og:description" content="Calculate your maximum heart rate using scientifically-proven formulas. Perfect for fitness training and cardiovascular health." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/max-heart-rate-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-max-heart-rate-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Max Heart Rate Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your maximum heart rate using multiple scientific formulas for accurate training zones
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
                      
                      {/* Age */}
                      <div className="space-y-3">
                        <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                          Age (years) *
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="30"
                          min="15"
                          max="100"
                          data-testid="input-age"
                        />
                        <p className="text-xs text-gray-500">
                          Enter your current age to calculate maximum heart rate
                        </p>
                      </div>

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender <span className="text-gray-400 font-normal">- Optional but recommended</span>
                        </Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Gender helps select the most accurate formula for your maximum heart rate
                        </p>
                      </div>

                      {/* Fitness Level */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Fitness Level <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-fitness-level">
                            <SelectValue placeholder="Select fitness level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary - Little to no exercise</SelectItem>
                            <SelectItem value="beginner">Beginner - Light exercise occasionally</SelectItem>
                            <SelectItem value="intermediate">Intermediate - Regular exercise 2-4 times/week</SelectItem>
                            <SelectItem value="advanced">Advanced - Intense exercise 5+ times/week</SelectItem>
                            <SelectItem value="athlete">Athlete - Professional/competitive training</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Your fitness level helps determine which formula is most appropriate
                        </p>
                      </div>

                      {/* Information Box */}
                      <div className="bg-blue-50 rounded-lg p-4 mt-6">
                        <h3 className="font-semibold text-blue-900 mb-2">About Maximum Heart Rate</h3>
                        <p className="text-sm text-blue-700">
                          Maximum heart rate is the highest number of beats per minute your heart can achieve during maximum physical exertion. 
                          It's used to calculate training zones for optimal cardiovascular fitness.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateMaxHeartRate}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Max Heart Rate
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Max Heart Rate Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="max-heart-rate-results">
                          {/* Recommended Max HR */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-700">Recommended Max HR</span>
                              <span className="text-2xl font-bold text-green-600" data-testid="text-recommended-max-hr">
                                {result.recommended} bpm
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{result.recommendedFormula}</p>
                            <p className="text-xs text-gray-500 mt-1">Age Group: {result.ageGroup}</p>
                          </div>

                          {/* All Formula Results */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">All Formula Results</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <div>
                                  <span className="font-medium">Traditional Formula</span>
                                  <p className="text-xs text-gray-500">220 - age</p>
                                </div>
                                <span className="font-medium" data-testid="text-traditional-result">
                                  {result.traditional} bpm
                                </span>
                              </div>
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <div>
                                  <span className="font-medium">Tanaka Formula</span>
                                  <p className="text-xs text-gray-500">208 - (0.7 × age)</p>
                                </div>
                                <span className="font-medium" data-testid="text-tanaka-result">
                                  {result.tanaka} bpm
                                </span>
                              </div>
                              {result.gulati && (
                                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                  <div>
                                    <span className="font-medium">Gulati Formula (Women)</span>
                                    <p className="text-xs text-gray-500">206 - (0.88 × age)</p>
                                  </div>
                                  <span className="font-medium" data-testid="text-gulati-result">
                                    {result.gulati} bpm
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <div>
                                  <span className="font-medium">Nes Formula</span>
                                  <p className="text-xs text-gray-500">211 - (0.64 × age)</p>
                                </div>
                                <span className="font-medium" data-testid="text-nes-result">
                                  {result.nes} bpm
                                </span>
                              </div>
                              {result.roppeLynch && (
                                <div className="flex justify-between items-center py-1">
                                  <div>
                                    <span className="font-medium">Roppe-Lynch Formula (Women)</span>
                                    <p className="text-xs text-gray-500">209 - (0.7 × age)</p>
                                  </div>
                                  <span className="font-medium" data-testid="text-roppe-lynch-result">
                                    {result.roppeLynch} bpm
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Heart Rate Percentages */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Training Intensity Percentages</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">50% (Very Light)</span>
                                <span className="font-medium" data-testid="text-fifty-percent">
                                  {result.percentages.fifty} bpm
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">60% (Light)</span>
                                <span className="font-medium" data-testid="text-sixty-percent">
                                  {result.percentages.sixty} bpm
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">70% (Moderate)</span>
                                <span className="font-medium" data-testid="text-seventy-percent">
                                  {result.percentages.seventy} bpm
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">80% (Hard)</span>
                                <span className="font-medium" data-testid="text-eighty-percent">
                                  {result.percentages.eighty} bpm
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">90% (Very Hard)</span>
                                <span className="font-medium" data-testid="text-ninety-percent">
                                  {result.percentages.ninety} bpm
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Accuracy Note */}
                          <div className="bg-orange-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Formula Accuracy</h3>
                            <p className="text-sm text-orange-700">
                              For the most accurate maximum heart rate, consider a professionally supervised exercise test. 
                              These formulas provide estimates that work well for most people but individual variation exists.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your age to calculate maximum heart rate</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Max Heart Rate Formulas */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Maximum Heart Rate Formulas</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Different Formulas?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Different formulas have been developed over the years as researchers discovered that the traditional 
                        "220 minus age" formula isn't accurate for everyone. Newer formulas consider factors like gender, 
                        fitness level, and age-specific variations.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Formula Recommendations</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• <strong>Women:</strong> Gulati formula (206 - 0.88 × age)</li>
                        <li>• <strong>Athletes:</strong> Nes formula (211 - 0.64 × age)</li>
                        <li>• <strong>General population:</strong> Tanaka formula (208 - 0.7 × age)</li>
                        <li>• <strong>Quick estimate:</strong> Traditional formula (220 - age)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Formula Accuracy</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Tanaka Formula</div>
                            <div className="text-sm text-gray-600">Most accurate for general population</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Gulati Formula</div>
                            <div className="text-sm text-gray-600">Specifically developed for women</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Nes Formula</div>
                            <div className="text-sm text-gray-600">Best for active individuals and athletes</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Traditional Formula</div>
                            <div className="text-sm text-gray-600">Widely used but less accurate</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Using Max Heart Rate */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Use Your Maximum Heart Rate</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Applications</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Calculate target heart rate zones for different intensities</li>
                        <li>• Monitor exercise intensity during workouts</li>
                        <li>• Set appropriate training loads for fitness goals</li>
                        <li>• Track cardiovascular fitness improvements over time</li>
                        <li>• Prevent overtraining by staying within safe limits</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Notes</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Maximum heart rate naturally decreases with age</li>
                        <li>• Individual variation can be ±10-12 beats per minute</li>
                        <li>• Medications can affect heart rate response</li>
                        <li>• Environmental factors (heat, altitude) influence heart rate</li>
                        <li>• Exercise testing provides the most accurate measurement</li>
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

export default MaxHeartRateCalculator;