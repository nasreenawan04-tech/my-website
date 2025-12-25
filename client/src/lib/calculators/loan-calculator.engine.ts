/**
 * Loan Calculator Engine - Typed calculation functions
 * Implements generic CalculatorFunction type with LoanInputs and LoanCalculationResult
 */

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
    processingFee: Number(inputs.processingFee) || 0,
    balloonPayment: Number(inputs.balloonPayment) || 0,
    paymentFrequency: (inputs.paymentFrequency as 'weekly' | 'biweekly' | 'monthly') || 'monthly',
    biweeklyMode: (inputs.biweeklyMode as 'standard' | 'accelerated') || 'standard'
  };
}

/**
 * Calculate amortization schedule with extra payments and balloon payment support
 * @param principal - Loan amount in dollars
 * @param annualRate - Annual interest rate as percentage (e.g., 5.5 for 5.5%)
 * @param termMonths - Total loan term in months
 * @param extraPayment - Extra payment amount per period
 * @param balloonPayment - Balloon payment at end of loan
 * @param paymentFrequency - Payment frequency (weekly, biweekly, monthly)
 * @returns Amortization schedule entries array
 */
export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  extraPayment: number = 0,
  balloonPayment: number = 0,
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
  const totalPayments = termMonths * (paymentsPerYear / 12);

  // Calculate regular payment
  let regularPayment: number;

  if (balloonPayment > 0) {
    // Loan with balloon payment formula
    const discountedBalloon = balloonPayment / Math.pow(1 + periodicRate, totalPayments);
    const principalMinusBalloon = principal - discountedBalloon;
    regularPayment =
      (principalMinusBalloon * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
      (Math.pow(1 + periodicRate, totalPayments) - 1);
  } else {
    // Standard amortization formula
    regularPayment =
      (principal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
      (Math.pow(1 + periodicRate, totalPayments) - 1);
  }

  let currentBalance = principal;

  for (let period = 1; period <= totalPayments && currentBalance > 0.01; period++) {
    const interestPayment = currentBalance * periodicRate;

    let principalPayment: number;
    if (period === totalPayments && balloonPayment > 0) {
      principalPayment = currentBalance;
    } else {
      principalPayment = Math.min(regularPayment - interestPayment + extraPayment, currentBalance);
    }

    currentBalance -= principalPayment;

    schedule.push({
      period,
      payment: principalPayment + interestPayment,
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
    processingFee = 0,
    balloonPayment = 0,
    paymentFrequency = 'monthly'
  } = loanInputs;

  const annualRateDecimal = interestRate / 100;
  const termMonths = termUnit === 'years' ? loanTerm * 12 : loanTerm;
  const adjustedPrincipal = loanAmount + processingFee;

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
    balloonPayment,
    paymentFrequency
  );

  // Calculate totals from schedule
  const totalInterest = scheduleEntries.reduce((sum, entry) => sum + entry.interest, 0);
  const totalAmount = scheduleEntries.reduce((sum, entry) => sum + entry.payment, 0);

  // Calculate regular payment for comparison
  let regularPayment: number;
  if (balloonPayment > 0) {
    const discountedBalloon = balloonPayment / Math.pow(1 + periodicRate, totalPayments);
    const principalMinusBalloon = adjustedPrincipal - discountedBalloon;
    regularPayment =
      (principalMinusBalloon * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
      (Math.pow(1 + periodicRate, totalPayments) - 1);
  } else {
    regularPayment =
      (adjustedPrincipal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
      (Math.pow(1 + periodicRate, totalPayments) - 1);
  }

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
export const calculateBusinessLoan: CalculatorFunction<BusinessLoanResult> = (
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
export const calculateEMI: CalculatorFunction<LoanCalculatorResult> = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): LoanCalculatorResult => {
  return calculateLoanInternal(inputs, config);
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
