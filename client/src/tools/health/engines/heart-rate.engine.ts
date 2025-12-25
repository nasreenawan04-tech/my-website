import { HealthToolResult, Gender } from '@/types/health-tool.types';

/**
 * Heart rate zone with intensity level
 */
export interface HeartRateZone {
  min: number;
  max: number;
  name: string;
  description: string;
}

/**
 * Target heart rate ranges for different activities
 */
export interface TargetHeartRates {
  fatBurn: { min: number; max: number };
  cardio: { min: number; max: number };
  peak: { min: number; max: number };
}

/**
 * Heart rate calculator input configuration
 */
export interface HeartRateCalculatorInput {
  age: string | number;
  restingHeartRate: string | number;
  gender: Gender;
  formula: 'traditional' | 'tanaka' | 'gulati' | 'nes';
}

/**
 * Heart rate calculator result/output
 */
export interface HeartRateResult extends HealthToolResult {
  maxHeartRate: number;
  restingHeartRate: number;
  zones: {
    zone1: HeartRateZone;
    zone2: HeartRateZone;
    zone3: HeartRateZone;
    zone4: HeartRateZone;
    zone5: HeartRateZone;
  };
  targetHeartRates: TargetHeartRates;
  formula: string;
}

/**
 * Generic function type for heart rate calculator
 */
export type HeartRateCalculatorFunction<T = HeartRateResult> = (
  input: HeartRateCalculatorInput
) => T;

/**
 * Validates heart rate calculator inputs
 */
function isValidHeartRateInputs(input: Partial<HeartRateCalculatorInput>): boolean {
  if (!input.age || !input.restingHeartRate || !input.gender || !input.formula) {
    return false;
  }
  const age = parseFloat(String(input.age));
  const rhr = parseFloat(String(input.restingHeartRate));
  
  return age >= 15 && age <= 100 && rhr >= 40 && rhr <= 120;
}

/**
 * Parses and validates heart rate calculator input from form data
 */
function parseHeartRateInput(input: Partial<HeartRateCalculatorInput>): HeartRateCalculatorInput | null {
  if (!isValidHeartRateInputs(input)) {
    return null;
  }
  
  return {
    age: parseFloat(String(input.age)),
    restingHeartRate: parseFloat(String(input.restingHeartRate)),
    gender: input.gender || 'male',
    formula: input.formula || 'tanaka'
  };
}

/**
 * Calculates maximum heart rate based on selected formula
 */
function calculateMaxHeartRate(age: number, gender: Gender, formula: string): { maxHR: number; formulaName: string } {
  let maxHR: number;
  let formulaName: string;

  switch (formula) {
    case 'tanaka':
      maxHR = 208 - (0.7 * age);
      formulaName = 'Tanaka Formula';
      break;
    case 'gulati':
      if (gender === 'female') {
        maxHR = 206 - (0.88 * age);
        formulaName = 'Gulati Formula (Women)';
      } else {
        maxHR = 220 - age;
        formulaName = 'Traditional Formula';
      }
      break;
    case 'nes':
      maxHR = 211 - (0.64 * age);
      formulaName = 'Nes Formula';
      break;
    default: // traditional
      maxHR = 220 - age;
      formulaName = 'Traditional Formula';
  }

  return { maxHR, formulaName };
}

/**
 * Calculates heart rate zones using Karvonen method
 */
function calculateHeartRateZones(maxHR: number, restingHR: number): HeartRateResult['zones'] {
  const heartRateReserve = maxHR - restingHR;

  return {
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
}

/**
 * Calculates target heart rates for different activities
 */
function calculateTargetHeartRates(maxHR: number): TargetHeartRates {
  return {
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
}

/**
 * Calculates heart rate zones and training targets
 * @param input - Heart rate calculator input with age, resting HR, gender, and formula
 * @returns Heart rate zones and training targets
 */
export const calculateHeartRate: HeartRateCalculatorFunction = (input: HeartRateCalculatorInput): HeartRateResult => {
  const ageNum = parseFloat(String(input.age));
  const restingHR = parseFloat(String(input.restingHeartRate)) || 70;

  const { maxHR, formulaName } = calculateMaxHeartRate(ageNum, input.gender, input.formula);
  const zones = calculateHeartRateZones(maxHR, restingHR);
  const targetHeartRates = calculateTargetHeartRates(maxHR);

  return {
    maxHeartRate: Math.round(maxHR),
    restingHeartRate: restingHR,
    zones,
    targetHeartRates,
    formula: formulaName
  };
};

export { isValidHeartRateInputs, parseHeartRateInput };
