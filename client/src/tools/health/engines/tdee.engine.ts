import { HealthCalculatorInput, HealthToolResult, Gender, ActivityLevel, UnitSystem } from '@/types/health-tool.types';

/**
 * TDEE calculator input configuration
 */
export interface TDEECalculatorInput extends HealthCalculatorInput {
  weight: string | number;
  height: string | number;
  feet?: string | number;
  inches?: string | number;
  age: string | number;
  gender: Gender;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
}

/**
 * Macro nutrient breakdown for TDEE
 */
export interface TDEEMacroBreakdown {
  protein: { grams: number; calories: number };
  carbs: { grams: number; calories: number };
  fats: { grams: number; calories: number };
}

/**
 * Calorie targets for weight loss
 */
export interface WeightLossTargets {
  mild: number;
  moderate: number;
  aggressive: number;
}

/**
 * Calorie targets for weight gain
 */
export interface WeightGainTargets {
  mild: number;
  moderate: number;
}

/**
 * TDEE calculator result/output
 */
export interface TDEEResult extends HealthToolResult {
  bmr: number;
  tdee: number;
  activityFactor: number;
  activityDescription: string;
  caloriesForWeightLoss: WeightLossTargets;
  caloriesForWeightGain: WeightGainTargets;
  macroBreakdown: TDEEMacroBreakdown;
}

/**
 * Generic function type for TDEE calculator
 */
export type TDEECalculatorFunction<T = TDEEResult> = (
  input: TDEECalculatorInput
) => T;

/**
 * Activity multiplier mapping
 */
const ACTIVITY_FACTORS = {
  'sedentary': { factor: 1.2, description: 'Little to no exercise' },
  'lightly-active': { factor: 1.375, description: 'Light exercise 1-3 days/week' },
  'moderately-active': { factor: 1.55, description: 'Moderate exercise 3-5 days/week' },
  'very-active': { factor: 1.725, description: 'Hard exercise 6-7 days/week' },
  'extra-active': { factor: 1.9, description: 'Very hard exercise + physical job' }
};

/**
 * Validates TDEE calculator inputs
 */
function isValidTDEEInputs(input: Partial<TDEECalculatorInput>): boolean {
  if (!input.weight || !input.age || !input.gender || !input.activityLevel || !input.unitSystem) {
    return false;
  }

  const weight = parseFloat(String(input.weight));
  const age = parseFloat(String(input.age));

  if (input.unitSystem === 'metric') {
    if (!input.height) return false;
    const height = parseFloat(String(input.height));
    return weight > 0 && age >= 15 && age <= 120 && height > 0;
  } else {
    if (!input.feet || !input.inches) return false;
    const feet = parseFloat(String(input.feet));
    const inches = parseFloat(String(input.inches));
    return weight > 0 && age >= 15 && age <= 120 && feet >= 0 && inches >= 0;
  }
}

/**
 * Parses and validates TDEE calculator input from form data
 */
function parseTDEEInput(input: Partial<TDEECalculatorInput>): TDEECalculatorInput | null {
  if (!isValidTDEEInputs(input)) {
    return null;
  }

  return {
    weight: parseFloat(String(input.weight)),
    height: input.height ? parseFloat(String(input.height)) : 0,
    feet: input.feet ? parseFloat(String(input.feet)) : undefined,
    inches: input.inches ? parseFloat(String(input.inches)) : undefined,
    age: parseFloat(String(input.age)),
    gender: input.gender || 'male',
    activityLevel: input.activityLevel || 'sedentary',
    unitSystem: input.unitSystem || 'metric'
  };
}

/**
 * Converts weight and height to metric system
 */
function normalizeMetrics(input: TDEECalculatorInput): { weightKg: number; heightCm: number } {
  let weightKg: number;
  let heightCm: number;

  if (input.unitSystem === 'metric') {
    weightKg = parseFloat(String(input.weight));
    heightCm = parseFloat(String(input.height));
  } else {
    weightKg = parseFloat(String(input.weight)) * 0.453592; // Convert lbs to kg
    const feet = parseFloat(String(input.feet || 0));
    const inches = parseFloat(String(input.inches || 0));
    const totalInches = (feet * 12) + inches;
    heightCm = totalInches * 2.54; // Convert inches to cm
  }

  return { weightKg, heightCm };
}

/**
 * Calculates BMR using Mifflin-St Jeor equation
 */
function calculateBMR(weightKg: number, heightCm: number, ageYears: number, gender: Gender): number {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  }
}

/**
 * Calculates macro breakdown for maintenance calories
 */
function calculateMacroBreakdown(tdee: number): TDEEMacroBreakdown {
  return {
    protein: {
      calories: Math.round(tdee * 0.30),
      grams: Math.round((tdee * 0.30) / 4)
    },
    carbs: {
      calories: Math.round(tdee * 0.40),
      grams: Math.round((tdee * 0.40) / 4)
    },
    fats: {
      calories: Math.round(tdee * 0.30),
      grams: Math.round((tdee * 0.30) / 9)
    }
  };
}

/**
 * Calculates TDEE and personalized calorie targets
 * @param input - TDEE calculator input with weight, height, age, gender, and activity level
 * @returns TDEE, BMR, and personalized calorie targets with macro breakdown
 */
export const calculateTDEE: TDEECalculatorFunction = (input: TDEECalculatorInput): TDEEResult => {
  const { weightKg, heightCm } = normalizeMetrics(input);
  const ageYears = parseFloat(String(input.age));

  const bmr = calculateBMR(weightKg, heightCm, ageYears, input.gender);
  const selectedActivity = ACTIVITY_FACTORS[input.activityLevel];
  const tdee = bmr * selectedActivity.factor;

  const caloriesForWeightLoss: WeightLossTargets = {
    mild: tdee - 250,
    moderate: tdee - 500,
    aggressive: tdee - 750
  };

  const caloriesForWeightGain = {
    mild: tdee + 250,
    moderate: tdee + 500
  };

  const macroBreakdown = calculateMacroBreakdown(tdee);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    activityFactor: selectedActivity.factor,
    activityDescription: selectedActivity.description,
    caloriesForWeightLoss: {
      mild: Math.round(caloriesForWeightLoss.mild),
      moderate: Math.round(caloriesForWeightLoss.moderate),
      aggressive: Math.round(caloriesForWeightLoss.aggressive)
    },
    caloriesForWeightGain: {
      mild: Math.round(caloriesForWeightGain.mild),
      moderate: Math.round(caloriesForWeightGain.moderate)
    },
    macroBreakdown
  };
};

export { isValidTDEEInputs, parseTDEEInput, normalizeMetrics };
