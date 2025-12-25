
/**
 * Body Fat Calculator Engine - US Navy Method
 */
import { 
  HealthCalculatorInput, 
  Gender, 
  UnitSystem,
  HealthToolResult
} from '@/types/health-tool.types';

export interface BodyFatInput extends HealthCalculatorInput {
  neck: string | number;
  waist: string | number;
  hip?: string | number;
}

export interface BodyFatResult extends HealthToolResult {
  bodyFatPercentage: number;
  classification: string;
  leanBodyMass: number;
  fatMass: number;
  method: string;
}

/**
 * Generic type for Body Fat Calculator
 */
export type BodyFatCalculatorFunction<T extends BodyFatResult = BodyFatResult> = (inputs: BodyFatInput) => T;

/**
 * Validates Body Fat calculator inputs
 */
export const isValidBodyFatInputs = (inputs: Partial<BodyFatInput>): boolean => {
  const { weight, height, neck, waist, gender, unitSystem } = inputs;
  if (!unitSystem || !gender || !weight || !height || !neck || !waist) return false;
  if (gender === 'female' && !inputs.hip) return false;
  return true;
};

/**
 * Calculates Body Fat percentage
 */
export const calculateBodyFat: BodyFatCalculatorFunction = (inputs: BodyFatInput): BodyFatResult => {
  const { weight, height, neck, waist, hip, gender, unitSystem, age } = inputs;
  
  let weightKg: number;
  let heightCm: number;
  let neckCm: number;
  let waistCm: number;
  let hipCm: number = 0;

  if (unitSystem === 'metric') {
    weightKg = Number(weight);
    heightCm = Number(height);
    neckCm = Number(neck);
    waistCm = Number(waist);
    hipCm = Number(hip ?? 0);
  } else {
    weightKg = Number(weight) * 0.453592;
    const totalInches = (Number(inputs.feet ?? 0) * 12) + Number(inputs.inches ?? 0);
    heightCm = totalInches * 2.54;
    neckCm = Number(neck) * 2.54;
    waistCm = Number(waist) * 2.54;
    hipCm = Number(hip ?? 0) * 2.54;
  }

  let bodyFatPercentage: number;
  
  if (gender === 'male') {
    bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 450;
  }

  bodyFatPercentage = Math.max(3, Math.min(50, bodyFatPercentage));

  const getClassification = (bf: number, gender: Gender, ageYears: number) => {
    const ageNum = ageYears || 30;
    if (gender === 'male') {
      if (ageNum <= 30) {
        if (bf < 8) return 'Essential Fat';
        if (bf < 14) return 'Athletes';
        if (bf < 18) return 'Fitness';
        if (bf < 25) return 'Average';
        return 'Obese';
      } else if (ageNum <= 50) {
        if (bf < 8) return 'Essential Fat';
        if (bf < 17) return 'Athletes';
        if (bf < 21) return 'Fitness';
        if (bf < 28) return 'Average';
        return 'Obese';
      } else {
        if (bf < 8) return 'Essential Fat';
        if (bf < 19) return 'Athletes';
        if (bf < 23) return 'Fitness';
        if (bf < 30) return 'Average';
        return 'Obese';
      }
    } else {
      if (ageNum <= 30) {
        if (bf < 14) return 'Essential Fat';
        if (bf < 21) return 'Athletes';
        if (bf < 25) return 'Fitness';
        if (bf < 32) return 'Average';
        return 'Obese';
      } else if (ageNum <= 50) {
        if (bf < 14) return 'Essential Fat';
        if (bf < 24) return 'Athletes';
        if (bf < 28) return 'Fitness';
        if (bf < 35) return 'Average';
        return 'Obese';
      } else {
        if (bf < 14) return 'Essential Fat';
        if (bf < 26) return 'Athletes';
        if (bf < 30) return 'Fitness';
        if (bf < 37) return 'Average';
        return 'Obese';
      }
    }
  };

  const classification = getClassification(bodyFatPercentage, gender, Number(age));
  const fatMass = (bodyFatPercentage / 100) * weightKg;
  const leanBodyMass = weightKg - fatMass;

  return {
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
    classification,
    leanBodyMass: Math.round(leanBodyMass * 10) / 10,
    fatMass: Math.round(fatMass * 10) / 10,
    method: 'US Navy Method'
  };
};
