
import { 
  HealthToolResult
} from '@/types/health-tool.types';

export interface SleepInput {
  calculationType: string;
  age: string | number;
  wakeupTime?: string;
  bedtime?: string;
  sleepQuality: string;
  lifestyle: string;
  fallAsleepTime: string | number;
}

export interface SleepResult extends HealthToolResult {
  targetSleepHours: number;
  bedtimes: string[];
  wakeupTimes: string[];
  sleepCycles: number;
  sleepQuality: {
    category: string;
    recommendations: string[];
  };
  ageGroup: string;
  optimalSchedule: {
    bedtime: string;
    wakeup: string;
    sleepDuration: string;
  };
  sleepEfficiency: number;
  deepSleepPercentage: number;
  remSleepPercentage: number;
}

/**
 * Generic type for Sleep Calculator
 */
export type SleepCalculatorFunction<T extends SleepResult = SleepResult> = (inputs: SleepInput) => T;

export const getSleepRecommendation = (age: number) => {
  if (age >= 0 && age <= 3) return { min: 11, max: 17, optimal: 14, category: 'Newborn/Infant' };
  if (age >= 4 && age <= 11) return { min: 10, max: 14, optimal: 12, category: 'Toddler/Preschooler' };
  if (age >= 12 && age <= 17) return { min: 9, max: 11, optimal: 10, category: 'School Age/Teen' };
  if (age >= 18 && age <= 25) return { min: 7, max: 9, optimal: 8, category: 'Young Adult' };
  if (age >= 26 && age <= 64) return { min: 7, max: 9, optimal: 8, category: 'Adult' };
  if (age >= 65) return { min: 7, max: 8, optimal: 7.5, category: 'Older Adult' };
  return { min: 7, max: 9, optimal: 8, category: 'Adult' };
};

export const calculateSleepCycles = (hours: number) => {
  return Math.round(hours / 1.5);
};

export const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

export const subtractMinutesFromTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + mins - minutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

export const calculateTimeDifference = (startTime: string, endTime: string): number => {
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  
  let startMinutes = startHours * 60 + startMins;
  let endMinutes = endHours * 60 + endMins;
  
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  
  return (endMinutes - startMinutes) / 60;
};

export const formatDuration = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return `${wholeHours}h`;
  return `${wholeHours}h ${minutes}m`;
};

/**
 * Validates Sleep calculator inputs
 */
export const isValidSleepInputs = (inputs: Partial<SleepInput>): boolean => {
  const { calculationType, age } = inputs;
  if (!calculationType || !age) return false;
  if (calculationType === 'optimal-bedtime' && !inputs.wakeupTime) return false;
  if (calculationType === 'optimal-wakeup' && !inputs.bedtime) return false;
  if (calculationType === 'sleep-analysis' && (!inputs.bedtime || !inputs.wakeupTime)) return false;
  return true;
};

/**
 * Calculates Sleep requirements
 */
