import { PrecisionMath } from '@/lib/utils/precision-engine';
import {
  LoanInputs,
  LoanCalculationResult,
  ParsedCalculatorInput,
  AmortizationEntry,
  AmortizationSchedule,
  PrepaymentSavings,
  CalculatorFunction,
  CalculatorConfig
} from '@/types/calculator.types';

/**
 * Extended loan inputs with payment frequency and modes
 */
export interface LoanCalculatorInputs extends LoanInputs {
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
  biweeklyMode?: 'standard' | 'accelerated';
  termUnit?: 'months' | 'years';
}

/**
 * Extended loan result with payment frequency details
 */
export interface LoanCalculatorResult extends LoanCalculationResult {
  paymentFrequency: string;
  monthlyPaymentEquivalent: number;
  termInMonths: number;
  paymentsPerYear: number;
}

/**
 * Parse and validate loan calculator inputs from string form values
 * @param inputs - Form input state with string values
 * @returns Parsed and typed loan inputs
 */
export function parseLoanInputs(inputs: ParsedCalculatorInput): LoanCalculatorInputs {
  return {
    loanAmount: Number(inputs.loanAmount) || 0,
    interestRate: Number(inputs.interestRate) || 0,
    loanTerm: Number(inputs.loanTerm) || 0,
    termUnit: (inputs.termUnit as 'months' | 'years') || 'years',
    extraPayment: Number(inputs.extraPayment) || 0,
    paymentFrequency: (inputs.paymentFrequency as 'weekly' | 'biweekly' | 'monthly') || 'monthly',
    biweeklyMode: (inputs.biweeklyMode as 'standard' | 'accelerated') || 'standard'
  };
}

/**
 * Calculate amortization schedule with extra payments
 * @param principal - Loan amount in dollars
 * @param annualRate - Annual interest rate as percentage (e.g., 5.5 for 5.5%)
 * @param termMonths - Total loan term in months
 * @param extraPayment - Extra payment amount per period
 * @param paymentFrequency - Payment frequency (weekly, biweekly, monthly)
 * @returns Amortization schedule entries array
 */
export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  extraPayment: number = 0,
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly' = 'monthly'
): Array<AmortizationEntry> {
  const schedule: AmortizationEntry[] = [];

  // Calculate payment frequency
  const paymentsPerYear =
    paymentFrequency === 'weekly' ? 52 :
    paymentFrequency === 'biweekly' ? 26 :
    12;

  const annualRateDecimal = annualRate / 100;
  const periodicRate = annualRateDecimal / paymentsPerYear;
  
  // Total payments over the full term
  const totalPayments = termMonths * (paymentsPerYear / 12);

  // Safety check for invalid rates or terms to avoid NaN/Infinity
  if (!isFinite(periodicRate) || !isFinite(totalPayments) || totalPayments <= 0) {
    return [];
  }

  // Calculate regular payment
  let regularPayment: number;

  if (annualRateDecimal === 0) {
    regularPayment = principal / totalPayments;
  } else {
    // Standard amortization formula
    regularPayment =
      (principal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
      (Math.pow(1 + periodicRate, totalPayments) - 1);
  }

  let currentBalance = principal;

  for (let period = 1; period <= totalPayments && currentBalance > 0.005; period++) {
    const interestPayment = PrecisionMath.multiply(currentBalance, periodicRate);

    const principalPayment = Math.min(PrecisionMath.add(PrecisionMath.subtract(regularPayment, interestPayment), extraPayment), currentBalance);

    currentBalance = PrecisionMath.subtract(currentBalance, principalPayment);

    schedule.push({
      period,
      payment: PrecisionMath.add(principalPayment, interestPayment),
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, currentBalance)
    });

    if (currentBalance <= 0) break;
  }

  return schedule;
}

/**
 * Calculate extra payment savings (time and interest saved)
 * @param schedule - Amortization schedule with extra payments
 * @param regularPayment - Regular payment without extra
 * @param totalPayments - Total expected payments without extra
 * @returns Prepayment savings analysis with time and interest saved metrics
 */
export function calculatePrepaymentSavings(
  schedule: ReadonlyArray<AmortizationEntry>,
  regularPayment: number,
  totalPayments: number
): PrepaymentSavings {
  const actualPayments = schedule.length;
  const totalInterestWithExtra = schedule.reduce((sum, entry) => sum + entry.interest, 0);
  const totalInterestWithoutExtra = regularPayment * totalPayments - schedule[0].balance - schedule[0].principal;

  return {
    timeSaved: Math.max(0, totalPayments - actualPayments),
    interestSaved: Math.max(0, totalInterestWithoutExtra - totalInterestWithExtra),
    newTotalInterest: totalInterestWithExtra,
    newPayoffTime: actualPayments,
    savingsPercentage: totalInterestWithoutExtra > 0 
      ? ((totalInterestWithoutExtra - totalInterestWithExtra) / totalInterestWithoutExtra) * 100
      : 0
  };
}

