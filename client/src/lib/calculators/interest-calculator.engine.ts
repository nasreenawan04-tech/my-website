import {
  InvestmentInputs,
  InvestmentCalculationResult,
  CalculatorFunction,
  CalculatorConfig,
  ParsedCalculatorInput,
  YearlyBreakdown,
  WhatIfScenario
} from '@/types/calculator.types';

export { ParsedCalculatorInput };

/**
 * Extended inputs for Compound Interest Calculator
 */
export interface CompoundInterestInputs extends InvestmentInputs {
  sipAmount?: number;
  sipFrequency?: number;
  stepUpPercentage?: number;
  goalAmount?: number;
  taxRate?: number;
  expenseRatio?: number;
}

/**
 * Extended result for Compound Interest Calculator
 */
export interface CompoundInterestResult extends InvestmentCalculationResult {
  principalAmount: number;
  totalContributions: number;
  realValue: number;
  inflationAdjustedGains: number;
  cagr: number;
  totalTaxPaid: number;
  postTaxReturns: number;
  totalFeesPaid: number;
  netReturnsAfterFees: number;
  doublingTime: number;
  milestones: {
    double: number | null;
    triple: number | null;
    fivex: number | null;
    tenx: number | null;
  };
  sipAnalysis?: {
    totalSIPContributions: number;
    sipInterestEarned: number;
    averageAnnualReturn: number;
  };
  goalAnalysis?: {
    timeToReachGoal: number;
    requiredMonthlyContribution: number;
    isGoalAchievable: boolean;
    goalAmount: number;
  };
}

/**
 * Compound Interest Calculator Engine
 */
