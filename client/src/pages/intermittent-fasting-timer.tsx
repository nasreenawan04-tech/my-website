import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface FastingSchedule {
  id: string;
  name: string;
  fastingHours: number;
  eatingHours: number;
  description: string;
}

const fastingSchedules: FastingSchedule[] = [
  { id: '16:8', name: '16:8', fastingHours: 16, eatingHours: 8, description: 'Fast for 16 hours, eat in 8-hour window' },
  { id: '18:6', name: '18:6', fastingHours: 18, eatingHours: 6, description: 'Fast for 18 hours, eat in 6-hour window' },
  { id: '20:4', name: '20:4', fastingHours: 20, eatingHours: 4, description: 'Fast for 20 hours, eat in 4-hour window' },
  { id: '14:10', name: '14:10', fastingHours: 14, eatingHours: 10, description: 'Fast for 14 hours, eat in 10-hour window' },
  { id: '12:12', name: '12:12', fastingHours: 12, eatingHours: 12, description: 'Fast for 12 hours, eat in 12-hour window' },
  { id: '24:0', name: '24:0 (OMAD)', fastingHours: 24, eatingHours: 0, description: 'One meal a day - 24 hour fast' }
];

const IntermittentFastingTimer = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'fasting' | 'eating' | 'idle'>('idle');
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Switch to next phase
            if (currentPhase === 'fasting') {
              const schedule = fastingSchedules.find(s => s.id === selectedSchedule);
              if (schedule && schedule.eatingHours > 0) {
                setCurrentPhase('eating');
                setTimeRemaining(schedule.eatingHours * 3600);
                setIsRunning(true);
              } else {
                setCurrentPhase('idle');
              }
            } else {
              setCurrentPhase('idle');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentPhase, selectedSchedule]);

  const startFasting = () => {
    const schedule = fastingSchedules.find(s => s.id === selectedSchedule);
    if (schedule) {
      setTimeRemaining(schedule.fastingHours * 3600);
      setCurrentPhase('fasting');
      setIsRunning(true);
      setStartTime(new Date());
    }
  };

  const pauseTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setCurrentPhase('idle');
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const schedule = fastingSchedules.find(s => s.id === selectedSchedule);
    if (!schedule) return 0;
    
    const totalTime = currentPhase === 'fasting' ? schedule.fastingHours * 3600 : schedule.eatingHours * 3600;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  return (
    <>
      <Helmet>
        <title>Intermittent Fasting Timer - Track Your Fasting Schedule | DapsiWow</title>
        <meta name="description" content="Free intermittent fasting timer to track your fasting and eating windows. Supports 16:8, 18:6, 20:4, OMAD and custom schedules worldwide." />
        <meta name="keywords" content="intermittent fasting timer, fasting tracker, 16:8 timer, eating window timer, OMAD timer, fasting schedule" />
        <meta property="og:title" content="Intermittent Fasting Timer - Track Your Fasting Schedule | DapsiWow" />
        <meta property="og:description" content="Free intermittent fasting timer to track your fasting and eating windows with popular schedules." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/tools/intermittent-fasting-timer" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-fasting-timer">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="text-white py-16" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-clock text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="text-page-title">
                Intermittent Fasting Timer
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Track your fasting and eating windows with precision for optimal health and weight management
              </p>
            </div>
          </section>

          {/* Timer Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Control Section */}
                    <div className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Fasting Schedule</h2>
                      
                      {/* Fasting Schedule Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Choose Fasting Method
                        </Label>
                        <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                          <SelectTrigger className="h-12 border-gray-200 rounded-lg" data-testid="select-schedule">
                            <SelectValue placeholder="Select fasting schedule" />
                          </SelectTrigger>
                          <SelectContent>
                            {fastingSchedules.map(schedule => (
                              <SelectItem key={schedule.id} value={schedule.id}>
                                {schedule.name} - {schedule.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedSchedule && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">Selected Schedule</h3>
                          <p className="text-sm text-gray-600">
                            {fastingSchedules.find(s => s.id === selectedSchedule)?.description}
                          </p>
                        </div>
                      )}

                      {/* Timer Controls */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={startFasting}
                          disabled={!selectedSchedule || currentPhase !== 'idle'}
                          className="flex-1 h-12 text-white font-medium rounded-lg"
                          style={{ backgroundColor: '#f43f5e' }}
                          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#e11d48')}
                          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#f43f5e')}
                          data-testid="button-start-fasting"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Fasting
                        </Button>
                        
                        <Button
                          onClick={pauseTimer}
                          disabled={currentPhase === 'idle'}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-pause"
                        >
                          {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {isRunning ? 'Pause' : 'Resume'}
                        </Button>
                        
                        <Button
                          onClick={resetTimer}
                          disabled={currentPhase === 'idle'}
                          variant="outline"
                          className="h-12 px-8 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                          data-testid="button-reset"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Timer Display Section */}
                    <div className="bg-gray-50 rounded-xl p-8">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Timer Status</h2>
                      
                      {currentPhase === 'idle' ? (
                        <div className="text-center py-8" data-testid="timer-idle">
                          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Select a schedule and start your fasting journey</p>
                        </div>
                      ) : (
                        <div className="space-y-6" data-testid="timer-active">
                          {/* Current Phase */}
                          <div className="text-center">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                              currentPhase === 'fasting' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`} data-testid="current-phase">
                              {currentPhase === 'fasting' ? 'Fasting Period' : 'Eating Window'}
                            </div>
                          </div>

                          {/* Timer Display */}
                          <div className="text-center">
                            <div className="text-6xl font-mono font-bold text-gray-900 mb-2" data-testid="timer-display">
                              {formatTime(timeRemaining)}
                            </div>
                            <p className="text-gray-500">
                              {currentPhase === 'fasting' ? 'Time remaining in fast' : 'Time remaining in eating window'}
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ${
                                currentPhase === 'fasting' ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${getProgress()}%` }}
                              data-testid="progress-bar"
                            ></div>
                          </div>

                          {/* Session Info */}
                          {startTime && (
                            <div className="bg-white rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-2">Session Started</h3>
                              <p className="text-sm text-gray-600" data-testid="start-time">
                                {startTime.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Content */}
              <div className="mt-12 space-y-8">
                {/* What is Intermittent Fasting */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Understanding Intermittent Fasting</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What is Intermittent Fasting?</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating. 
                        It doesn't specify which foods to eat, but rather when you should eat them. 
                        During fasting periods, you eat either very little or nothing at all.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Fasting Methods</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>16:8 Method</span>
                          <span className="text-blue-600 font-medium">Most popular for beginners</span>
                        </div>
                        <div className="flex justify-between">
                          <span>18:6 Method</span>
                          <span className="text-orange-600 font-medium">Intermediate level</span>
                        </div>
                        <div className="flex justify-between">
                          <span>20:4 Method</span>
                          <span className="text-red-600 font-medium">Advanced fasters</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OMAD (24:0)</span>
                          <span className="text-purple-600 font-medium">Expert level</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Health Benefits</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Weight Loss</div>
                            <div className="text-sm text-gray-600">Burns stored body fat effectively</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Improved Metabolism</div>
                            <div className="text-sm text-gray-600">Increases metabolic rate and insulin sensitivity</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Mental Clarity</div>
                            <div className="text-sm text-gray-600">Enhanced focus and cognitive function</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                          <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                          <div>
                            <div className="font-medium">Cellular Repair</div>
                            <div className="text-sm text-gray-600">Activates autophagy for cellular cleanup</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips and Guidelines */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Fasting Tips & Guidelines</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Start with shorter fasting periods (12:12 or 14:10)</li>
                        <li>• Gradually increase fasting duration as you adapt</li>
                        <li>• Stay hydrated with water, herbal tea, and black coffee</li>
                        <li>• Listen to your body and adjust as needed</li>
                        <li>• Plan your eating window around your lifestyle</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">During Fasting</h3>
                      <ul className="text-gray-600 space-y-2 text-sm">
                        <li>• Drink plenty of water throughout the day</li>
                        <li>• Keep busy to distract from hunger pangs</li>
                        <li>• Black coffee and plain tea are usually allowed</li>
                        <li>• Avoid artificial sweeteners during fasting</li>
                        <li>• Get adequate sleep for better results</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-sm text-yellow-800">
                      <strong>Medical Disclaimer:</strong> Consult with a healthcare provider before starting intermittent fasting, 
                      especially if you have medical conditions, are pregnant, breastfeeding, or taking medications.
                    </p>
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

export default IntermittentFastingTimer;