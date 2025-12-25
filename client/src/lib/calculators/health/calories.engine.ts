
/**
 * Calorie Calculator Engine - BMR, TDEE and Macro calculations
 */
import { 
  CalorieCalculatorInput, 
  CalorieResult, 
  ActivityLevel,
  Gender,
  HealthGoal,
  CalculationMethod,
  MacroBreakdown
} from '@/types/health-tool.types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  'sedentary': 1.2,
  'lightly-active': 1.375,
  'moderately-active': 1.55,
  'very-active': 1.725,
  'extra-active': 1.9
};

/**
 * Validates Calorie calculator inputs
 */
export const isValidCalorieInputs = (inputs: Partial<CalorieCalculatorInput>): boolean => {
  const { weight, height, age, gender, activityLevel, goal, unitSystem } = inputs;
  
  if (!unitSystem || !gender || !activityLevel || !goal) return false;
  
  const baseValid = !!(weight && Number(weight) > 0 && age && Number(age) > 0);
  
  if (unitSystem === 'metric') {
    return baseValid && !!(height && Number(height) > 0);
  } else {
    return baseValid && !!(inputs.feet && Number(inputs.feet) >= 0);
  }
};

/**
 * Calculates Calorie needs
 */
export const calculateCalories = (inputs: CalorieCalculatorInput): CalorieResult => {
  const { weight, height, feet, inches, age, gender, activityLevel, goal, equation, unitSystem, customDeficit } = inputs;
  
  let weightKg: number;
  let heightCm: number;

  if (unitSystem === 'metric') {
    weightKg = Number(weight);
    heightCm = Number(height);
  } else {
    weightKg = Number(weight) * 0.453592;
    const totalInches = (Number(feet) * 12) + Number(inches ?? 0);
    heightCm = totalInches * 2.54;
  }

  const ageYears = Number(age);
  let bmr: number;

  if (equation === 'mifflin') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + (gender === 'male' ? 5 : -161);
  } else {
    // Harris-Benedict
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * ageYears);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * ageYears);
    }
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = bmr * multiplier;
  const maintenanceCalories = tdee;

  const customDeficitValue = Number(customDeficit) || 500;

  const weightLossCalories = {
    mild: Math.round(tdee - 250),
    moderate: Math.round(tdee - customDeficitValue),
    aggressive: Math.round(tdee - 750)
  };

  const weightGainCalories = {
    mild: Math.round(tdee + 250),
    moderate: Math.round(tdee + 500)
  };

  // Macro breakdown for maintenance (30% Protein, 40% Carbs, 30% Fat)
  const proteinCals = maintenanceCalories * 0.3;
  const carbCals = maintenanceCalories * 0.4;
  const fatCals = maintenanceCalories * 0.3;

  const macroBreakdown: MacroBreakdown = {
    protein: { grams: Math.round(proteinCals / 4), calories: Math.round(proteinCals) },
    carbs: { grams: Math.round(carbCals / 4), calories: Math.round(carbCals) },
    fat: { grams: Math.round(fatCals / 9), calories: Math.round(fatCals) }
  };

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    maintenanceCalories: Math.round(maintenanceCalories),
    weightLossCalories,
    weightGainCalories,
    macroBreakdown,
    activityMultiplier: multiplier,
    equation: equation === 'mifflin' ? 'Mifflin-St Jeor' : 'Harris-Benedict',
    weeklyCalorieDeficit: goal === 'lose' ? customDeficitValue * 7 : undefined,
    monthlyWeightLoss: goal === 'lose' ? (customDeficitValue * 30) / 7700 : undefined, // ~7700 cal per kg
  };
};
