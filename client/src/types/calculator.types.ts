/**
 * Shared TypeScript interfaces for calculator tools
 * Defines common patterns for input validation, results, and configurations
 */

import { z } from 'zod';

/**
 * Base configuration for any calculator
 * Extend this for specific calculator types
 */
export interface CalculatorConfig {
  id: string;
  name: string;
  category: 'finance' | 'health' | 'text' | 'utilities';
  description: string;
  icon: string;
}

/**
 * Generic calculator input configuration
 * Maps input field names to their metadata (type, unit, min/max values)
 */
export interface CalculatorInputField {
  name: string;
  label: string;
  placeholder: string;
  unit?: string;
  type: 'number' | 'text' | 'select' | 'checkbox';
  defaultValue: string | number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  required: boolean;
  helpText?: string;
}

/**
 * Generic calculator input state
 * Stores string values from form inputs
 */
export interface CalculatorInputState {
  [key: string]: string | number | boolean;
}

/**
 * Parsed and validated calculator inputs
 * Converted to proper types (numbers, booleans) after validation
 */
export interface ParsedCalculatorInput {
  [key: string]: number | string | boolean;
}

/**
 * Generic validation error result
 * Maps field names to error messages
 */
export interface CalculatorValidationError {
  [key: string]: string | undefined;
}

/**
 * Result of calculator validation
 * Success = true means all inputs are valid
 */
export interface ValidationResult<T = ParsedCalculatorInput> {
  success: boolean;
  data?: T;
  errors?: CalculatorValidationError;
}

/**
 * Generic calculator result with common properties
 * Extend this interface for specific calculator types
 */
export interface CalculatorResult {
  primaryValue: number; // Main output (monthly payment, total, etc.)
  formattedPrimaryValue: string; // Formatted for display
  timestamp: Date;
  currency?: string;
  unit?: string;
}

/**
 * Payment or amortization schedule entry
 * Used for loan, mortgage, and similar payment calculators
 */
