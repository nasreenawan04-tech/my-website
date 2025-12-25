/**
 * Mortgage Calculator Engine - Typed calculation functions
 * Implements generic CalculatorFunction type with LoanInputs and LoanCalculationResult
 */

import {
  LoanInputs,
  LoanCalculationResult,
  ParsedCalculatorInput,
  AmortizationEntry,
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
  pmiRate: number;
  hoaFees: number;
  loanType?: 'conventional' | 'fha' | 'va';
  paymentFrequency?: 'monthly' | 'biweekly' | 'weekly';
  monthlyIncome?: number;
  closingCostPercent?: number;
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
  monthlyHOA: number;
  closingCosts: number;
  totalCashNeeded: number;
  loanToValue: number;
  debtToIncomeRatio?: number;
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
    pmiRate: Number(inputs.pmiRate) || 0,
    hoaFees: Number(inputs.hoaFees) || 0,
    extraPayment: Number(inputs.extraPayment) || 0,
    loanType: (inputs.loanType as 'conventional' | 'fha' | 'va') || 'conventional',
    paymentFrequency: (inputs.paymentFrequency as 'monthly' | 'biweekly' | 'weekly') || 'monthly',
    monthlyIncome: Number(inputs.monthlyIncome) || 0,
    closingCostPercent: Number(inputs.closingCostPercent) || 3
  };
}

/**
 * Calculate mortgage amortization with extra payments
 * @param principal - Loan amount (homePrice - downPayment)
 * @param annualRate - Annual interest rate as percentage
 * @param termYears - Loan term in years
 * @param extraPayment - Extra payment per period
 * @param loanType - Loan type (affects rate adjustments)
 * @param paymentFrequency - Payment frequency
 * @returns Amortization schedule entries
 */
export function calculateMortgageAmortization(
  principal: number,
  annualRate: number,
  termYears: number,
  extraPayment: number = 0,
  loanType: 'conventional' | 'fha' | 'va' = 'conventional',
  paymentFrequency: 'monthly' | 'biweekly' | 'weekly' = 'monthly'
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = [];

  const paymentsPerYear =
    paymentFrequency === 'weekly' ? 52 :
    paymentFrequency === 'biweekly' ? 26 :
    12;

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

  for (let period = 1; period <= totalPayments && currentBalance > 0.01; period++) {
    const interestPayment = currentBalance * adjustedRate;
    const principalPayment = Math.min(monthlyPI - interestPayment + extraPayment, currentBalance);

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
 * Calculate monthly PMI based on loan type and down payment
 * @param principal - Loan amount
 * @param homePrice - Home price
 * @param pmiRate - PMI rate as percentage
 * @param loanType - Loan type
 * @returns Monthly PMI amount
 */
export function calculateMonthlyPMI(
  principal: number,
  homePrice: number,
  pmiRate: number,
  loanType: 'conventional' | 'fha' | 'va'
): number {
  const downPaymentPercent = ((homePrice - principal) / homePrice) * 100;

  if (loanType === 'conventional' && downPaymentPercent < 20) {
    return (principal * (pmiRate / 100)) / 12;
  } else if (loanType === 'fha') {
    return (principal * 0.0085) / 12;
  }

  return 0;
}

/**
 * Main mortgage calculator engine function
 * Calculates monthly payment with all costs (PI, taxes, insurance, PMI, HOA)
 * @param inputs - Parsed mortgage calculator inputs
 * @param config - Optional calculator configuration
 * @returns Typed mortgage calculation result
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
    pmiRate = 0,
    hoaFees = 0,
    extraPayment = 0,
    loanType = 'conventional',
    paymentFrequency = 'monthly',
    monthlyIncome = 0,
    closingCostPercent = 3
  } = mortgageInputs;

  const principal = homePrice - downPayment;

  // Calculate payment frequency
  const paymentsPerYear =
    paymentFrequency === 'weekly' ? 52 :
    paymentFrequency === 'biweekly' ? 26 :
    12;

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
  const schedule = calculateMortgageAmortization(
    principal,
    interestRate,
    loanTerm,
    extraPayment,
    loanType,
    paymentFrequency
  );

  // Calculate totals from schedule
  const totalInterest = schedule.reduce((sum, entry) => sum + entry.interest, 0);
  const totalAmount = schedule.reduce((sum, entry) => sum + entry.payment, 0);

  // Calculate monthly housing costs
  const monthlyTaxes = propertyTax / 12;
  const monthlyInsuranceAmount = homeInsurance / 12;
  const monthlyPMI = calculateMonthlyPMI(principal, homePrice, pmiRate, loanType);
  const monthlyHOA = hoaFees;

  // Convert PI to monthly equivalent
  const monthlyPIEquivalent = monthlyPI * (paymentsPerYear / 12);
  const totalMonthlyPayment =
    monthlyPIEquivalent + monthlyTaxes + monthlyInsuranceAmount + monthlyPMI + monthlyHOA;

  // Calculate closing costs and total cash needed
  const closingCosts = (homePrice * closingCostPercent) / 100;
  const totalCashNeeded = downPayment + closingCosts;

  // Calculate loan-to-value ratio
  const loanToValue = (principal / homePrice) * 100;

  // Calculate debt-to-income ratio
  const debtToIncomeRatio = monthlyIncome > 0 ? (totalMonthlyPayment / monthlyIncome) * 100 : 0;

  // Calculate prepayment savings if extra payment
  let extraPaymentSavings: PrepaymentSavings | undefined;
  if (extraPayment > 0) {
    const regularTotalAmount = monthlyPI * totalPayments;
    const regularTotalInterest = regularTotalAmount - principal;
    const totalInterestWithExtra = schedule.reduce((sum, entry) => sum + entry.interest, 0);

    extraPaymentSavings = {
      timeSaved: Math.max(0, totalPayments - schedule.length),
      interestSaved: Math.max(0, regularTotalInterest - totalInterestWithExtra),
      newTotalInterest: totalInterestWithExtra,
      newPayoffTime: schedule.length,
      savingsPercentage:
        regularTotalInterest > 0
          ? ((regularTotalInterest - totalInterestWithExtra) / regularTotalInterest) * 100
          : 0
    };
  }

  return {
    monthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    amortizationSchedule: schedule,
    extraPaymentSavings,
    primaryValue: Math.round(totalMonthlyPayment * 100) / 100,
    formattedPrimaryValue: `$${(Math.round(totalMonthlyPayment * 100) / 100).toFixed(2)}`,
    timestamp: new Date(),
    currency: 'USD',
    homePrice,
    downPayment,
    monthlyPrincipalAndInterest: Math.round(monthlyPIEquivalent * 100) / 100,
    monthlyTaxes: Math.round(monthlyTaxes * 100) / 100,
    monthlyInsurance: Math.round(monthlyInsuranceAmount * 100) / 100,
    monthlyPMI: Math.round(monthlyPMI * 100) / 100,
    monthlyHOA: Math.round(monthlyHOA * 100) / 100,
    closingCosts: Math.round(closingCosts * 100) / 100,
    totalCashNeeded: Math.round(totalCashNeeded * 100) / 100,
    loanToValue: Math.round(loanToValue * 100) / 100,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
    paymentFrequency,
    monthlyPaymentEquivalent: Math.round(totalMonthlyPayment * 100) / 100,
    termInMonths: loanTerm * 12,
    paymentsPerYear
  };
};

/**
 * Type guard to check if inputs are valid mortgage calculator inputs
 */
export function isValidMortgageInputs(inputs: ParsedCalculatorInput): inputs is MortgageCalculatorInputs {
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
