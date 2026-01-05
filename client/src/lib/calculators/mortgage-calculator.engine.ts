/**
 * Mortgage Calculator Engine - Typed calculation functions
 * Implements generic CalculatorFunction type with MortgageCalculatorInputs and MortgageCalculatorResult
 */

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
 * Extended mortgage-specific inputs
 */
export interface MortgageCalculatorInputs extends LoanInputs {
  homePrice: number;
  downPayment: number;
  propertyTax: number;
  homeInsurance: number;
  extraPayment: number;
  loanType?: 'conventional' | 'fha' | 'va';
}

/**
 * Extended mortgage result with housing-specific details
 */
export interface MortgageCalculatorResult extends LoanCalculationResult {
  homePrice: number;
  downPayment: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  totalCashNeeded: number;
  loanToValue: number;
}

/**
 * Parse and validate mortgage calculator inputs from string form values
 * @param inputs - Form input state with string values
 * @returns Parsed and typed mortgage inputs
 */
export function parseMortgageInputs(inputs: ParsedCalculatorInput): MortgageCalculatorInputs {
  return {
    loanAmount: 0, // Will be calculated from homePrice - downPayment
    homePrice: Number(inputs.homePrice) || 0,
    downPayment: Number(inputs.downPayment) || 0,
    interestRate: Number(inputs.interestRate) || 0,
    loanTerm: Number(inputs.loanTerm) || 0,
    termUnit: 'years',
    propertyTax: Number(inputs.propertyTax) || 0,
    homeInsurance: Number(inputs.homeInsurance) || 0,
    extraPayment: Number(inputs.extraPayment) || 0,
    loanType: (inputs.loanType as 'conventional' | 'fha' | 'va') || 'conventional'
  };
}

/**
 * Calculate mortgage amortization with extra payments
 * @param principal - Loan amount (homePrice - downPayment)
 * @param annualRate - Annual interest rate as percentage
 * @param termYears - Loan term in years
 * @param extraPayment - Extra payment per period
 * @param loanType - Loan type (affects rate adjustments)
 * @returns Array of amortization schedule entries
 */