export const calculateCompoundInterest: CalculatorFunction<CompoundInterestResult> = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): CompoundInterestResult => {
  const p = Number(inputs.principal) || 0;
  const r = (Number(inputs.interestRate) || 0) / 100;
  const t = inputs.timeUnit === 'years' ? (Number(inputs.timePeriod) || 0) : (Number(inputs.timePeriod) || 0) / 12;
  const n = Number(inputs.compoundFrequency) || 12;
  const sip = inputs.enableSIP ? (Number(inputs.sipAmount) || 0) : 0;
  const sipFreq = Number(inputs.sipFrequency) || 12;
  const stepUp = (Number(inputs.stepUpPercentage) || 0) / 100;
  const inflation = (Number(inputs.inflationRate) || 0) / 100;
  const taxRate = (Number(inputs.taxRate) || 0) / 100;
  const expenseRatio = (Number(inputs.expenseRatio) || 0) / 100;

  const years = Math.ceil(t);
  let currentAmount = p;
  let totalContributions = p;
  let totalSIPContributions = 0;
  let totalFeesPaid = 0;
  const yearlyBreakdown: YearlyBreakdown[] = [];

  for (let year = 1; year <= years; year++) {
    const isPartialYear = year > t;
    const yearDuration = isPartialYear ? t - (year - 1) : 1;

    const growthFactor = Math.pow((1 + r / n), n * yearDuration);
    const previousAmount = currentAmount;
    currentAmount *= growthFactor;

    let yearlyContributions = 0;
    if (sip > 0) {
      const periodsInYear = sipFreq * yearDuration;
      let currentSIP = sip;
      if (stepUp > 0 && year > 1) {
        currentSIP = sip * Math.pow(1 + stepUp, year - 1);
      }
      for (let period = 1; period <= periodsInYear; period++) {
        const remainingTime = yearDuration - (period / sipFreq);
        const contributionGrowth = remainingTime > 0 ? Math.pow((1 + r / n), n * remainingTime) : 1;
        currentAmount += currentSIP * contributionGrowth;
        totalSIPContributions += currentSIP;
        totalContributions += currentSIP;
        yearlyContributions += currentSIP;
      }
    }

    let yearlyFee = 0;
    if (expenseRatio > 0) {
      yearlyFee = currentAmount * expenseRatio * yearDuration;
      currentAmount -= yearlyFee;
      totalFeesPaid += yearlyFee;
    }

    const interestEarned = Math.max(0, currentAmount - previousAmount - yearlyContributions + yearlyFee);
    const realValue = currentAmount / Math.pow(1 + inflation, year);

    yearlyBreakdown.push({
      year,
      amount: currentAmount,
      interestEarned,
      totalInterest: currentAmount - totalContributions,
      sipContribution: sip > 0 ? (stepUp > 0 ? sip * Math.pow(1 + stepUp, year - 1) : sip) * sipFreq * yearDuration : 0,
      cumulativeContributions: totalContributions,
      realValue,
      principal: p,
      totalContributionsAtYear: totalContributions
    });
  }

  const finalAmount = currentAmount;
  const totalInterest = finalAmount - totalContributions;
  const totalTaxPaid = taxRate * Math.max(0, totalInterest);
  const realValue = finalAmount / Math.pow(1 + inflation, t);

  // Simple CAGR approximation
  const cagr = t > 0 && totalContributions > 0 ? ((Math.pow(finalAmount / totalContributions, 1 / t) - 1) * 100) : 0;

  const milestones = {
    double: null as number | null,
    triple: null as number | null,
    fivex: null as number | null,
    tenx: null as number | null
  };

  yearlyBreakdown.forEach((year) => {
    const multiple = (year.amount as number) / p;
    if (milestones.double === null && multiple >= 2) milestones.double = year.year;
    if (milestones.triple === null && multiple >= 3) milestones.triple = year.year;
    if (milestones.fivex === null && multiple >= 5) milestones.fivex = year.year;
    if (milestones.tenx === null && multiple >= 10) milestones.tenx = year.year;
  });

  return {
    primaryValue: finalAmount,
    formattedPrimaryValue: `$${finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    timestamp: new Date(),
    currency: 'USD',
    finalAmount,
    totalInterest,
    totalAmount: finalAmount,
    principalAmount: p,
    totalContributions,
    realValue,
    inflationAdjustedGains: realValue - totalContributions,
    cagr,
    totalTaxPaid,
    postTaxReturns: finalAmount - totalTaxPaid,
    totalFeesPaid,
    netReturnsAfterFees: finalAmount,
    doublingTime: r > 0 ? 72 / (r * 100) : 0,
    milestones,
    yearlyBreakdown,
    sipAnalysis: totalSIPContributions > 0 ? {
      totalSIPContributions,
      sipInterestEarned: Math.max(0, finalAmount - p - totalSIPContributions),
      averageAnnualReturn: cagr
    } : undefined
  };
};

/**
 * Extended result for Simple Interest Calculator
 */
export interface SimpleInterestResult extends InvestmentCalculationResult {
  simpleInterest: number;
  principalAmount: number;
  monthlyInterest: number;
}

/**
 * Simple Interest Calculator Engine
 */
export const calculateSimpleInterest: CalculatorFunction<SimpleInterestResult> = (
  inputs: ParsedCalculatorInput,
  config?: Partial<CalculatorConfig>
): SimpleInterestResult => {
  const p = Number(inputs.principal) || 0;
  const r = (Number(inputs.interestRate) || 0) / 100;
  const t = inputs.timeUnit === 'years' ? (Number(inputs.timePeriod) || 0) : (Number(inputs.timePeriod) || 0) / 12;

  const simpleInterest = p * r * t;
  const totalAmount = p + simpleInterest;
  const monthlyInterest = simpleInterest / (t * 12 || 1);

  const yearlyBreakdown: YearlyBreakdown[] = [];
  const years = Math.ceil(t);
  for (let year = 1; year <= years; year++) {
    const currentYearTime = Math.min(year, t);
    const previousYearTime = Math.min(year - 1, t);
    const cumulativeInterest = p * r * currentYearTime;
    const interestEarned = cumulativeInterest - (p * r * previousYearTime);
    
    yearlyBreakdown.push({
      year,
      amount: p + cumulativeInterest,
      interestEarned,
      totalInterest: cumulativeInterest,
      cumulativeInterest
    });
  }

  return {
    primaryValue: totalAmount,
    formattedPrimaryValue: `$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    timestamp: new Date(),
    currency: 'USD',
    simpleInterest,
    totalAmount,
    totalInterest: simpleInterest,
    principalAmount: p,
    monthlyInterest,
    yearlyBreakdown,
    finalAmount: totalAmount
  };
};
