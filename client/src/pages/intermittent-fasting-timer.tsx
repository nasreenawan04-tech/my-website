
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface FastingSchedule {
  id: string;
  name: string;
  fastingHours: number;
  eatingHours: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  benefits: string[];
}

interface FastingSession {
  date: string;
  schedule: string;
  completed: boolean;
  duration: number;
  notes?: string;
}

interface FastingGoal {
  type: 'weight_loss' | 'health' | 'discipline' | 'muscle_gain';
  target: number;
  current: number;
  unit: string;
}

const fastingSchedules: FastingSchedule[] = [
  { 
    id: '12:12', 
    name: '12:12 (Beginner)', 
    fastingHours: 12, 
    eatingHours: 12, 
    description: 'Fast for 12 hours, eat in 12-hour window',
    difficulty: 'Beginner',
    benefits: ['Easy to start', 'Natural eating pattern', 'Better sleep']
  },
  { 
    id: '14:10', 
    name: '14:10 (Beginner)', 
    fastingHours: 14, 
    eatingHours: 10, 
    description: 'Fast for 14 hours, eat in 10-hour window',
    difficulty: 'Beginner',
    benefits: ['Gentle introduction', 'Improved digestion', 'Stable energy']
  },
  { 
    id: '16:8', 
    name: '16:8 (Popular)', 
    fastingHours: 16, 
    eatingHours: 8, 
    description: 'Fast for 16 hours, eat in 8-hour window',
    difficulty: 'Intermediate',
    benefits: ['Weight loss', 'Fat burning', 'Mental clarity', 'Autophagy activation']
  },
  { 
    id: '18:6', 
    name: '18:6 (Advanced)', 
    fastingHours: 18, 
    eatingHours: 6, 
    description: 'Fast for 18 hours, eat in 6-hour window',
    difficulty: 'Advanced',
    benefits: ['Accelerated fat loss', 'Enhanced autophagy', 'Growth hormone boost']
  },
  { 
    id: '20:4', 
    name: '20:4 (Warrior)', 
    fastingHours: 20, 
    eatingHours: 4, 
    description: 'Fast for 20 hours, eat in 4-hour window',
    difficulty: 'Expert',
    benefits: ['Maximum fat burning', 'Cellular regeneration', 'Ketosis enhancement']
  },
  { 
    id: '24:0', 
    name: '24:0 (OMAD)', 
    fastingHours: 24, 
    eatingHours: 0, 
    description: 'One meal a day - 24 hour fast',
    difficulty: 'Expert',
    benefits: ['Ultimate autophagy', 'Maximum calorie restriction', 'Time efficiency']
  },
  { 
    id: 'custom', 
    name: 'Custom Schedule', 
    fastingHours: 0, 
    eatingHours: 0, 
    description: 'Create your own fasting schedule',
    difficulty: 'Beginner',
    benefits: ['Personalized approach', 'Flexible timing', 'Gradual progression']
  }
];

const motivationalMessages = [
  "You're doing great! Stay strong and focused.",
  "Every hour of fasting is an investment in your health.",
  "Your body is switching to fat-burning mode - amazing!",
  "Mental clarity and focus are coming your way.",
  "Remember why you started - you've got this!",
  "Your cells are cleaning themselves through autophagy.",
  "Champions are made through consistency, not perfection.",
  "You're building discipline that will serve you everywhere.",
  "Trust the process - your body knows what to do.",
  "The magic happens outside your comfort zone."
];