export function calculateMortgageAmortization(
  principal: number,
  annualRate: number,
  termYears: number,
  extraPayment: number = 0,
  loanType: 'conventional' | 'fha' | 'va' = 'conventional'
): Array<AmortizationEntry> {
  const schedule: AmortizationEntry[] = [];
  const paymentsPerYear = 12; // Defaulted to monthly

  const annualRateDecimal = annualRate / 100;
  const periodicRate = annualRateDecimal / paymentsPerYear;
  const totalPayments = termYears * paymentsPerYear;

  // Apply loan type adjustments
  let adjustedRate = periodicRate;
  if (loanType === 'fha') {
    adjustedRate = periodicRate + (0.0085 / paymentsPerYear);
  } else if (loanType === 'va') {
    adjustedRate = periodicRate - (0.0025 / paymentsPerYear);
  }

  // Calculate monthly PI payment
  const monthlyPI =
    adjustedRate === 0
      ? principal / totalPayments
      : (principal * adjustedRate * Math.pow(1 + adjustedRate, totalPayments)) /
        (Math.pow(1 + adjustedRate, totalPayments) - 1);

  let currentBalance = principal;

  for (let period = 1; period <= totalPayments && currentBalance > 0.005; period++) {
    const interestPayment = PrecisionMath.multiply(currentBalance, adjustedRate);
    const principalPayment = Math.min(
      PrecisionMath.add(PrecisionMath.subtract(monthlyPI, interestPayment), extraPayment),
      currentBalance
    );

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
 * Calculate monthly PMI based on loan type and down payment
 * @param principal - Loan amount
 * @param homePrice - Home price
 * @param loanType - Loan type
 * @returns Monthly PMI amount
 */
export function calculateMonthlyPMI(
  principal: number,
  homePrice: number,
  loanType: 'conventional' | 'fha' | 'va'
): number {
  const downPaymentPercent = ((homePrice - principal) / homePrice) * 100;
  const pmiRate = 0.75; // Default estimate

  if (loanType === 'conventional' && downPaymentPercent < 20) {
    return (principal * (pmiRate / 100)) / 12;
  } else if (loanType === 'fha') {
    return (principal * 0.0085) / 12;
  }

  return 0;
}

/**
 * Main mortgage calculator engine function
 * Calculates monthly payment with all costs (PI, taxes, insurance, PMI)
 * Implements the CalculatorFunction generic interface with MortgageCalculatorResult as the result type
 * @param inputs - Parsed mortgage calculator inputs (validated)
 * @param config - Optional calculator configuration for metadata
 * @returns MortgageCalculatorResult with comprehensive housing cost breakdown and amortization schedule
 */
export const calculateMortgage: CalculatorFunction<MortgageCalculatorResult> = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): MortgageCalculatorResult => {
  const mortgageInputs = parseMortgageInputs(inputs);
  const {
    homePrice,
    downPayment,
    interestRate,
    loanTerm,
    propertyTax = 0,
    homeInsurance = 0,
    extraPayment = 0,
    loanType = 'conventional'
  } = mortgageInputs;

  const principal = homePrice - downPayment;
  const paymentsPerYear = 12; // Defaulted to monthly

  const annualRateDecimal = interestRate / 100;
  const periodicRate = annualRateDecimal / paymentsPerYear;
  const totalPayments = loanTerm * paymentsPerYear;

  // Apply loan type adjustments
  let adjustedRate = periodicRate;
  if (loanType === 'fha') {
    adjustedRate = periodicRate + (0.0085 / paymentsPerYear);
  } else if (loanType === 'va') {
    adjustedRate = periodicRate - (0.0025 / paymentsPerYear);
  }

  // Calculate principal and interest
  const monthlyPI =
    adjustedRate === 0
      ? principal / totalPayments
      : (principal * adjustedRate * Math.pow(1 + adjustedRate, totalPayments)) /
        (Math.pow(1 + adjustedRate, totalPayments) - 1);

  // Generate amortization schedule
  const scheduleEntries = calculateMortgageAmortization(
    principal,
    interestRate,
    loanTerm,
    extraPayment,
    loanType
  );

  // Calculate totals from schedule using precision math
  const totalInterest = scheduleEntries.reduce((sum, entry) => PrecisionMath.add(sum, entry.interest), 0);
  const totalAmount = scheduleEntries.reduce((sum, entry) => PrecisionMath.add(sum, entry.payment), 0);

  // Calculate monthly housing costs
  const monthlyTaxes = PrecisionMath.divide(propertyTax, 12);
  const monthlyInsuranceAmount = PrecisionMath.divide(homeInsurance, 12);
  const monthlyPMI = calculateMonthlyPMI(principal, homePrice, loanType);

  // Convert PI to monthly equivalent
  const monthlyPIEquivalent = monthlyPI;
  const totalMonthlyPayment = PrecisionMath.add(
    PrecisionMath.add(PrecisionMath.add(monthlyPIEquivalent, monthlyTaxes), monthlyInsuranceAmount),
    monthlyPMI
  );

  // Calculate closing costs and total cash needed
  const closingCostPercent = 3; // Default estimate
  const closingCosts = PrecisionMath.divide(PrecisionMath.multiply(homePrice, closingCostPercent), 100);
  const totalCashNeeded = PrecisionMath.add(downPayment, closingCosts);

  // Calculate loan-to-value ratio
  const loanToValue = PrecisionMath.multiply(PrecisionMath.divide(principal, homePrice), 100);

  // Calculate prepayment savings if extra payment
  let extraPaymentSavings: PrepaymentSavings | undefined;
  if (extraPayment > 0) {
    const regularTotalAmount = PrecisionMath.multiply(monthlyPI, totalPayments);
    const regularTotalInterest = PrecisionMath.subtract(regularTotalAmount, principal);
    const totalInterestWithExtra = scheduleEntries.reduce((sum, entry) => PrecisionMath.add(sum, entry.interest), 0);

    extraPaymentSavings = {
      timeSaved: Math.max(0, totalPayments - scheduleEntries.length),
      interestSaved: Math.max(0, PrecisionMath.subtract(regularTotalInterest, totalInterestWithExtra)),
      newTotalInterest: totalInterestWithExtra,
      newPayoffTime: scheduleEntries.length,
      savingsPercentage:
        regularTotalInterest > 0
          ? PrecisionMath.multiply(PrecisionMath.divide(PrecisionMath.subtract(regularTotalInterest, totalInterestWithExtra), regularTotalInterest), 100)
          : 0
    };
  }

  const totalPrincipal = scheduleEntries.reduce((sum, entry) => PrecisionMath.add(sum, entry.principal), 0);

  return {
    monthlyPayment: PrecisionMath.round(totalMonthlyPayment, 2),
    totalAmount: PrecisionMath.round(totalAmount, 2),
    totalInterest: PrecisionMath.round(totalInterest, 2),
    amortizationSchedule: {
      entries: scheduleEntries,
      totalPayments: totalPayments,
      totalInterest: PrecisionMath.round(totalInterest, 2),
      totalPrincipal: PrecisionMath.round(totalPrincipal, 2)
    },
    extraPaymentSavings,
    primaryValue: PrecisionMath.round(totalMonthlyPayment, 2),
    formattedPrimaryValue: `$${PrecisionMath.round(totalMonthlyPayment, 2).toFixed(2)}`,
    timestamp: new Date(),
    currency: 'USD',
    homePrice,
    downPayment,
    monthlyPrincipalAndInterest: PrecisionMath.round(monthlyPIEquivalent, 2),
    monthlyTaxes: PrecisionMath.round(monthlyTaxes, 2),
    monthlyInsurance: PrecisionMath.round(monthlyInsuranceAmount, 2),
    monthlyPMI: PrecisionMath.round(monthlyPMI, 2),
    totalCashNeeded: PrecisionMath.round(totalCashNeeded, 2),
    loanToValue: PrecisionMath.round(loanToValue, 2)
  };
};

/**
 * Validates mortgage calculator inputs
 * @param inputs - The input object to validate
 * @returns Boolean indicating if inputs are valid
 */
function isValidMortgageCalculatorInputs(inputs: ParsedCalculatorInput): boolean {
  const homePrice = Number(inputs.homePrice);
  const downPayment = Number(inputs.downPayment);
  const interestRate = Number(inputs.interestRate);
  const loanTerm = Number(inputs.loanTerm);
  
  return (
    isFinite(homePrice) && homePrice > 0 &&
    isFinite(downPayment) && downPayment >= 0 && downPayment < homePrice &&
    isFinite(interestRate) && interestRate >= 0 &&
    isFinite(loanTerm) && loanTerm > 0
  );
}

/**
 * Type guard to check if inputs are valid mortgage calculator inputs
 * Validates that required mortgage input fields are present and have valid values
 * @param inputs - Inputs to validate
 * @returns Boolean indicating if inputs are valid for mortgage calculation
 */
export function isValidMortgageInputs(inputs: ParsedCalculatorInput): boolean {
  return (
    typeof inputs.homePrice === 'number' &&
    typeof inputs.downPayment === 'number' &&
    typeof inputs.interestRate === 'number' &&
    typeof inputs.loanTerm === 'number' &&
    inputs.homePrice > 0 &&
    inputs.downPayment >= 0 &&
    inputs.downPayment < inputs.homePrice &&
    inputs.interestRate >= 0 &&
    inputs.loanTerm > 0
  );
}
