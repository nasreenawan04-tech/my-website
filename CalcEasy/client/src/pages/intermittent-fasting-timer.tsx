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
import { Switch } from '@/components/ui/switch';
import { Play, Pause, RotateCcw, Clock, Trophy, Droplets, Target, Bell, BookOpen, Calendar, Share2, Download } from 'lucide-react';

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
  "🔥 You're doing great! Stay strong and focused.",
  "💪 Every hour of fasting is an investment in your health.",
  "🧠 Your body is switching to fat-burning mode - amazing!",
  "⚡ Mental clarity and focus are coming your way.",
  "🎯 Remember why you started - you've got this!",
  "🌟 Your cells are cleaning themselves through autophagy.",
  "🏆 Champions are made through consistency, not perfection.",
  "💎 You're building discipline that will serve you everywhere.",
  "🔮 Trust the process - your body knows what to do.",
  "🎪 The magic happens outside your comfort zone."
];

const breakingFastMeals = [
  "🥗 Light salad with lean protein and healthy fats",
  "🥑 Avocado toast with eggs and vegetables",
  "🍲 Bone broth with steamed vegetables",
  "🐟 Grilled salmon with quinoa and greens",
  "🥜 Greek yogurt with nuts and berries",
  "🍳 Scrambled eggs with spinach and mushrooms",
  "🥙 Hummus wrap with fresh vegetables",
  "🍵 Green smoothie with protein powder"
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
  const [fastingGoal, setFastingGoal] = useState<FastingGoal>({ type: 'weight_loss', target: 10, current: 0, unit: 'kg' });
  const [waterIntake, setWaterIntake] = useState(0);
  const [fastingNotes, setFastingNotes] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableWaterReminders, setEnableWaterReminders] = useState(true);
  const [currentMotivation, setCurrentMotivation] = useState('');
  const [fastingHistory, setFastingHistory] = useState<FastingSession[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('fastingStreak');
    const savedTotal = localStorage.getItem('totalFasts');
    const savedGoal = localStorage.getItem('fastingGoal');
    const savedHistory = localStorage.getItem('fastingHistory');
    
    if (savedStreak) setFastingStreak(parseInt(savedStreak));
    if (savedTotal) setTotalFasts(parseInt(savedTotal));
    if (savedGoal) setFastingGoal(JSON.parse(savedGoal));
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

  // Water reminder notifications
  useEffect(() => {
    if (enableWaterReminders && currentPhase === 'fasting') {
      const interval = setInterval(() => {
        if (enableNotifications) {
          playNotificationSound();
        }
      }, 3600000); // Every hour
      return () => clearInterval(interval);
    }
  }, [enableWaterReminders, currentPhase, enableNotifications]);

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
      goal: fastingGoal,
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
          text: `🎉 I've completed ${totalFasts} fasting sessions with a ${fastingStreak} day streak! Join me in the intermittent fasting journey.`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const text = `🎉 I've completed ${totalFasts} fasting sessions with a ${fastingStreak} day streak! Check out this amazing fasting timer: ${window.location.href}`;
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

  const getCurrentSchedule = () => {
    if (selectedSchedule === 'custom') {
      return { fastingHours: parseInt(customFastingHours), eatingHours: parseInt(customEatingHours) };
    }
    return fastingSchedules.find(s => s.id === selectedSchedule);
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

          {/* Fasting Stats Section */}
          <section className="py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Fasting Streak */}
                <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold" data-testid="fasting-streak">{fastingStreak}</div>
                    <div className="text-sm opacity-90">Day Streak</div>
                  </CardContent>
                </Card>

                {/* Total Fasts */}
                <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold" data-testid="total-fasts">{totalFasts}</div>
                    <div className="text-sm opacity-90">Total Fasts</div>
                  </CardContent>
                </Card>

                {/* Water Intake */}
                <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg">
                  <CardContent className="p-6 text-center">
                    <Droplets className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold" data-testid="water-intake">{waterIntake}</div>
                    <div className="text-sm opacity-90">Glasses Today</div>
                    <Button 
                      onClick={addWaterIntake}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white hover:bg-opacity-20 mt-2"
                      data-testid="button-add-water"
                    >
                      +1 Glass
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Timer Section */}
          <section className="py-8">
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

                      {/* Custom Schedule Options */}
                      {selectedSchedule === 'custom' && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold text-gray-900">Custom Schedule</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="custom-fasting" className="text-sm font-medium text-gray-700">
                                Fasting Hours
                              </Label>
                              <Input
                                id="custom-fasting"
                                type="number"
                                value={customFastingHours}
                                onChange={(e) => setCustomFastingHours(e.target.value)}
                                className="h-12 text-base border-gray-200 rounded-lg"
                                placeholder="16"
                                min="1"
                                max="48"
                                data-testid="input-custom-fasting"
                              />
                            </div>
                            <div>
                              <Label htmlFor="custom-eating" className="text-sm font-medium text-gray-700">
                                Eating Hours
                              </Label>
                              <Input
                                id="custom-eating"
                                type="number"
                                value={customEatingHours}
                                onChange={(e) => setCustomEatingHours(e.target.value)}
                                className="h-12 text-base border-gray-200 rounded-lg"
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
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Selected Schedule</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              getDifficultyColor(fastingSchedules.find(s => s.id === selectedSchedule)?.difficulty || 'Beginner')
                            }`}>
                              {fastingSchedules.find(s => s.id === selectedSchedule)?.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {fastingSchedules.find(s => s.id === selectedSchedule)?.description}
                          </p>
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-700">Key Benefits:</div>
                            {fastingSchedules.find(s => s.id === selectedSchedule)?.benefits.map((benefit, index) => (
                              <div key={index} className="text-xs text-gray-600">• {benefit}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Advanced Options Toggle */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="advanced-options" className="text-sm font-medium text-gray-700">
                          Advanced Options
                        </Label>
                        <Switch
                          id="advanced-options"
                          checked={showAdvancedOptions}
                          onCheckedChange={setShowAdvancedOptions}
                          data-testid="switch-advanced-options"
                        />
                      </div>

                      {/* Advanced Options */}
                      {showAdvancedOptions && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="enable-notifications" className="text-sm font-medium text-gray-700">
                              <Bell className="w-4 h-4 inline mr-2" />
                              Enable Notifications
                            </Label>
                            <Switch
                              id="enable-notifications"
                              checked={enableNotifications}
                              onCheckedChange={setEnableNotifications}
                              data-testid="switch-notifications"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="water-reminders" className="text-sm font-medium text-gray-700">
                              <Droplets className="w-4 h-4 inline mr-2" />
                              Water Reminders
                            </Label>
                            <Switch
                              id="water-reminders"
                              checked={enableWaterReminders}
                              onCheckedChange={setEnableWaterReminders}
                              data-testid="switch-water-reminders"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fasting-notes" className="text-sm font-medium text-gray-700">
                              <BookOpen className="w-4 h-4 inline mr-2" />
                              Fasting Notes
                            </Label>
                            <Textarea
                              id="fasting-notes"
                              value={fastingNotes}
                              onChange={(e) => setFastingNotes(e.target.value)}
                              className="min-h-20 border-gray-200 rounded-lg"
                              placeholder="How are you feeling? What's motivating you today?"
                              data-testid="textarea-notes"
                            />
                          </div>
                        </div>
                      )}

                      {/* Timer Controls */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          onClick={startFasting}
                          disabled={!selectedSchedule || currentPhase !== 'idle' || 
                            (selectedSchedule === 'custom' && (!customFastingHours || !customEatingHours))}
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
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900">Timer Status</h2>
                        <div className="flex gap-2">
                          <Button
                            onClick={shareProgress}
                            variant="outline"
                            size="sm"
                            className="border-gray-200"
                            data-testid="button-share"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                          <Button
                            onClick={exportFastingData}
                            variant="outline"
                            size="sm"
                            className="border-gray-200"
                            data-testid="button-export"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                      
                      {currentPhase === 'idle' ? (
                        <div className="text-center py-8" data-testid="timer-idle">
                          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">Select a schedule and start your fasting journey</p>
                          {currentMotivation && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                              <p className="text-sm text-blue-800 font-medium">{currentMotivation}</p>
                            </div>
                          )}
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
                            <p className="text-gray-500 mb-4">
                              {currentPhase === 'fasting' ? 'Time remaining in fast' : 'Time remaining in eating window'}
                            </p>
                          </div>

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
                              <p className="text-sm text-gray-600 mb-2" data-testid="start-time">
                                {startTime.toLocaleString()}
                              </p>
                              {currentPhase === 'eating' && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Breaking Fast Suggestions:</h4>
                                  <div className="text-xs text-gray-600">
                                    {breakingFastMeals[Math.floor(Math.random() * breakingFastMeals.length)]}
                                  </div>
                                </div>
                              )}
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
                <Card className="mt-8 bg-white shadow-sm border-0">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900">Recent Fasting History</h2>
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {fastingHistory.slice(0, 5).map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
            </div>
          </section>

          {/* Educational Content */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-8">
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