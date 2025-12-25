
/**
 * BMI Calculator Engine - BMI calculation and classification
 */
import { 
  BMICalculatorInput, 
  BMIResult, 
  HealthCategory, 
  Gender,
  UnitSystem
} from '@/types/health-tool.types';

/**
 * Validates BMI inputs
 */
export const isValidBMIInputs = (inputs: Partial<BMICalculatorInput>): boolean => {
  const { weight, height, unitSystem, feet, inches } = inputs;
  
  if (!unitSystem) return false;
  
  if (unitSystem === 'metric') {
    return !!(weight && height && Number(weight) > 0 && Number(height) > 0);
  } else {
    return !!(weight && feet && Number(weight) > 0 && Number(feet) >= 0 && Number(inches ?? 0) >= 0);
  }
};

/**
 * Calculates BMI based on weight and height
 */
export const calculateBMI = (inputs: BMICalculatorInput): BMIResult => {
  const { weight, height, feet, inches, unitSystem } = inputs;
  
  let weightKg: number;
  let heightM: number;

  if (unitSystem === 'metric') {
    weightKg = Number(weight);
    heightM = Number(height) / 100;
  } else {
    weightKg = Number(weight) * 0.453592;
    const totalInches = (Number(feet) * 12) + Number(inches ?? 0);
    heightM = totalInches * 0.0254;
  }

  const bmiValue = weightKg / (heightM * heightM);
  
  let category: HealthCategory = 'normal weight';
  if (bmiValue < 18.5) {
    category = 'underweight';
  } else if (bmiValue >= 25 && bmiValue < 30) {
    category = 'overweight';
  } else if (bmiValue >= 30) {
    category = 'obese';
  }

  const healthyWeightMin = 18.5 * (heightM * heightM);
  const healthyWeightMax = 24.9 * (heightM * heightM);
  
  let weightToLose: number | undefined;
  let weightToGain: number | undefined;

  if (bmiValue > 25) {
    weightToLose = weightKg - healthyWeightMax;
  } else if (bmiValue < 18.5) {
    weightToGain = healthyWeightMin - weightKg;
  }

  // Convert results back to input units if necessary for weight recommendations
  const conversionFactor = unitSystem === 'imperial' ? 1 / 0.453592 : 1;

  return {
    bmi: Math.round(bmiValue * 10) / 10,
    category,
    healthyWeightMin: Math.round(healthyWeightMin * conversionFactor * 10) / 10,
    healthyWeightMax: Math.round(healthyWeightMax * conversionFactor * 10) / 10,
    weightToLose: weightToLose ? Math.round(weightToLose * conversionFactor * 10) / 10 : undefined,
    weightToGain: weightToGain ? Math.round(weightToGain * conversionFactor * 10) / 10 : undefined,
  };
};