export const calculateSleep: SleepCalculatorFunction = (inputs: SleepInput): SleepResult => {
  const { calculationType, age, wakeupTime, bedtime, sleepQuality, lifestyle, fallAsleepTime } = inputs;
  
  const ageNum = Number(age);
  const sleepRec = getSleepRecommendation(ageNum);
  const fallAsleepMinutes = Number(fallAsleepTime);
  let computedBedtimes: string[] = [];
  let computedWakeupTimes: string[] = [];
  let optimalBedtime = '';
  let optimalWakeup = '';
  let actualSleepHours = 0;

  if (calculationType === 'optimal-bedtime' && wakeupTime) {
    const optimalSleepMinutes = sleepRec.optimal * 60 + fallAsleepMinutes;
    optimalBedtime = subtractMinutesFromTime(wakeupTime, optimalSleepMinutes);
    optimalWakeup = wakeupTime;

    const cycles = [4, 5, 6];
    computedBedtimes = cycles.map(cycle => {
      const sleepMinutes = cycle * 90 + fallAsleepMinutes;
      return subtractMinutesFromTime(wakeupTime, sleepMinutes);
    });
  } else if (calculationType === 'optimal-wakeup' && bedtime) {
    optimalBedtime = bedtime;
    const optimalSleepMinutes = sleepRec.optimal * 60;
    optimalWakeup = addMinutesToTime(bedtime, optimalSleepMinutes);

    const cycles = [4, 5, 6];
    computedWakeupTimes = cycles.map(cycle => {
      const sleepMinutes = cycle * 90;
      return addMinutesToTime(bedtime, sleepMinutes);
    });
  } else if (calculationType === 'sleep-analysis' && bedtime && wakeupTime) {
    actualSleepHours = calculateTimeDifference(bedtime, wakeupTime) - (fallAsleepMinutes / 60);
    optimalBedtime = bedtime;
    optimalWakeup = wakeupTime;
  }

  let qualityCategory = 'Good';
  let recommendations: string[] = [];

  if (actualSleepHours > 0) {
    if (actualSleepHours < sleepRec.min) {
      qualityCategory = 'Insufficient';
      recommendations.push(`You're getting ${actualSleepHours.toFixed(1)} hours, but need ${sleepRec.min}-${sleepRec.max} hours`);
      recommendations.push('Consider going to bed earlier or adjusting your wake-up time');
    } else if (actualSleepHours > sleepRec.max) {
      qualityCategory = 'Excessive';
      recommendations.push(`You're getting ${actualSleepHours.toFixed(1)} hours, which may be too much`);
      recommendations.push('Try adjusting your sleep schedule gradually');
    } else {
      qualityCategory = 'Optimal';
      recommendations.push('Your sleep duration is within the recommended range for your age');
    }
  }

  if (lifestyle === 'shift-worker') {
    recommendations.push('Maintain consistent sleep schedule when possible, even on days off');
    recommendations.push('Use blackout curtains and avoid caffeine 6 hours before sleep');
  } else if (lifestyle === 'student') {
    recommendations.push('Prioritize consistent sleep schedule during exam periods');
    recommendations.push('Avoid all-nighters which significantly disrupt sleep cycles');
  } else if (lifestyle === 'parent') {
    recommendations.push('Take short 20-30 minute naps when possible to compensate');
    recommendations.push('Share nighttime duties with partner to ensure adequate rest');
  } else if (lifestyle === 'athlete') {
    recommendations.push('Consider extending sleep during intensive training periods');
    recommendations.push('Focus on sleep quality for optimal recovery and performance');
  }

  recommendations.push('Keep bedroom temperature between 60-67°F (15-19°C)');
  recommendations.push('Avoid electronic devices 1-2 hours before bedtime');
  recommendations.push('Create a consistent, relaxing bedtime routine');
  recommendations.push('Get morning sunlight exposure to regulate circadian rhythm');

  const sleepEfficiency = actualSleepHours > 0 ? Math.min(100, (actualSleepHours / (actualSleepHours + fallAsleepMinutes / 60)) * 100) : 85;
  const deepSleepPercentage = actualSleepHours > 0 ? Math.min(25, Math.max(15, 20 - (Math.abs(actualSleepHours - sleepRec.optimal) * 2))) : 20;
  const remSleepPercentage = actualSleepHours > 0 ? Math.min(25, Math.max(15, 22 - (Math.abs(actualSleepHours - sleepRec.optimal) * 1.5))) : 22;

  return {
    targetSleepHours: sleepRec.optimal,
    bedtimes: computedBedtimes,
    wakeupTimes: computedWakeupTimes,
    sleepCycles: calculateSleepCycles(sleepRec.optimal),
    sleepQuality: {
      category: qualityCategory,
      recommendations
    },
    ageGroup: sleepRec.category,
    optimalSchedule: {
      bedtime: optimalBedtime,
      wakeup: optimalWakeup,
      sleepDuration: formatDuration(actualSleepHours || sleepRec.optimal)
    },
    sleepEfficiency: Math.round(sleepEfficiency),
    deepSleepPercentage: Math.round(deepSleepPercentage),
    remSleepPercentage: Math.round(remSleepPercentage)
  };
};