/**
 * Extended loan inputs for Business Loan Calculator
 */
export interface BusinessLoanInputs extends LoanInputs {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  termUnit: 'months' | 'years';
  revenue?: number;
  yearsInBusiness?: number;
}

/**
 * Extended loan result for Business Loan Calculator
 */
export interface BusinessLoanResult extends LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

/**
 * Main internal loan calculation logic
 * @param inputs - Parsed loan calculator inputs
 * @param config - Optional configuration
 * @returns LoanCalculatorResult
 */
const calculateLoanInternal = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): LoanCalculatorResult => {
  const loanInputs = parseLoanInputs(inputs);
  const {
    loanAmount,
    interestRate,
    loanTerm,
    termUnit = 'years',
    extraPayment = 0,
    paymentFrequency = 'monthly'
  } = loanInputs;

  const annualRateDecimal = interestRate / 100;
  const termMonths = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  const adjustedPrincipal = loanAmount;

  // Calculate payment frequency details
  const paymentsPerYear =
    paymentFrequency === 'weekly' ? 52 :
    paymentFrequency === 'biweekly' ? 26 :
    12;

  const periodicRate = annualRateDecimal / paymentsPerYear;
  const totalPayments = termMonths * (paymentsPerYear / 12);

  // Generate amortization schedule
  const scheduleEntries = calculateAmortizationSchedule(
    adjustedPrincipal,
    interestRate,
    termMonths,
    extraPayment,
    paymentFrequency
  );

  // Calculate totals from schedule
  const totalInterest = scheduleEntries.reduce((sum, entry) => sum + entry.interest, 0);
  const totalAmount = scheduleEntries.reduce((sum, entry) => sum + entry.payment, 0);

  // Calculate regular payment for comparison
  const regularPayment =
    (adjustedPrincipal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
    (Math.pow(1 + periodicRate, totalPayments) - 1);

  // Convert to monthly equivalent
  const monthlyPaymentEquivalent = regularPayment * (paymentsPerYear / 12);

  // Calculate prepayment savings if extra payment
  let extraPaymentSavings: PrepaymentSavings | undefined;
  if (extraPayment > 0) {
    extraPaymentSavings = calculatePrepaymentSavings(scheduleEntries, regularPayment, totalPayments);
  }

  const totalPrincipal = scheduleEntries.reduce((sum, entry) => sum + entry.principal, 0);

  return {
    monthlyPayment: Math.round(monthlyPaymentEquivalent * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    amortizationSchedule: {
      entries: scheduleEntries,
      totalPayments: totalPayments,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100
    },
    extraPaymentSavings,
    primaryValue: Math.round(monthlyPaymentEquivalent * 100) / 100,
    formattedPrimaryValue: `$${(Math.round(monthlyPaymentEquivalent * 100) / 100).toFixed(2)}`,
    timestamp: new Date(),
    currency: 'USD',
    paymentFrequency,
    monthlyPaymentEquivalent: Math.round(monthlyPaymentEquivalent * 100) / 100,
    termInMonths: termMonths,
    paymentsPerYear
  };
};

/**
 * Main Business Loan calculator engine function
 * Implements the CalculatorFunction generic interface with BusinessLoanResult as the result type
 * @param inputs - Parsed loan calculator inputs (validated)
 * @param config - Optional calculator configuration for metadata
 * @returns BusinessLoanResult with payment details, schedule, and prepayment analysis
 */
export const calculateBusinessLoan: CalculatorFunction<BusinessLoanResult, ParsedCalculatorInput> = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): BusinessLoanResult => {
  const result = calculateLoanInternal(inputs, config);
  return {
    ...result,
    primaryValue: result.monthlyPayment,
    formattedPrimaryValue: `$${result.monthlyPayment.toFixed(2)}`
  };
};

/**
 * Main EMI calculator engine function
 * Implements the CalculatorFunction generic interface with LoanCalculatorResult as the result type
 * @param inputs - Parsed loan calculator inputs (validated)
 * @param config - Optional calculator configuration for metadata
 * @returns LoanCalculatorResult with payment details, schedule, and prepayment analysis
 */
export const calculateEMI: CalculatorFunction<LoanCalculatorResult, ParsedCalculatorInput> = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): LoanCalculatorResult => {
  return calculateLoanInternal(inputs, config);
};