export interface AmortizationEntry {
  period: number; // Month, year, or payment number
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Generic amortization/payment schedule
 */
export interface AmortizationSchedule {
  entries: AmortizationEntry[];
  totalPayments: number;
  totalInterest: number;
  totalPrincipal: number;
}

/**
 * Generic yearly breakdown for multi-year calculations
 * Used in compound interest, investment calculations
 */
export interface YearlyBreakdown {
  year: number;
  amount: number;
  interestEarned?: number;
  totalInterest?: number;
  contribution?: number;
  cumulativeContributions?: number;
  [key: string]: string | number | undefined;
}

/**
 * Scenario comparison item
 * For comparing multiple calculator scenarios (loans, mortgages, etc.)
 */
export interface ComparisonScenario {
  id: string;
  name: string;
  inputs: ParsedCalculatorInput;
  result: CalculatorResult;
  primaryMetric: number;
  secondaryMetrics: Record<string, number>;
}

/**
 * Extra payment/prepayment savings analysis
 * Used in loan/mortgage calculators with extra payment options
 */
export interface PrepaymentSavings {
  timeSaved: number; // Months or years saved
  interestSaved: number; // Total interest saved
  newTotalInterest: number; // Total interest after prepayment
  newPayoffTime: number; // New payoff time in months/years
  savingsPercentage?: number; // Percentage of interest saved
}

/**
 * Goal analysis for investment/savings calculators
 * Determines if a savings goal can be met with current inputs
 */
export interface GoalAnalysis {
  timeToReachGoal: number; // Months/years to reach goal
  requiredMonthlyContribution: number; // Monthly contribution needed
  isGoalAchievable: boolean; // Whether goal is achievable with current inputs
  goalAmount: number;
  finalAmount?: number;
}

/**
 * What-if scenario analysis
 * Shows how changing one variable affects the result
 */
export interface WhatIfScenario {
  variableName: string;
  variableChange: string; // e.g., "+1%", "-$5000"
  changeValue: number; // Numeric value of the change
  resultValue: number; // Resulting calculation value
  difference: number; // Difference from baseline
  percentageChange?: number; // Percentage change
  rateChange?: string; // Legacy field for Compound Interest
  rate?: number; // Legacy field for Compound Interest
  finalAmount?: number; // Legacy field for Compound Interest
}

/**
 * Chart data point for result visualization
 */
export interface ChartDataPoint {
  [key: string]: string | number;
}

/**
 * UI state for calculator presentation
 */
export interface CalculatorUIState {
  isCalculating: boolean;
  isGeneratingPDF: boolean;
  showResults: boolean;
  showAdvancedOptions: boolean;
  activeTab?: string;
  expandedSection?: string;
  chartFilter?: 'principal' | 'interest' | 'both' | string;
  [key: string]: string | boolean | undefined;
}

/**
 * Generic calculator function type
 * Validates inputs and returns a calculator result
 */
export type CalculatorFunction<T extends CalculatorResult, I = ParsedCalculatorInput> = (
  inputs: I,
  config?: Partial<CalculatorConfig>
) => T;

/**
 * Generic validator function type
 * Validates inputs against schema
 */
export type ValidatorFunction<I = ParsedCalculatorInput> = (
  inputs: I
) => ValidationResult<I>;

/**
 * Financial calculator specific types
 */

/**
 * Base financial calculator result
 * Extends generic calculator result with financial-specific properties
 */
export interface FinancialCalculatorResult extends CalculatorResult {
  currency: string;
  totalAmount: number;
  totalInterest: number;
}

/**
 * Loan/Mortgage specific inputs
 */
export interface LoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  termUnit?: 'months' | 'years';
  paymentFrequency?: 'monthly' | 'biweekly' | 'weekly' | 'annually';
  extraPayment?: number;
  processingFee?: number;
  balloonPayment?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Loan/Mortgage calculation result
 */
export interface LoanCalculationResult extends FinancialCalculatorResult {
  monthlyPayment: number;
  amortizationSchedule?: AmortizationSchedule;
  extraPaymentSavings?: PrepaymentSavings;
}

/**
 * Investment/Savings calculator inputs
 */
export interface InvestmentInputs {
  principal: number;
  interestRate: number;
  timePeriod: number;
  timeUnit?: 'months' | 'years';
  compoundFrequency?: 'annually' | 'semiannually' | 'quarterly' | 'monthly' | 'daily';
  monthlyContribution?: number;
  annualStepUp?: number;
  inflationRate?: number;
  taxRate?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Investment/Savings calculation result
 */
export interface InvestmentCalculationResult extends FinancialCalculatorResult {
  finalAmount: number;
  yearlyBreakdown?: YearlyBreakdown[];
  goalAnalysis?: GoalAnalysis;
  whatIfAnalysis?: WhatIfScenario[];
}

/**
 * Health calculator specific types
 */

/**
 * Base health calculator result
 */
export interface HealthCalculatorResult extends CalculatorResult {
  unit: string;
  recommendation?: string;
  category?: string;
  rangeMin?: number;
  rangeMax?: number;
}

/**
 * BMI calculator specific result
 */
export interface BMICalculationResult extends HealthCalculatorResult {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  healthRisk: 'low' | 'moderate' | 'high' | 'very high';
  idealWeightRange: { min: number; max: number };
}

/**
 * Calorie calculator specific result
 */
export interface CalorieCalculationResult extends HealthCalculatorResult {
  maintenanceCalories: number;
  bulkingCalories: number;
  cuttingCalories: number;
  macroBreakdown: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

/**
 * Text processing calculator result
 */
export interface TextCalculatorResult extends CalculatorResult {
  inputText: string;
  resultText?: string;
  outputLength: number;
  metadata: Record<string, string | number>;
}

/**
 * Generic calculator data persistence
 */
export interface SavedCalculation {
  id: string;
  calculatorId: string;
  calculatorName: string;
  inputs: ParsedCalculatorInput;
  result: CalculatorResult | null;
  timestamp: Date;
  tags?: string[];
  notes?: string;
}

/**
 * Calculator sharing format
 */
export interface CalculatorShareData {
  calculatorId: string;
  inputs: ParsedCalculatorInput;
  result: CalculatorResult | null;
  sharedAt: Date;
  expiresAt?: Date;
  shareToken?: string;
}

/**
 * Generic validator builder
 * Helper to create Zod schemas for calculators
 */
export const createCalculatorValidation = (fields: CalculatorInputField[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let schema: z.ZodTypeAny = z.any();

    if (field.type === 'number') {
      schema = z.number({
        invalid_type_error: `${field.label} must be a valid number`,
        required_error: field.required ? `${field.label} is required` : undefined,
      });

      if (!field.required && field.defaultValue !== undefined) {
        schema = schema.optional();
      }

      if (field.minValue !== undefined) {
        schema = (schema as z.ZodNumber).min(field.minValue, `${field.label} must be at least ${field.minValue}`);
      }

      if (field.maxValue !== undefined) {
        schema = (schema as z.ZodNumber).max(field.maxValue, `${field.label} cannot exceed ${field.maxValue}`);
      }

      schema = (schema as z.ZodNumber).finite(`${field.label} must be a finite number`);
    } else if (field.type === 'text') {
      schema = z.string();
    } else if (field.type === 'checkbox') {
      schema = z.boolean();
    } else if (field.type === 'select') {
      schema = z.string();
    }

    shape[field.name] = schema;
  });

  return z.object(shape);
};