const IntermittentFastingTimer = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [customFastingHours, setCustomFastingHours] = useState('');
  const [customEatingHours, setCustomEatingHours] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'fasting' | 'eating' | 'idle'>('idle');
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Enhanced features
  const [fastingStreak, setFastingStreak] = useState(0);
  const [totalFasts, setTotalFasts] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [fastingNotes, setFastingNotes] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [currentMotivation, setCurrentMotivation] = useState('');
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('fastingStreak');
    const savedTotal = localStorage.getItem('totalFasts');
    const savedHistory = localStorage.getItem('fastingHistory');
    
    if (savedStreak) setFastingStreak(parseInt(savedStreak));
    if (savedTotal) setTotalFasts(parseInt(savedTotal));
    if (savedHistory) setFastingHistory(JSON.parse(savedHistory));
    
    // Set random motivational message
    setCurrentMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer completed
            completeFastingPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentPhase, selectedSchedule]);

  const completeFastingPhase = () => {
    setIsRunning(false);
    
    if (currentPhase === 'fasting') {
      // Completed fasting phase
      const schedule = fastingSchedules.find(s => s.id === selectedSchedule) || 
                     { fastingHours: parseInt(customFastingHours), eatingHours: parseInt(customEatingHours) };
      
      if (schedule.eatingHours > 0) {
        setCurrentPhase('eating');
        setTimeRemaining(schedule.eatingHours * 3600);
        setIsRunning(true);
      } else {
        // Completed full fast
        completeFastingSession();
        setCurrentPhase('idle');
      }
      
      if (enableNotifications) {
        playNotificationSound();
        showBrowserNotification("Fasting Complete!", "Great job! Your fasting window is complete.");
      }
      
      // Update motivation message
      setCurrentMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    } else {
      // Completed eating phase
      completeFastingSession();
      setCurrentPhase('idle');
      
      if (enableNotifications) {
        showBrowserNotification("Eating Window Complete!", "Your eating window has ended. Ready for the next fast?");
      }
    }
  };

  const completeFastingSession = () => {
    const newStreak = fastingStreak + 1;
    const newTotal = totalFasts + 1;
    
    setFastingStreak(newStreak);
    setTotalFasts(newTotal);
    
    // Save to localStorage
    localStorage.setItem('fastingStreak', newStreak.toString());
    localStorage.setItem('totalFasts', newTotal.toString());
    
    // Add to history
    const session: FastingSession = {
      date: new Date().toISOString(),
      schedule: selectedSchedule,
      completed: true,
      duration: selectedSchedule === 'custom' ? 
        parseInt(customFastingHours) : 
        (fastingSchedules.find(s => s.id === selectedSchedule)?.fastingHours || 0),
      notes: fastingNotes
    };
    
    const newHistory = [session, ...fastingHistory.slice(0, 9)]; // Keep last 10
    setFastingHistory(newHistory);
    localStorage.setItem('fastingHistory', JSON.stringify(newHistory));
  };

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const startFasting = () => {
    let fastingHours: number, eatingHours: number;
    
    if (selectedSchedule === 'custom') {
      fastingHours = parseInt(customFastingHours);
      eatingHours = parseInt(customEatingHours);
    } else {
      const schedule = fastingSchedules.find(s => s.id === selectedSchedule);
      if (!schedule) return;
      fastingHours = schedule.fastingHours;
      eatingHours = schedule.eatingHours;
    }
    
    if (fastingHours > 0) {
      setTimeRemaining(fastingHours * 3600);
      setCurrentPhase('fasting');
      setIsRunning(true);
      setStartTime(new Date());
      setWaterIntake(0);
      
      // Request notification permission if needed
      requestNotificationPermission();
      
      // Random motivation message
      setCurrentMotivation(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
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
    setWaterIntake(0);
    setFastingNotes('');
  };

  const addWaterIntake = () => {
    setWaterIntake(prev => prev + 1);
  };

  const exportFastingData = () => {
    const data = {
      streak: fastingStreak,
      totalFasts: totalFasts,
      history: fastingHistory
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `fasting-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const shareProgress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Intermittent Fasting Progress',
          text: `I've completed ${totalFasts} fasting sessions with a ${fastingStreak} day streak! Join me in the intermittent fasting journey.`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const text = `I've completed ${totalFasts} fasting sessions with a ${fastingStreak} day streak! Check out this amazing fasting timer: ${window.location.href}`;
      navigator.clipboard.writeText(text);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let totalTime: number;
    
    if (selectedSchedule === 'custom') {
      totalTime = currentPhase === 'fasting' ? parseInt(customFastingHours) * 3600 : parseInt(customEatingHours) * 3600;
    } else {
      const schedule = fastingSchedules.find(s => s.id === selectedSchedule);
      if (!schedule) return 0;
      totalTime = currentPhase === 'fasting' ? schedule.fastingHours * 3600 : schedule.eatingHours * 3600;
    }
    
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-blue-600 bg-blue-100';
      case 'Advanced': return 'text-orange-600 bg-orange-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Intermittent Fasting Timer - Track Your Fasting Schedule | DapsiWow</title>
        <meta name="description" content="Free intermittent fasting timer to track your fasting and eating windows. Supports 16:8, 18:6, 20:4, OMAD and custom schedules with progress tracking and notifications." />
        <meta name="keywords" content="intermittent fasting timer, fasting tracker, 16:8 timer, eating window timer, OMAD timer, fasting schedule, autophagy timer, weight loss timer, health tracker, fasting app" />
        <meta property="og:title" content="Intermittent Fasting Timer - Track Your Fasting Schedule | DapsiWow" />
        <meta property="og:description" content="Free intermittent fasting timer with progress tracking, notifications, and support for all popular fasting schedules." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/intermittent-fasting-timer" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Intermittent Fasting Timer",
            "description": "Free online intermittent fasting timer to track your fasting and eating windows with popular schedules like 16:8, 18:6, 20:4, and OMAD.",
            "url": "https://dapsiwow.com/tools/intermittent-fasting-timer",
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multiple fasting schedules",
              "Progress tracking",
              "Notification alerts",
              "Custom fasting windows",
              "Water intake tracking",
              "Fasting history"
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
                <span className="text-sm font-medium text-blue-700">Professional Fasting Timer</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
                Smart Fasting
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Timer
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Track your intermittent fasting journey with precision timing and progress analytics
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Main Timer Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Input Section */}
                <div className="lg:col-span-2 p-8 lg:p-12 space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Fasting Configuration</h2>
                    <p className="text-gray-600">Select your fasting schedule and track your progress</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Fasting Schedule Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="fasting-schedule" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Fasting Method
                      </Label>
                      <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                        <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl text-lg" data-testid="select-schedule">
                          <SelectValue placeholder="Choose your fasting schedule" />
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

                    {/* Custom Schedule Options */}
                    {selectedSchedule === 'custom' && (
                      <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Custom Schedule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom-fasting" className="text-sm font-medium text-gray-700">
                              Fasting Hours
                            </Label>
                            <Input
                              id="custom-fasting"
                              type="number"
                              value={customFastingHours}
                              onChange={(e) => setCustomFastingHours(e.target.value)}
                              className="h-12 text-base border-2 border-gray-200 rounded-lg"
                              placeholder="16"
                              min="1"
                              max="48"
                              data-testid="input-custom-fasting"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custom-eating" className="text-sm font-medium text-gray-700">
                              Eating Hours
                            </Label>
                            <Input
                              id="custom-eating"
                              type="number"
                              value={customEatingHours}
                              onChange={(e) => setCustomEatingHours(e.target.value)}
                              className="h-12 text-base border-2 border-gray-200 rounded-lg"
                              placeholder="8"
                              min="0"
                              max="24"
                              data-testid="input-custom-eating"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Schedule Details */}
                    {selectedSchedule && selectedSchedule !== 'custom' && (
                      <div className="bg-blue-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Selected Schedule</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            getDifficultyColor(fastingSchedules.find(s => s.id === selectedSchedule)?.difficulty || 'Beginner')
                          }`}>
                            {fastingSchedules.find(s => s.id === selectedSchedule)?.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {fastingSchedules.find(s => s.id === selectedSchedule)?.description}
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-gray-700">Key Benefits:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {fastingSchedules.find(s => s.id === selectedSchedule)?.benefits.map((benefit, index) => (
                              <div key={index} className="text-sm text-gray-600 bg-white rounded-lg px-3 py-2">
                                {benefit}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Water Intake Tracker */}
                    <div className="bg-cyan-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Water Intake Today</h3>
                        <span className="text-2xl font-bold text-cyan-600">{waterIntake}</span>
                      </div>
                      <p className="text-gray-600 mb-4">Stay hydrated during your fast</p>
                      <Button 
                        onClick={addWaterIntake}
                        variant="outline"
                        className="w-full h-12 border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 font-medium rounded-lg"
                        data-testid="button-add-water"
                      >
                        Add Glass of Water
                      </Button>
                    </div>

                    {/* Fasting Notes */}
                    <div className="space-y-3">
                      <Label htmlFor="fasting-notes" className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Fasting Notes
                      </Label>
                      <Textarea
                        id="fasting-notes"
                        value={fastingNotes}
                        onChange={(e) => setFastingNotes(e.target.value)}
                        className="min-h-20 border-2 border-gray-200 rounded-lg text-base"
                        placeholder="How are you feeling? What's motivating you today?"
                        data-testid="textarea-notes"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      onClick={startFasting}
                      disabled={!selectedSchedule || currentPhase !== 'idle' || 
                        (selectedSchedule === 'custom' && (!customFastingHours || !customEatingHours))}
                      className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-start-fasting"
                    >
                      Start Fasting
                    </Button>
                    <Button
                      onClick={pauseTimer}
                      disabled={currentPhase === 'idle'}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-pause"
                    >
                      {isRunning ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      onClick={resetTimer}
                      disabled={currentPhase === 'idle'}
                      variant="outline"
                      className="h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset
                    </Button>
                  </div>

                  {/* Additional Actions */}
                  {(fastingStreak > 0 || totalFasts > 0) && (
                    <div className="flex flex-wrap gap-3 pt-4">
                      <Button
                        onClick={shareProgress}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-share"
                      >
                        Share Progress
                      </Button>
                      <Button
                        onClick={exportFastingData}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        data-testid="button-export"
                      >
                        Export Data
                      </Button>
                    </div>
                  )}
                </div>

                {/* Timer Display Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Timer Status</h2>
                  
                  {currentPhase === 'idle' ? (
                    <div className="space-y-6" data-testid="timer-idle">
                      {/* Stats Display */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600" data-testid="fasting-streak">
                            {fastingStreak}
                          </div>
                          <div className="text-sm text-gray-600">Day Streak</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="total-fasts">
                            {totalFasts}
                          </div>
                          <div className="text-sm text-gray-600">Total Fasts</div>
                        </div>
                      </div>
                      
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <div className="text-3xl font-bold text-gray-400">⏰</div>
                        </div>
                        <p className="text-gray-500 text-lg mb-4">Select a schedule and start your fasting journey</p>
                        {currentMotivation && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                            <p className="text-sm text-blue-800 font-medium">{currentMotivation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6" data-testid="timer-active">
                      {/* Current Phase */}
                      <div className="text-center">
                        <div className={`inline-flex items-center px-6 py-3 rounded-xl text-base font-semibold ${
                          currentPhase === 'fasting' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`} data-testid="current-phase">
                          {currentPhase === 'fasting' ? 'Fasting Period' : 'Eating Window'}
                        </div>
                      </div>

                      {/* Timer Display */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                        <div className="text-5xl font-mono font-bold text-gray-900 text-center mb-2" data-testid="timer-display">
                          {formatTime(timeRemaining)}
                        </div>
                        <p className="text-gray-500 text-center mb-4">
                          {currentPhase === 'fasting' ? 'Time remaining in fast' : 'Time remaining in eating window'}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className={`h-4 rounded-full transition-all duration-1000 ${
                              currentPhase === 'fasting' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}
                            style={{ width: `${getProgress()}%` }}
                            data-testid="progress-bar"
                          ></div>
                        </div>
                      </div>

                      {/* Motivational Message */}
                      {currentMotivation && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                          <p className="text-sm text-purple-800 font-medium text-center">{currentMotivation}</p>
                        </div>
                      )}

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

          {/* Fasting History */}
          {fastingHistory.length > 0 && (
            <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Fasting History</h3>
                <div className="space-y-3">
                  {fastingHistory.slice(0, 5).map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.schedule === 'custom' ? `${session.duration}h Custom` : session.schedule}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {session.completed ? 'Completed' : 'Incomplete'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Content Section */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">What is Intermittent Fasting?</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating. 
                    Unlike traditional diets that focus on what to eat, intermittent fasting focuses on when to eat. 
                    This approach has gained popularity for its potential health benefits and simplicity.
                  </p>
                  <p>
                    Our intermittent fasting timer helps you track your fasting windows with precision, offering support 
                    for popular methods like the 16:8 method, 18:6 approach, 20:4 warrior diet, and OMAD (One Meal A Day). 
                    The timer provides notifications, progress tracking, and motivational support throughout your fasting journey.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Intermittent Fasting</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Weight loss and improved metabolism</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enhanced cellular repair through autophagy</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Improved insulin sensitivity and blood sugar control</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Increased mental clarity and focus</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reduced inflammation and oxidative stress</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Fasting Methods</h3>
                <div className="space-y-4 text-gray-600">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">16:8 Method (Beginner-Friendly)</h4>
                    <p className="text-sm">Fast for 16 hours and eat within an 8-hour window. Perfect for beginners and sustainable long-term.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">18:6 Method (Intermediate)</h4>
                    <p className="text-sm">Extended fasting period of 18 hours with a 6-hour eating window for enhanced benefits.</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">20:4 Warrior Diet (Advanced)</h4>
                    <p className="text-sm">A 20-hour fast with a 4-hour eating window, following ancient warrior eating patterns.</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-800 mb-2">OMAD - One Meal A Day (Expert)</h4>
                    <p className="text-sm">The ultimate fasting challenge with a 24-hour fast and one meal per day.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Use Our Fasting Timer</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Choose from preset schedules or create custom fasting windows</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Track your progress with streak counters and statistics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Receive motivational messages and completion notifications</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Monitor water intake to stay hydrated during fasts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Export your fasting data for personal records</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Science Behind Intermittent Fasting */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">The Science Behind Intermittent Fasting</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Metabolic Changes During Fasting</h4>
                    <p className="text-gray-600">
                      During the fasting state, your body undergoes several metabolic shifts. After 12-16 hours of fasting, 
                      glycogen stores become depleted, and your body begins to burn stored fat for energy through a process 
                      called ketosis. This metabolic flexibility is one of the key benefits of intermittent fasting.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Autophagy Process</h5>
                      <p className="text-sm text-blue-700">
                        Extended fasting periods trigger autophagy, a cellular cleanup process where damaged proteins and 
                        organelles are broken down and recycled, promoting cellular health and longevity.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Hormonal Benefits</h4>
                    <p className="text-gray-600">
                      Intermittent fasting positively affects several key hormones including insulin, growth hormone, 
                      and norepinephrine. These changes contribute to improved fat burning, muscle preservation, 
                      and overall metabolic health.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium text-green-800">Insulin Sensitivity</div>
                          <div className="text-sm text-green-600">Improved glucose metabolism</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                          <div className="font-medium text-purple-800">Growth Hormone</div>
                          <div className="text-sm text-purple-600">Enhanced muscle preservation</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Getting Started Guide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Getting Started with Intermittent Fasting</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-yellow-800 mb-2">Start Gradually</h4>
                      <p className="text-sm text-yellow-700">
                        Begin with a 12:12 schedule and gradually extend your fasting window as your body adapts. 
                        This approach helps minimize side effects and builds sustainable habits.
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-800 mb-2">Stay Hydrated</h4>
                      <p className="text-sm text-blue-700">
                        Drink plenty of water during fasting periods. Black coffee, plain tea, and sparkling water 
                        are also acceptable and can help manage hunger.
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">Listen to Your Body</h4>
                      <p className="text-sm text-green-700">
                        Pay attention to how you feel during fasts. Some initial hunger and fatigue are normal, 
                        but persistent discomfort may indicate the need to adjust your approach.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Fasting Mistakes to Avoid</h3>
                  <div className="space-y-4 text-gray-600">
                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-800 mb-2">Overeating During Eating Windows</h4>
                      <p className="text-sm text-red-700">
                        Don't compensate for fasting by overeating. Focus on nutritious, balanced meals 
                        within your eating window for optimal results.
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <h4 className="font-semibold text-orange-800 mb-2">Ignoring Sleep Quality</h4>
                      <p className="text-sm text-orange-700">
                        Poor sleep can negatively impact fasting benefits. Maintain consistent sleep schedules 
                        and aim for 7-9 hours of quality sleep nightly.
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-800 mb-2">Rushing the Process</h4>
                      <p className="text-sm text-purple-700">
                        Don't jump into extended fasting periods too quickly. Allow 2-4 weeks for adaptation 
                        before increasing fasting duration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What can I drink during fasting?</h4>
                      <p className="text-gray-600 text-sm">
                        Water, black coffee, plain tea, and sparkling water are allowed during fasting periods. 
                        Avoid adding sugar, cream, or artificial sweeteners as they can break your fast.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Will I lose muscle mass while fasting?</h4>
                      <p className="text-gray-600 text-sm">
                        Short-term intermittent fasting typically preserves muscle mass, especially when combined 
                        with adequate protein intake and resistance training during eating windows.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I exercise while fasting?</h4>
                      <p className="text-gray-600 text-sm">
                        Light to moderate exercise is generally safe during fasting. Many people find fasted cardio 
                        particularly effective, but listen to your body and adjust intensity as needed.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How long does it take to see results?</h4>
                      <p className="text-gray-600 text-sm">
                        Initial benefits like improved energy may be noticed within 1-2 weeks. Weight loss and 
                        metabolic improvements typically become apparent after 4-8 weeks of consistent practice.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is intermittent fasting safe for everyone?</h4>
                      <p className="text-gray-600 text-sm">
                        While generally safe for healthy adults, pregnant women, people with diabetes, eating disorders, 
                        or certain medical conditions should consult healthcare providers before starting.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What if I break my fast early?</h4>
                      <p className="text-gray-600 text-sm">
                        Don't worry about occasional early breaks. Consistency over perfection is key. Simply resume 
                        your normal fasting schedule with your next planned fast.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research and Studies */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Research-Backed Benefits of Intermittent Fasting</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-2">3-8%</div>
                    <div className="text-sm text-blue-800 font-medium mb-2">Weight Loss</div>
                    <div className="text-xs text-blue-600">Typical weight reduction over 3-24 weeks</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-2">4-7%</div>
                    <div className="text-sm text-green-800 font-medium mb-2">Belly Fat</div>
                    <div className="text-xs text-green-600">Reduction in harmful visceral fat</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">20-31%</div>
                    <div className="text-sm text-purple-800 font-medium mb-2">Insulin Levels</div>
                    <div className="text-xs text-purple-600">Improvement in insulin sensitivity</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Research Note:</strong> Studies from the New England Journal of Medicine, Nature Reviews, 
                    and other peer-reviewed journals have documented significant health benefits of intermittent fasting 
                    including improved cardiovascular health, brain function, and longevity markers.
                  </p>
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

export default IntermittentFastingTimer;
