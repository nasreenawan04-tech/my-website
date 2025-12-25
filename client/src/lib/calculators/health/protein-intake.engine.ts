
import { 
  HealthCalculatorInput, 
  UnitSystem,
  Gender,
  HealthGoal,
  HealthToolResult
} from '@/types/health-tool.types';

export interface ProteinIntakeInput extends HealthCalculatorInput {
  fitnessGoal: string;
  activityLevel: string;
  healthConditions: string;
  isPregnant: string;
  isBreastfeeding: string;
}

export interface ProteinIntakeResult extends HealthToolResult {
  dailyProteinIntake: number;
  proteinPerMeal: number;
  proteinSources: {
    chicken: number;
    eggs: number;
    fish: number;
    beans: number;
    nuts: number;
    quinoa: number;
  };
  recommendations: string[];
  proteinTiming: string[];
}

/**
 * Generic type for Protein Intake Calculator
 */
export type ProteinIntakeCalculatorFunction<T extends ProteinIntakeResult = ProteinIntakeResult> = (inputs: ProteinIntakeInput) => T;

/**
 * Validates Protein Intake calculator inputs
 */
export const isValidProteinIntakeInputs = (inputs: Partial<ProteinIntakeInput>): boolean => {
  const { weight, age, gender, activityLevel, fitnessGoal } = inputs;
  return !!(weight && age && gender && activityLevel && fitnessGoal);
};

/**
 * Calculates daily protein intake requirements
 */
export const calculateProteinIntake: ProteinIntakeCalculatorFunction = (inputs: ProteinIntakeInput): ProteinIntakeResult => {
  const { weight, age, gender, activityLevel, fitnessGoal, healthConditions, isPregnant, isBreastfeeding, unitSystem } = inputs;

  const weightKg = unitSystem === 'metric' ? Number(weight) : Number(weight) * 0.453592;
  const ageNum = Number(age);

  // Base protein requirement calculation (grams per kg of body weight)
  let proteinPerKg = 0;

  // Set base protein requirements
  if (ageNum < 18) {
    proteinPerKg = 1.2; // Growing adolescents need more protein
  } else if (ageNum > 65) {
    proteinPerKg = 1.2; // Elderly need more protein to prevent muscle loss
  } else {
    proteinPerKg = 0.8; // Standard RDA for adults
  }

  // Adjust based on activity level
  switch (activityLevel) {
    case 'sedentary':
      break;
    case 'light':
      proteinPerKg += 0.2;
      break;
    case 'moderate':
      proteinPerKg += 0.4;
      break;
    case 'active':
      proteinPerKg += 0.6;
      break;
    case 'very_active':
      proteinPerKg += 0.8;
      break;
  }

  // Adjust based on fitness goals
  switch (fitnessGoal) {
    case 'maintenance':
      break;
    case 'weight_loss':
      proteinPerKg += 0.3; // Higher protein helps preserve muscle during weight loss
      break;
    case 'muscle_gain':
      proteinPerKg += 0.6; // Higher protein for muscle building
      break;
    case 'athletic_performance':
      proteinPerKg += 0.8; // Athletes need more protein
      break;
    case 'recovery':
      proteinPerKg += 0.5; // Recovery from injury or intense training
      break;
  }

  // Health condition adjustments
  switch (healthConditions) {
    case 'none':
      break;
    case 'kidney_disease':
      proteinPerKg = Math.min(proteinPerKg, 0.6); // Reduce protein for kidney disease
      break;
    case 'diabetes':
      proteinPerKg += 0.2; // Slightly higher protein can help with blood sugar
      break;
    case 'liver_disease':
      proteinPerKg = Math.min(proteinPerKg, 0.8); // Moderate protein for liver issues
      break;
  }

  // Pregnancy and breastfeeding adjustments
  if (gender === 'female') {
    if (isPregnant === 'yes') {
      proteinPerKg += 0.3; // Additional protein during pregnancy
    }
    if (isBreastfeeding === 'yes') {
      proteinPerKg += 0.5; // Additional protein for breastfeeding
    }
  }

  const dailyProtein = weightKg * proteinPerKg;
  const proteinPerMeal = dailyProtein / 3; // Assuming 3 meals per day

  // Calculate protein sources (grams needed from each source)
  const proteinSources = {
    chicken: Math.ceil(dailyProtein / 0.31), // Chicken breast has ~31g protein per 100g
    eggs: Math.ceil(dailyProtein / 6), // One large egg has ~6g protein
    fish: Math.ceil(dailyProtein / 0.25), // Fish has ~25g protein per 100g
    beans: Math.ceil(dailyProtein / 0.09), // Beans have ~9g protein per 100g
    nuts: Math.ceil(dailyProtein / 0.15), // Nuts have ~15g protein per 100g
    quinoa: Math.ceil(dailyProtein / 0.14), // Quinoa has ~14g protein per 100g
  };

  // Generate recommendations
  const recommendations = [];
  
  if (fitnessGoal === 'muscle_gain' || activityLevel === 'very_active') {
    recommendations.push('Consider protein supplements if unable to meet needs through food');
  }
  
  if (ageNum > 50) {
    recommendations.push('Focus on high-quality, easily digestible protein sources');
  }
  
  recommendations.push('Spread protein intake evenly throughout the day');
  recommendations.push('Include both animal and plant-based protein sources for variety');
  
  if (fitnessGoal === 'weight_loss') {
    recommendations.push('Higher protein intake can help preserve muscle mass during weight loss');
  }

  // Protein timing recommendations
  const proteinTiming = [
    'Have protein within 2 hours after exercise',
    'Include protein in every meal',
    'Consider a protein-rich snack before bed for muscle recovery'
  ];

  if (activityLevel === 'very_active' || fitnessGoal === 'muscle_gain') {
    proteinTiming.push('Consume 20-25g protein within 30 minutes post-workout');
  }

  return {
    dailyProteinIntake: Math.round(dailyProtein),
    proteinPerMeal: Math.round(proteinPerMeal),
    proteinSources,
    recommendations,
    proteinTiming
  };
};
