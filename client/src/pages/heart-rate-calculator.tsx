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
import { Calculator, Heart } from 'lucide-react';

interface HeartRateResult {
  maxHeartRate: number;
  restingHeartRate: number;
  zones: {
    zone1: { min: number; max: number; name: string; description: string };
    zone2: { min: number; max: number; name: string; description: string };
    zone3: { min: number; max: number; name: string; description: string };
    zone4: { min: number; max: number; name: string; description: string };
    zone5: { min: number; max: number; name: string; description: string };
  };
  targetHeartRates: {
    fatBurn: { min: number; max: number };
    cardio: { min: number; max: number };
    peak: { min: number; max: number };
  };
}

const HeartRateCalculator = () => {
  const [age, setAge] = useState('');
  const [restingHeartRate, setRestingHeartRate] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [formula, setFormula] = useState('traditional');
  const [result, setResult] = useState<HeartRateResult | null>(null);

  const calculateHeartRate = () => {
    const ageNum = parseFloat(age);
    const restingHR = parseFloat(restingHeartRate) || 70; // Default resting HR if not provided

    if (ageNum && ageNum >= 15 && ageNum <= 100) {
      let maxHR: number;

      // Calculate maximum heart rate based on selected formula
      switch (formula) {
        case 'tanaka':
          maxHR = 208 - (0.7 * ageNum);
          break;
        case 'gulati':
          if (gender === 'female') {
            maxHR = 206 - (0.88 * ageNum);
          } else {
            maxHR = 220 - ageNum; // Default to traditional for males
          }
          break;
        case 'nes':
          maxHR = 211 - (0.64 * ageNum);
          break;
        default: // traditional
          maxHR = 220 - ageNum;
      }

      // Calculate heart rate zones using Karvonen method (more accurate)
      const heartRateReserve = maxHR - restingHR;

      const zones = {
        zone1: {
          min: Math.round(restingHR + (heartRateReserve * 0.50)),
          max: Math.round(restingHR + (heartRateReserve * 0.60)),
          name: 'Active Recovery',
          description: 'Light activity, fat burning'
        },
        zone2: {
          min: Math.round(restingHR + (heartRateReserve * 0.60)),
          max: Math.round(restingHR + (heartRateReserve * 0.70)),
          name: 'Aerobic Base',
          description: 'Base fitness, fat burning'
        },
        zone3: {
          min: Math.round(restingHR + (heartRateReserve * 0.70)),
          max: Math.round(restingHR + (heartRateReserve * 0.80)),
          name: 'Aerobic Fitness',
          description: 'Cardio fitness improvement'
        },
        zone4: {
          min: Math.round(restingHR + (heartRateReserve * 0.80)),
          max: Math.round(restingHR + (heartRateReserve * 0.90)),
          name: 'Lactate Threshold',
          description: 'High intensity training'
        },
        zone5: {
          min: Math.round(restingHR + (heartRateReserve * 0.90)),
          max: Math.round(maxHR),
          name: 'VO2 Max',
          description: 'Maximum effort training'
        }
      };

      // Calculate target heart rates for different activities
      const targetHeartRates = {
        fatBurn: {
          min: Math.round(maxHR * 0.57),
          max: Math.round(maxHR * 0.67)
        },
        cardio: {
          min: Math.round(maxHR * 0.64),
          max: Math.round(maxHR * 0.76)
        },
        peak: {
          min: Math.round(maxHR * 0.77),
          max: Math.round(maxHR * 0.93)
        }
      };

      setResult({
        maxHeartRate: Math.round(maxHR),
        restingHeartRate: restingHR,
        zones,
        targetHeartRates
      });
    }
  };

  const resetCalculator = () => {
    setAge('');
    setRestingHeartRate('');
    setGender('');
    setFitnessLevel('');
    setFormula('traditional');
    setResult(null);
  };

  const getZoneColor = (zoneNumber: number) => {
    const colors = {
      1: 'text-gray-600',
      2: 'text-blue-600',
      3: 'text-green-600',
      4: 'text-orange-600',
      5: 'text-red-600'
    };
    return colors[zoneNumber as keyof typeof colors] || 'text-gray-600';
  };

  const getZoneBgColor = (zoneNumber: number) => {
    const colors = {
      1: 'bg-gray-50 border-l-gray-500',
      2: 'bg-blue-50 border-l-blue-500',
      3: 'bg-green-50 border-l-green-500',
      4: 'bg-orange-50 border-l-orange-500',
      5: 'bg-red-50 border-l-red-500'
    };
    return colors[zoneNumber as keyof typeof colors] || 'bg-gray-50 border-l-gray-500';
  };

  return (
    <>
      <Helmet>
        <title>Heart Rate Calculator - Target Heart Rate Zones & Training | DapsiWow</title>
        <meta name="description" content="Calculate your target heart rate zones for optimal training. Get personalized heart rate zones for fat burning, cardio, and peak performance based on age and fitness level." />
        <meta name="keywords" content="heart rate calculator, target heart rate zones, cardio training, fat burning heart rate, maximum heart rate, fitness zones" />
        <meta property="og:title" content="Heart Rate Calculator - Target Heart Rate Zones & Training | DapsiWow" />
        <meta property="og:description" content="Calculate your target heart rate zones for optimal training and fitness goals. Professional heart rate zone calculator." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/heart-rate-calculator" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-heart-rate-calculator">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Heart Rate Calculator
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Calculate your target heart rate zones for optimal training, fat burning, and cardiovascular fitness
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
                      </div>

                      {/* Resting Heart Rate */}
                      <div className="space-y-3">
                        <Label htmlFor="restingHeartRate" className="text-sm font-medium text-gray-700">
                          Resting Heart Rate (bpm) <span className="text-gray-400 font-normal">- Optional</span>
                        </Label>
                        <Input
                          id="restingHeartRate"
                          type="number"
                          value={restingHeartRate}
                          onChange={(e) => setRestingHeartRate(e.target.value)}
                          className="h-12 text-base border-gray-200 rounded-lg"
                          placeholder="70"
                          min="40"
                          max="120"
                          data-testid="input-resting-heart-rate"
                        />
                        <p className="text-xs text-gray-500">
                          Measure when you first wake up, before getting out of bed
                        </p>
                      </div>

                      {/* Gender */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Gender <span className="text-gray-400 font-normal">- Optional</span>
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
                      </div>

                      {/* Formula */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Calculation Formula
                        </Label>
                        <RadioGroup 
                          value={formula} 
                          onValueChange={setFormula}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="traditional" id="traditional" data-testid="radio-traditional" />
                            <Label htmlFor="traditional" className="text-sm">Traditional (220 - age)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tanaka" id="tanaka" data-testid="radio-tanaka" />
                            <Label htmlFor="tanaka" className="text-sm">Tanaka (208 - 0.7 × age) - More accurate</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="gulati" id="gulati" data-testid="radio-gulati" />
                            <Label htmlFor="gulati" className="text-sm">Gulati (Women: 206 - 0.88 × age)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nes" id="nes" data-testid="radio-nes" />
                            <Label htmlFor="nes" className="text-sm">Nes (211 - 0.64 × age) - Active individuals</Label>
                          </div>
                        </RadioGroup>
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
                            <SelectItem value="beginner">Beginner - Little to no regular exercise</SelectItem>
                            <SelectItem value="intermediate">Intermediate - Regular exercise 2-4 times/week</SelectItem>
                            <SelectItem value="advanced">Advanced - Intense exercise 5+ times/week</SelectItem>
                            <SelectItem value="athlete">Athlete - Professional/competitive training</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={calculateHeartRate}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f43f5e'}
                          data-testid="button-calculate"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate Heart Rate Zones
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Heart Rate Results</h2>
                      
                      {result ? (
                        <div className="space-y-4" data-testid="heart-rate-results">
                          {/* Max Heart Rate */}
                          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Maximum Heart Rate</span>
                              <span className="text-2xl font-bold text-red-600" data-testid="text-max-heart-rate">
                                {result.maxHeartRate} bpm
                              </span>
                            </div>
                          </div>

                          {/* Resting Heart Rate */}
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Resting Heart Rate</span>
                              <span className="font-semibold text-gray-900" data-testid="text-resting-heart-rate">
                                {result.restingHeartRate} bpm
                              </span>
                            </div>
                          </div>

                          {/* Target Heart Rate Zones */}
                          <div className="bg-white rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Training Heart Rate Zones</h3>
                            <div className="space-y-3">
                              {Object.entries(result.zones).map(([key, zone], index) => (
                                <div key={key} className={`rounded-lg p-3 border-l-4 ${getZoneBgColor(index + 1)}`}>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-gray-900">Zone {index + 1}: {zone.name}</span>
                                    <span className={`font-bold ${getZoneColor(index + 1)}`} data-testid={`text-zone-${index + 1}`}>
                                      {zone.min} - {zone.max} bpm
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">{zone.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Activity-Based Target Zones */}
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Activity-Based Target Zones</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Fat Burning Zone</span>
                                <span className="font-medium" data-testid="text-fat-burn-zone">
                                  {result.targetHeartRates.fatBurn.min} - {result.targetHeartRates.fatBurn.max} bpm
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Cardio Zone</span>
                                <span className="font-medium" data-testid="text-cardio-zone">
                                  {result.targetHeartRates.cardio.min} - {result.targetHeartRates.cardio.max} bpm
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Peak Zone</span>
                                <span className="font-medium" data-testid="text-peak-zone">
                                  {result.targetHeartRates.peak.min} - {result.targetHeartRates.peak.max} bpm
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Training Recommendations */}
                          <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Training Recommendations</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>• <strong>Zone 1-2:</strong> 70-80% of weekly training</p>
                              <p>• <strong>Zone 3:</strong> 10-15% of weekly training</p>
                              <p>• <strong>Zone 4-5:</strong> 5-10% of weekly training</p>
                              <p>• Monitor your heart rate during exercise to stay in target zones</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8" data-testid="no-results">
                          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Enter your age to calculate heart rate zones</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* Understanding Heart Rate Zones */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Heart Rate Training Zones</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What are Heart Rate Zones?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Heart rate zones are ranges of heartbeats per minute that correspond to different exercise intensities. 
                        Training in specific zones helps you achieve different fitness goals, from fat burning to improving 
                        cardiovascular fitness and athletic performance.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use Heart Rate Zones</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Use a heart rate monitor or fitness tracker to stay within your target zones during exercise. 
                        Different zones serve different purposes in your training program.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Zone Benefits</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Zone 1 - Active Recovery</div>
                            <div className="text-sm text-gray-600">Promotes recovery and fat burning</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Zone 2 - Aerobic Base</div>
                            <div className="text-sm text-gray-600">Builds aerobic fitness and endurance</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Zone 3 - Aerobic Fitness</div>
                            <div className="text-sm text-gray-600">Improves cardiovascular efficiency</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Zone 4 - Lactate Threshold</div>
                            <div className="text-sm text-gray-600">Increases lactate tolerance and speed</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-red-50 rounded-lg">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Zone 5 - VO2 Max</div>
                            <div className="text-sm text-gray-600">Maximum oxygen uptake and power</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heart Rate Monitoring Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Heart Rate Training Tips</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Invest in a quality heart rate monitor for accuracy</li>
                        <li>• Start with lower intensity zones if you're a beginner</li>
                        <li>• Gradually increase training intensity over time</li>
                        <li>• Most training should be in Zone 1-2 (80/20 rule)</li>
                        <li>• Allow adequate recovery between high-intensity sessions</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Considerations</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Heart rate can be affected by heat, stress, and caffeine</li>
                        <li>• Some medications can alter heart rate response</li>
                        <li>• Individual variation exists - listen to your body</li>
                        <li>• Combine heart rate training with perceived effort</li>
                        <li>• Consult a doctor before starting intense training</li>
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

export default HeartRateCalculator;