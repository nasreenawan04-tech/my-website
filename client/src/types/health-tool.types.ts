/**
 * Health Tool Types - Shared TypeScript interfaces for health calculators
 * Based on BMI Calculator, Calorie Calculator, and other health tracking tools
 */

/**
 * Unit system for measurements
 */
export type UnitSystem = 'metric' | 'imperial';

/**
 * Gender for health calculations
 */
export type Gender = 'male' | 'female';

/**
 * Activity level multipliers for calorie calculations
 */
export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';

/**
 * Weight management goal
 */
export type HealthGoal = 'lose' | 'maintain' | 'gain';

/**
 * Calculation equation/method for BMR
 */
export type CalculationMethod = 'mifflin' | 'harris';

/**
 * Health metric category/classification
 */
export type HealthCategory = 'underweight' | 'normal weight' | 'overweight' | 'obese';

/**
 * Common health calculator input configuration
 * Extends with specific calculator properties
 */
export interface HealthCalculatorInput {
  weight: string | number;
  height: string | number;
  age: string | number;
  gender: Gender;
  unitSystem: UnitSystem;
  feet?: string | number;
  inches?: string | number;
}

/**
 * Imperial-specific height input (feet and inches)
 */
export interface ImperialHeightInput {
  feet: string | number;
  inches: string | number;
}

/**
 * Normalized health metrics in metric system (kg, cm)
 */
export interface NormalizedMetrics {
  weightKg: number;
  heightCm: number;
  heightM: number;
  ageYears: number;
}

/**
 * Weight recommendation output
 */
export interface WeightRecommendation {
  value?: number;
  unit: 'kg' | 'lbs';
  description: string;
}

/**
 * BMI Calculator input configuration
 */
export interface BMICalculatorInput extends HealthCalculatorInput {
  height: string | number; // cm for metric, or use feet/inches
  feet?: string | number;  // for imperial
  inches?: string | number; // for imperial
}

/**
 * BMI Calculator result/output
 */
export interface BMIResult {
  bmi: number;
  category: HealthCategory;
  healthyWeightMin: number;
  healthyWeightMax: number;
  weightToLose?: number;
  weightToGain?: number;
}

/**
 * Calorie Calculator input configuration
 */
export interface CalorieCalculatorInput extends HealthCalculatorInput {
  height: string | number; // cm for metric, or use feet/inches
  feet?: string | number;  // for imperial
  inches?: string | number; // for imperial
  activityLevel: ActivityLevel;
  goal: HealthGoal;
  equation: CalculationMethod;
  customDeficit?: string | number;
}

/**
 * Macro nutrient breakdown
 */
export interface MacroBreakdown {
  protein: {
    grams: number;
    calories: number;
  };
  carbs: {
    grams: number;
    calories: number;
  };
  fat: {
    grams: number;
    calories: number;
  };
}

/**
 * Calorie goals with intensity levels
 */
export interface CalorieGoals {
  mild: number;
  moderate: number;
  aggressive?: number;
}

/**
 * Calorie Calculator result/output
 */
export interface CalorieResult {
  bmr: number;
  tdee: number;
  maintenanceCalories: number;
  weightLossCalories: CalorieGoals;
  weightGainCalories: {
    mild: number;
    moderate: number;
  };
  macroBreakdown: MacroBreakdown;
  activityMultiplier: number;
  equation: string;
  weeklyCalorieDeficit?: number;
  monthlyWeightLoss?: number;
}

/**
 * Generic health tool result interface
 * Extend this for specific calculator results
 */
export interface HealthToolResult {
  [key: string]: unknown;
}

/**
 * Activity multiplier mapping
 */
export interface ActivityMultipliers {
  'sedentary': number;
  'lightly-active': number;
  'moderately-active': number;
  'very-active': number;
  'extra-active': number;
}

/**
 * Health metric value with unit
 */
export interface HealthMetricValue {
  value: number;
  unit: string;
  label: string;
}

/**
 * Health metric display properties
 */
export interface HealthMetricDisplay extends HealthMetricValue {
  color?: string;
  status?: 'good' | 'warning' | 'alert';
  description?: string;
}

/**
 * Validator for health calculator inputs
 */
export interface HealthInputValidator {
  isValid(): boolean;
  getErrors(): string[];
}

/**
 * Common health tool properties
 */
export interface HealthToolProperties {
  id: string;
  name: string;
  category: 'health';
  description: string;
  icon?: string;
  color?: string;
  supportsImperial: boolean;
  supportsMetric: boolean;
  requiredInputs: (keyof HealthCalculatorInput)[];
}

/**
 * Health tool state management
 */
export interface HealthToolState<I extends HealthCalculatorInput, R extends HealthToolResult> {
  input: Partial<I>;
  result: R | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Unit conversion helpers
 */
export interface UnitConverter {
  kgToLbs(kg: number): number;
  lbsToKg(lbs: number): number;
  cmToInches(cm: number): number;
  inchesToCm(inches: number): number;
  metersToFeet(m: number): { feet: number; inches: number };
}

/**
 * Health metric range for categorization
 */
export interface MetricRange {
  min: number;
  max: number;
  category: string;
  color?: string;
  description?: string;
}

/**
 * Health metric ranges configuration
 */
export interface MetricRangesConfig {
  [category: string]: MetricRange;
}