/**
 * Extended inputs for Car Loan Calculator
 */
export interface CarLoanCalculatorInputs extends LoanInputs {
  carPrice: number;
  downPayment?: number;
  downPaymentPercent?: number;
  usePercentage?: boolean;
  loanTerm: number;
  termUnit?: 'months' | 'years';
}

/**
 * Extended result for Car Loan Calculator
 */
export interface CarLoanCalculatorResult extends LoanCalculationResult {
  carPrice: number;
  downPayment: number;
  loanAmount: number;
  monthlyPayment: number;
}

/**
 * Parse and validate car loan calculator inputs from string form values
 * @param inputs - Form input state with string values
 * @returns Parsed and typed car loan inputs
 */
export function parseCarLoanInputs(inputs: ParsedCalculatorInput): CarLoanCalculatorInputs {
  return {
    carPrice: Number(inputs.carPrice) || 0,
    downPayment: Number(inputs.downPayment) || 0,
    downPaymentPercent: Number(inputs.downPaymentPercent) || 0,
    usePercentage: inputs.usePercentage === true || inputs.usePercentage === 'true',
    loanAmount: 0, // Will be calculated
    interestRate: Number(inputs.interestRate) || 0,
    loanTerm: Number(inputs.loanTerm) || 0,
    termUnit: (inputs.termUnit as 'months' | 'years') || 'years'
  };
}

/**
 * Validates car loan calculator inputs
 * @param inputs - The input object to validate
 * @returns Boolean indicating if inputs are valid
 */
function isValidCarLoanInputs(inputs: ParsedCalculatorInput): boolean {
  const carPrice = Number(inputs.carPrice);
  const interestRate = Number(inputs.interestRate);
  const loanTerm = Number(inputs.loanTerm);
  
  return (
    isFinite(carPrice) && carPrice > 0 &&
    isFinite(interestRate) && interestRate >= 0 &&
    isFinite(loanTerm) && loanTerm > 0
  );
}

/**
 * Main Car Loan Calculator Engine
 * Calculates monthly payment based on car price, down payment, interest rate, and loan term
 * Implements the CalculatorFunction generic interface with CarLoanCalculatorResult as result type
 * 
 * @param inputs - Parsed car loan calculator inputs (validated)
 * @param config - Optional calculator configuration for metadata
 * @returns CarLoanCalculatorResult with payment details and financial breakdown
 */
export const calculateCarLoan: CalculatorFunction<CarLoanCalculatorResult, ParsedCalculatorInput> = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): CarLoanCalculatorResult => {
  if (!isValidCarLoanInputs(inputs)) {
    throw new Error('Invalid car loan calculator inputs');
  }

  const carLoanInputs = parseCarLoanInputs(inputs);
  const {
    carPrice,
    downPaymentPercent = 0,
    downPayment: inputDownPayment = 0,
    usePercentage = true,
    interestRate,
    loanTerm,
    termUnit = 'years'
  } = carLoanInputs;

  // Calculate down payment
  const downPayment = usePercentage 
    ? (carPrice * downPaymentPercent) / 100 
    : inputDownPayment;

  const loanAmount = carPrice - downPayment;
  const monthlyRate = (interestRate / 100) / 12;
  const termMonths = termUnit === 'years' ? loanTerm * 12 : loanTerm;

  // Calculate monthly payment
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    // Handle 0% interest rate
    monthlyPayment = loanAmount / termMonths;
  } else {
    // Standard loan payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    monthlyPayment = numerator / denominator;
  }

  const totalAmount = monthlyPayment * termMonths;
  const totalInterest = totalAmount - loanAmount;

  return {
    carPrice,
    downPayment: Math.round(downPayment * 100) / 100,
    loanAmount: Math.round(loanAmount * 100) / 100,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    primaryValue: Math.round(monthlyPayment * 100) / 100,
    formattedPrimaryValue: `$${(Math.round(monthlyPayment * 100) / 100).toFixed(2)}`,
    timestamp: new Date(),
    currency: 'USD'
  };
};

/**
 * Type guard to check if inputs are valid loan calculator inputs
 * Validates that required loan input fields are present and have valid values
 * @param inputs - Inputs to validate
 * @returns Boolean indicating if inputs are valid for loan calculation
 */
export function isValidLoanInputs(inputs: ParsedCalculatorInput): boolean {
  return (
    typeof inputs.loanAmount === 'number' &&
    typeof inputs.interestRate === 'number' &&
    typeof inputs.loanTerm === 'number' &&
    inputs.loanAmount > 0 &&
    inputs.interestRate >= 0 &&
    inputs.loanTerm > 0
  );
}
