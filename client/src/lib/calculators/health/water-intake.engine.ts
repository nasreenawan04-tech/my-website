
import { 
  HealthCalculatorInput, 
  UnitSystem,
  Gender,
  HealthToolResult
} from '@/types/health-tool.types';

export interface WaterIntakeInput extends HealthCalculatorInput {
  climate: string;
  activityLevel: string;
  healthConditions: string;
  isPregnant: string;
  isBreastfeeding: string;
}

export interface WaterIntakeResult extends HealthToolResult {
  dailyWaterIntake: number;
  glassesOfWater: number;
  bottlesOfWater: number;
  baseWaterNeed: number;
  activityAdjustment: number;
  climateAdjustment: number;
  healthAdjustment: number;
  recommendations: string[];
}

/**
 * Generic type for Water Intake Calculator
 */
export type WaterIntakeCalculatorFunction<T extends WaterIntakeResult = WaterIntakeResult> = (inputs: WaterIntakeInput) => T;

/**
 * Validates Water Intake calculator inputs
 */
export const isValidWaterIntakeInputs = (inputs: Partial<WaterIntakeInput>): boolean => {
  const { weight, age, gender, activityLevel, unitSystem } = inputs;
  return !!(weight && age && gender && activityLevel && unitSystem);
};

/**
 * Calculates daily water intake requirements
 */
export const calculateWaterIntake: WaterIntakeCalculatorFunction = (inputs: WaterIntakeInput): WaterIntakeResult => {
  const { weight, age, gender, activityLevel, climate, healthConditions, isPregnant, isBreastfeeding, unitSystem } = inputs;

  const weightKg = unitSystem === 'metric' ? Number(weight) : Number(weight) * 0.453592;
  const ageNum = Number(age);

  // Base water intake calculation (ml per day)
  let baseWater = 0;
  
  // Institute of Medicine recommendations
  if (gender === 'male') {
    baseWater = 3700; // 3.7L for men
  } else {
    baseWater = 2700; // 2.7L for women
  }

  // Alternative calculation based on weight (35ml per kg of body weight)
  const weightBasedWater = weightKg * 35;
  
  // Use the higher of the two calculations as base
  baseWater = Math.max(baseWater, weightBasedWater);

  // Activity level adjustments
  let activityMultiplier = 1;
  let activityAdjustment = 0;
  
  switch (activityLevel) {
    case 'sedentary':
      activityMultiplier = 1;
      break;
    case 'light':
      activityMultiplier = 1.1;
      activityAdjustment = baseWater * 0.1;
      break;
    case 'moderate':
      activityMultiplier = 1.3;
      activityAdjustment = baseWater * 0.3;
      break;
    case 'active':
      activityMultiplier = 1.5;
      activityAdjustment = baseWater * 0.5;
      break;
    case 'very_active':
      activityMultiplier = 1.7;
      activityAdjustment = baseWater * 0.7;
      break;
  }

  // Climate adjustments
  let climateAdjustment = 0;
  switch (climate) {
    case 'cold':
      climateAdjustment = 0;
      break;
    case 'temperate':
      climateAdjustment = 0;
      break;
    case 'hot':
      climateAdjustment = baseWater * 0.15;
      break;
    case 'very_hot':
      climateAdjustment = baseWater * 0.25;
      break;
  }

  // Health condition adjustments
  let healthAdjustment = 0;
  switch (healthConditions) {
    case 'none':
      healthAdjustment = 0;
      break;
    case 'fever':
      healthAdjustment = baseWater * 0.2;
      break;
    case 'vomiting':
      healthAdjustment = baseWater * 0.25;
      break;
    case 'diarrhea':
      healthAdjustment = baseWater * 0.3;
      break;
    case 'kidney_stones':
      healthAdjustment = baseWater * 0.4;
      break;
  }

  // Pregnancy and breastfeeding adjustments
  if (gender === 'female') {
    if (isPregnant === 'yes') {
      healthAdjustment += 300; // Additional 300ml for pregnancy
    }
    if (isBreastfeeding === 'yes') {
      healthAdjustment += 700; // Additional 700ml for breastfeeding
    }
  }

  // Age adjustments
  if (ageNum > 65) {
    healthAdjustment += baseWater * 0.1; // 10% more for elderly
  }

  const totalWaterIntake = baseWater * activityMultiplier + climateAdjustment + healthAdjustment;

  // Convert to appropriate units
  let finalWaterIntake = totalWaterIntake;
  if (unitSystem === 'imperial') {
    finalWaterIntake = totalWaterIntake * 0.033814; // Convert ml to fl oz
  }

  // Calculate glasses and bottles (assuming 250ml glass, 500ml bottle)
  const glassesOfWater = Math.ceil(totalWaterIntake / 250);
  const bottlesOfWater = Math.ceil(totalWaterIntake / 500);

  // Generate recommendations
  const recommendations = [];
  
  if (activityLevel === 'active' || activityLevel === 'very_active') {
    recommendations.push('Drink water before, during, and after exercise');
  }
  
  if (climate === 'hot' || climate === 'very_hot') {
    recommendations.push('Increase intake in hot weather to prevent dehydration');
  }
  
  recommendations.push('Spread your water intake throughout the day');
  recommendations.push('Monitor urine color - pale yellow indicates good hydration');
  
  if (ageNum > 65) {
    recommendations.push('Older adults should drink water regularly, even when not thirsty');
  }

  return {
    dailyWaterIntake: Math.round(finalWaterIntake),
    glassesOfWater,
    bottlesOfWater,
    baseWaterNeed: Math.round(baseWater),
    activityAdjustment: Math.round(activityAdjustment),
    climateAdjustment: Math.round(climateAdjustment),
    healthAdjustment: Math.round(healthAdjustment),
    recommendations
  };
};
