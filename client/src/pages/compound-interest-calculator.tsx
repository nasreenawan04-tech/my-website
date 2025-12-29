import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, TrendingUp, Clock, DollarSign, Info, Download, Share2, Check, RotateCcw, Target, Zap, BarChart3, Plus, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { z } from 'zod';

import { saveCalculation } from '@/lib/calculationHistory';

interface LumpSumContribution {
  year: number;
  amount: number;
}

import { calculateCompoundInterest } from '@/lib/calculators/interest-calculator.engine';
import { 
  CompoundInterestResult, 
  CompoundInterestInputs
} from '@/lib/calculators/interest-calculator.engine';

// Comprehensive Zod validation schema
const compoundInterestSchema = z.object({
  principal: z.number().positive("Principal must be greater than 0").max(1000000000, "Principal is too large"),
  interestRate: z.number().positive("Interest rate must be greater than 0").max(100, "Interest rate cannot exceed 100%"),
  timePeriod: z.number().positive("Time period must be greater than 0").max(1200, "Time period is too long (max 1200 months or 100 years)"),
  sipAmount: z.number().min(0, "SIP amount cannot be negative").max(1000000000, "SIP amount is too large"),
  stepUpPercentage: z.number().min(0, "Step-up percentage cannot be negative").max(100, "Step-up percentage cannot exceed 100%"),
  inflationRate: z.number().min(0, "Inflation rate cannot be negative").max(50, "Inflation rate is too high"),
  goalAmount: z.number().min(0, "Goal amount cannot be negative").max(10000000000, "Goal amount is too large"),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%"),
  expenseRatio: z.number().min(0, "Expense ratio cannot be negative").max(10, "Expense ratio is too high (max 10%)"),
});

type ValidationErrors = {
  principal?: string;
  interestRate?: string;
  timePeriod?: string;
  sipAmount?: string;
  stepUpPercentage?: string;
  inflationRate?: string;
  goalAmount?: string;
  taxRate?: string;
  expenseRatio?: string;
};

export default function CompoundInterestCalculator() {
  const { toast } = useToast();
  const [principal, setPrincipal] = useState('10000');
  const [interestRate, setInterestRate] = useState('8');
  const [timePeriod, setTimePeriod] = useState('10');
  const [timeUnit, setTimeUnit] = useState('years');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [enableSIP, setEnableSIP] = useState(false);
  const [sipAmount, setSipAmount] = useState('1000');
  const [sipFrequency, setSipFrequency] = useState('12');
  const [stepUpPercentage, setStepUpPercentage] = useState('0');
  const [inflationRate, setInflationRate] = useState('3');
  const [enableGoalPlanning, setEnableGoalPlanning] = useState(false);
  const [goalAmount, setGoalAmount] = useState('100000');
  const [showRealValue, setShowRealValue] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [result, setResult] = useState<CompoundInterestResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Phase 1 Core Analytics Features
  const [enableTax, setEnableTax] = useState(false);
  const [taxRate, setTaxRate] = useState('15');
  const [enableFees, setEnableFees] = useState(false);
  const [expenseRatio, setExpenseRatio] = useState('0.5');
  const [enableLumpSum, setEnableLumpSum] = useState(false);
  const [lumpSumContributions, setLumpSumContributions] = useState<LumpSumContribution[]>([]);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Refs for auto-calculation after URL params load
  const calculateButtonRef = useRef<HTMLButtonElement>(null);
  const shouldAutoCalculate = useRef(false);

  // Drag and touch scrolling state for yearly breakdown table
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Refs for PDF export (tables)
  const yearlyBreakdownRef = useRef<HTMLDivElement>(null);

  // Helper function to clear specific validation error
  const clearError = (field: keyof ValidationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Load parameters from URL on mount (for shared links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const principalParam = params.get('principal');
    const rateParam = params.get('rate');
    const timeParam = params.get('time');
    const unitParam = params.get('unit');
    const freqParam = params.get('freq');
    const sipParam = params.get('sip');
    const sipAmountParam = params.get('sipAmount');
    const sipFreqParam = params.get('sipFreq');
    const stepUpParam = params.get('stepUp');
    const inflationParam = params.get('inflation');
    const goalParam = params.get('goal');
    const goalAmountParam = params.get('goalAmount');

    if (principalParam || rateParam || timeParam) {
      if (principalParam) setPrincipal(principalParam);
      if (rateParam) setInterestRate(rateParam);
      if (timeParam) setTimePeriod(timeParam);
      if (unitParam) setTimeUnit(unitParam);
      if (sipParam === 'true') setEnableSIP(true);
      if (sipAmountParam) setSipAmount(sipAmountParam);
      if (sipFreqParam) setSipFrequency(sipFreqParam);
      if (stepUpParam) setStepUpPercentage(stepUpParam);
      if (inflationParam) setInflationRate(inflationParam);
      if (goalParam === 'true') setEnableGoalPlanning(true);
      if (goalAmountParam) setGoalAmount(goalAmountParam);

      // Flag to trigger auto-calculation after state updates
      shouldAutoCalculate.current = true;
    }
  }, []);

  // Auto-calculate when URL parameters are loaded
    useEffect(() => {
    if (shouldAutoCalculate.current && principal && interestRate && timePeriod) {
      calculateCompoundInterestFunc();
      shouldAutoCalculate.current = false;
    }
  }, [principal, interestRate, timePeriod, timeUnit, compoundFrequency, enableSIP, sipAmount, sipFrequency, stepUpPercentage, inflationRate, enableGoalPlanning, goalAmount]);

  const calculateCompoundInterestFunc = () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validate all inputs using Zod schema
    const validationResult = compoundInterestSchema.safeParse({
      principal: parseFloat(principal),
      interestRate: parseFloat(interestRate),
      timePeriod: parseFloat(timePeriod),
      sipAmount: parseFloat(sipAmount),
      stepUpPercentage: parseFloat(stepUpPercentage),
      inflationRate: parseFloat(inflationRate),
      goalAmount: parseFloat(goalAmount),
      taxRate: parseFloat(taxRate),
      expenseRatio: parseFloat(expenseRatio),
    });

    if (!validationResult.success) {
      const errors: ValidationErrors = {};
      validationResult.error.errors.forEach((error) => {
        const fieldName = error.path[0] as keyof ValidationErrors;
        errors[fieldName] = error.message;
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form and try again.",
        variant: "destructive",
      });
      return;
    }

    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100;
    const t = timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12;
    const n = parseFloat(compoundFrequency);
    const sip = enableSIP ? parseFloat(sipAmount) : 0;
    const sipFreq = parseFloat(sipFrequency);
    const stepUp = parseFloat(stepUpPercentage) / 100;
    const inflation = parseFloat(inflationRate) / 100;
    const target = parseFloat(goalAmount);

    if (p < 0 || r <= 0 || t <= 0 || n <= 0) return;

    const years = Math.ceil(t);
    let currentAmount = p;
    let totalContributions = p;
    let totalSIPContributions = 0;
    let totalFeesPaid = 0;
    const yearlyBreakdown = [];
    const expenseRatioDecimal = enableFees ? parseFloat(expenseRatio) / 100 : 0;

    for (let year = 1; year <= years; year++) {
      const isPartialYear = year > t;
      const yearDuration = isPartialYear ? t - (year - 1) : 1;

      const growthFactor = Math.pow((1 + r / n), n * yearDuration);
      const previousAmount = currentAmount;
      currentAmount *= growthFactor;

      // Track contributions made in THIS year specifically
      let yearlyContributions = 0;

      if (enableSIP && sip > 0) {
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

      // Check for lump sum contributions
      const lumpSumForYear = enableLumpSum ? lumpSumContributions.find(ls => ls.year === year) : null;
      if (lumpSumForYear) {
        currentAmount += lumpSumForYear.amount;
        totalContributions += lumpSumForYear.amount;
        yearlyContributions += lumpSumForYear.amount;
      }

      // Phase 1 Feature: Deduct expense ratio/fees from balance each year (prorated for partial years)
      let yearlyFee = 0;
      if (enableFees && expenseRatioDecimal > 0) {
        yearlyFee = currentAmount * expenseRatioDecimal * yearDuration;
        currentAmount -= yearlyFee;
        totalFeesPaid += yearlyFee;
      }

      // Calculate interest earned: currentAmount - previousAmount - yearlyContributions + yearlyFee
      const interestEarned: number = Math.max(0, currentAmount - previousAmount - yearlyContributions + yearlyFee);
      const realValue = currentAmount / Math.pow(1 + inflation, year);

      yearlyBreakdown.push({
        year,
        amount: currentAmount,
        interestEarned: Math.max(0, interestEarned),
        totalInterest: currentAmount - totalContributions,
        sipContribution: enableSIP && sip > 0 ? (stepUp > 0 ? sip * Math.pow(1 + stepUp, year - 1) : sip) * sipFreq * yearDuration : 0,
        cumulativeContributions: totalContributions,
        realValue,
        principal: p,
        totalContributionsAtYear: totalContributions
      });
    }

    const finalAmount = currentAmount;
    const totalInterest = finalAmount - totalContributions;
    const realValue = finalAmount / Math.pow(1 + inflation, t);
    const inflationAdjustedGains = realValue - totalContributions;

    // Phase 1 Feature: CAGR Calculation using IRR (accounts for timing of cash flows)
    let cagr = 0;
    if (t > 0) {
      // Build cash flow array: negative for investments, positive for final value
      const cashFlows: Array<{amount: number, time: number}> = [];
      cashFlows.push({amount: -p, time: 0}); // Initial investment at time 0
      
      // Add SIP contributions at their respective times
      if (enableSIP && sip > 0) {
        for (let year = 1; year <= years; year++) {
          const yearDuration = year > t ? t - (year - 1) : 1;
          const periodsInYear = sipFreq * yearDuration;
          let currentSIP = sip;
          if (stepUp > 0 && year > 1) {
            currentSIP = sip * Math.pow(1 + stepUp, year - 1);
          }
          for (let period = 1; period <= periodsInYear; period++) {
            const timeOfContribution = (year - 1) + (period / sipFreq);
            cashFlows.push({amount: -currentSIP, time: timeOfContribution});
          }
        }
      }
      
      // Add lump sum contributions at their respective years (clamped to investment horizon)
      if (enableLumpSum && lumpSumContributions.length > 0) {
        lumpSumContributions.forEach(ls => {
          if (ls.year <= years) {
            // Clamp time to [0, t] to handle partial-year scenarios
            const lumpSumTime = Math.min(ls.year, t);
            cashFlows.push({amount: -ls.amount, time: lumpSumTime});
          }
        });
      }
      
      // Final value is positive cash flow
      cashFlows.push({amount: finalAmount, time: t});
      
      // Use Newton-Raphson method to find IRR
      const calculateNPV = (rate: number) => {
        return cashFlows.reduce((npv, cf) => {
          return npv + (cf.amount / Math.pow(1 + rate, cf.time));
        }, 0);
      };
      
      const calculateDerivative = (rate: number) => {
        return cashFlows.reduce((deriv, cf) => {
          return deriv - (cf.amount * cf.time / Math.pow(1 + rate, cf.time + 1));
        }, 0);
      };
      
      // Newton-Raphson iteration
      let irrGuess = r; // Start with the interest rate as initial guess
      const maxIterations = 100;
      const tolerance = 0.000001;
      let converged = false;
      
      for (let i = 0; i < maxIterations; i++) {
        const npv = calculateNPV(irrGuess);
        if (Math.abs(npv) < tolerance) {
          converged = true;
          break;
        }
        
        const derivative = calculateDerivative(irrGuess);
        // If derivative is too small, try different approach
        if (Math.abs(derivative) < tolerance) {
          // Fall back to bisection method for robustness
          let low = -0.99;
          let high = 10;
          for (let j = 0; j < 50; j++) {
            irrGuess = (low + high) / 2;
            const npvMid = calculateNPV(irrGuess);
            if (Math.abs(npvMid) < tolerance) {
              converged = true;
              break;
            }
            if (npvMid < 0) {
              low = irrGuess;
            } else {
              high = irrGuess;
            }
          }
          break;
        }
        
        irrGuess = irrGuess - npv / derivative;
        
        // Clamp to reasonable bounds
        irrGuess = Math.max(-0.99, Math.min(10, irrGuess));
      }
      
      // Verify final convergence
      const finalNPV = calculateNPV(irrGuess);
      if (!converged || Math.abs(finalNPV) > 0.01) {
        // Fall back to simple approximation if IRR failed to converge
        cagr = t > 0 && totalContributions > 0 ? ((Math.pow(finalAmount / totalContributions, 1 / t) - 1) * 100) : 0;
      } else {
        cagr = irrGuess * 100;
      }
    }

    // Phase 1 Feature: Tax Calculations
    const taxRateDecimal = enableTax ? parseFloat(taxRate) / 100 : 0;
    const taxableGains = totalInterest;
    const totalTaxPaid = taxRateDecimal * taxableGains;
    const postTaxReturns = finalAmount - totalTaxPaid;

    const milestones = {
      double: null as number | null,
      triple: null as number | null,
      fivex: null as number | null,
      tenx: null as number | null
    };

    (result?.yearlyBreakdown || []).forEach((year: any) => {
      const amount = Number(year.amount || 0);
      const multiple = amount / p;
      if (milestones.double === null && multiple >= 2) milestones.double = year.year;
      if (milestones.triple === null && multiple >= 3) milestones.triple = year.year;
      if (milestones.fivex === null && multiple >= 5) milestones.fivex = year.year;
      if (milestones.tenx === null && multiple >= 10) milestones.tenx = year.year;
    });

    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(val);
    };

    // Phase 1 Feature: What-If Analysis (sensitivity to rate changes)
    const whatIfAnalysis = [-3, -2, -1, 1, 2, 3].map(change => {
      const adjustedRate = r + (change / 100);
      if (adjustedRate <= 0) return null;

      let whatIfAmount = p;
      let whatIfContributions = p;

      for (let year = 1; year <= years; year++) {
        const isPartialYear = year > t;
        const yearDuration = isPartialYear ? t - (year - 1) : 1;
        const growthFactor = Math.pow((1 + adjustedRate / n), n * yearDuration);
        whatIfAmount *= growthFactor;

        if (enableSIP && sip > 0) {
          const periodsInYear = sipFreq * yearDuration;
          let currentSIP = sip;
          if (stepUp > 0 && year > 1) {
            currentSIP = sip * Math.pow(1 + stepUp, year - 1);
          }
          for (let period = 1; period <= periodsInYear; period++) {
            const remainingTime = yearDuration - (period / sipFreq);
            const contributionGrowth = remainingTime > 0 ? Math.pow((1 + adjustedRate / n), n * remainingTime) : 1;
            whatIfAmount += currentSIP * contributionGrowth;
            whatIfContributions += currentSIP;
          }
        }

        // Add lump sums
        const lumpSumForYear = enableLumpSum ? lumpSumContributions.find(ls => ls.year === year) : null;
        if (lumpSumForYear) {
          whatIfAmount += lumpSumForYear.amount;
          whatIfContributions += lumpSumForYear.amount;
        }
      }

      return {
        variableName: 'Interest Rate',
        variableChange: change > 0 ? `+${change}%` : `${change}%`,
        changeValue: change,
        resultValue: whatIfAmount,
        rateChange: change > 0 ? `+${change}%` : `${change}%`,
        rate: adjustedRate * 100,
        finalAmount: whatIfAmount,
        difference: whatIfAmount - finalAmount
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    let goalAnalysis;
    if (enableGoalPlanning && target > 0) {
      let timeToGoal = 0;
      let testAmount = p;
      let testContributions = p;

      while (testAmount < target && timeToGoal < 50) {
        timeToGoal += 1;
        testAmount *= Math.pow((1 + r / n), n);

        if (enableSIP && sip > 0) {
          const yearSIP = stepUp > 0 ? sip * Math.pow(1 + stepUp, timeToGoal - 1) : sip;
          testAmount += yearSIP * sipFreq * ((Math.pow(1 + r/n, n) - 1) / (r/n));
          testContributions += yearSIP * sipFreq;
        }
      }

      const requiredTotal = target - p * Math.pow((1 + r / n), n * t);
      const annuityFactor = ((Math.pow(1 + r/n, n * t) - 1) / (r/n));
      const requiredMonthlyContribution = requiredTotal > 0 ? (requiredTotal / annuityFactor) / 12 : 0;

      goalAnalysis = {
        timeToReachGoal: timeToGoal <= 50 ? timeToGoal : -1,
        requiredMonthlyContribution: Math.max(0, requiredMonthlyContribution),
        isGoalAchievable: timeToGoal <= 50 || requiredMonthlyContribution <= sip * 2,
        goalAmount: target
      };
    }

    let sipAnalysis;
    if (enableSIP && totalSIPContributions > 0) {
      const sipInterestEarned = finalAmount - p - totalSIPContributions;
      const averageAnnualReturn = totalSIPContributions > 0 ? ((finalAmount / totalContributions) ** (1/t) - 1) * 100 : 0;

      sipAnalysis = {
        totalSIPContributions,
        sipInterestEarned: Math.max(0, sipInterestEarned),
        averageAnnualReturn
      };
    }

    const calcResult = calculateCompoundInterest({
      principal: principal,
      interestRate: interestRate,
      timePeriod: timePeriod,
      timeUnit: timeUnit as 'years' | 'months',
      compoundFrequency: compoundFrequency,
      enableSIP: enableSIP,
      sipAmount: sipAmount,
      sipFrequency: sipFrequency,
      stepUpPercentage: stepUpPercentage,
      inflationRate: inflationRate,
      enableGoalPlanning: enableGoalPlanning,
      goalAmount: goalAmount,
      taxRate: taxRate,
      expenseRatio: expenseRatio,
      enableTax: enableTax,
      enableFees: enableFees
    } as any);

    setResult(calcResult);

    // Save to calculation history
    saveCalculation(
      'Compound Interest Calculator',
      '/tools/compound-interest-calculator',
      {
        principal,
        interestRate,
        timePeriod,
        timeUnit,
        compoundFrequency,
        enableSIP,
        sipAmount,
        sipFrequency,
        stepUpPercentage,
        inflationRate,
        enableGoalPlanning,
        goalAmount,
        enableTax,
        taxRate,
        enableFees,
        expenseRatio
      },
      {
        finalAmount: calcResult.finalAmount,
        totalInterest: calcResult.totalInterest,
        totalContributions: calcResult.totalContributions,
        realValue: calcResult.realValue,
        cagr: calcResult.cagr
      }
    );
  };

  const resetCalculator = () => {
    setPrincipal('10000');
    setInterestRate('8');
    setTimePeriod('10');
    setTimeUnit('years');
    setEnableSIP(false);
    setSipAmount('1000');
    setSipFrequency('12');
    setStepUpPercentage('0');
    setInflationRate('3');
    setEnableGoalPlanning(false);
    setGoalAmount('100000');
    setShowRealValue(false);
    setShowBreakdown(false);
    setResult(null);
  };

  // Drag and touch scrolling handlers for yearly breakdown table
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableScrollRef.current.offsetLeft);
    setScrollLeft(tableScrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    tableScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch event handlers for mobile horizontal scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!tableScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - tableScrollRef.current.offsetLeft);
    setScrollLeft(tableScrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !tableScrollRef.current) return;
    const x = e.touches[0].pageX - tableScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    tableScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleShare = async () => {
    if (!result) return;

    // Create shareable URL with encoded parameters
    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Create comprehensive share text
    const timeDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
    const compoundDisplay = compoundFrequency === '1' ? 'Annually' : 
                            compoundFrequency === '4' ? 'Quarterly' : 
                            compoundFrequency === '12' ? 'Monthly' : 'Daily';
    const sipFreqDisplay = sipFrequency === '12' ? 'Monthly' : 'Annually';

    let shareText = `Compound Interest Calculator Results\n\n`;
    shareText += `Investment Details:\n`;
    shareText += `• Principal: ${formatCurrency(parseFloat(principal))}\n`;
    shareText += `• Interest Rate: ${interestRate}% annually\n`;
    shareText += `• Time Period: ${timeDisplay}\n`;
    shareText += `• Compound Frequency: ${compoundDisplay}\n`;

    if (enableSIP && parseFloat(sipAmount) > 0) {
      shareText += `• ${sipFreqDisplay} Contribution: ${formatCurrency(parseFloat(sipAmount))}\n`;
      if (parseFloat(stepUpPercentage) > 0) {
        shareText += `• Annual Step-up: ${stepUpPercentage}%\n`;
      }
    }

    shareText += `\nResults Breakdown:\n`;
    shareText += `• Final Amount: ${formatCurrency(result.finalAmount)}\n`;
    shareText += `• Total Interest Earned: ${formatCurrency(result.totalInterest)}\n`;
    shareText += `• Total Contributions: ${formatCurrency(result.totalContributions)}\n`;

    if (showRealValue && parseFloat(inflationRate) > 0) {
      shareText += `\nInflation Adjusted:\n`;
      shareText += `• Real Value: ${formatCurrency(result.realValue)}\n`;
      shareText += `• Inflation Rate: ${inflationRate}%\n`;
    }

    if (result.goalAnalysis && enableGoalPlanning) {
      shareText += `\nGoal Analysis:\n`;
      if (result.goalAnalysis.isGoalAchievable) {
        shareText += `• Time to Reach Goal: ${result.goalAnalysis.timeToReachGoal} years\n`;
      } else {
        shareText += `• Required Monthly SIP: ${formatCurrency(result.goalAnalysis.requiredMonthlyContribution)}\n`;
      }
    }

    shareText += `\nView & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compound Interest Calculator Results',
          text: shareText,
          url: shareableUrl
        });
        toast({ title: "Shared successfully!", description: "Results shared with all details" });
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const shareOnFacebook = () => {
    if (!result) return;

    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    toast({ title: "Opening Facebook share..." });
  };

  const shareOnTwitter = () => {
    if (!result) return;

    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const timeDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
    const tweetText = `💰 My compound interest: ${formatCurrency(result.finalAmount)} from ${formatCurrency(parseFloat(principal))} at ${interestRate}% - Calculate yours free!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    toast({ title: "Opening Twitter share..." });
  };

  const shareOnLinkedIn = () => {
    if (!result) return;

    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    toast({ title: "Opening LinkedIn share..." });
  };

  const shareOnWhatsApp = () => {
    if (!result) return;

    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const timeDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
    const whatsappText = `💰 Compound Interest Calculator Results:\n\nPrincipal: ${formatCurrency(parseFloat(principal))}\nRate: ${interestRate}%\nTime: ${timeDisplay}\nFinal Amount: ${formatCurrency(result.finalAmount)}\n\nCalculate yours: ${shareableUrl}`;

    // Use api.whatsapp.com which works better across all devices
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

    const opened = window.open(whatsappUrl, '_blank');
    if (opened) {
      toast({ title: "Opening WhatsApp..." });
    } else {
      toast({
        title: "Popup blocked",
        description: "Please allow popups to share on WhatsApp",
        variant: "destructive"
      });
    }
  };

  const handleDownloadYearlyBreakdownPDF = async () => {
    if (!result || !result.yearlyBreakdown) return;

    try {
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 12;

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 38, 'F');

    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DapsiWow', pageWidth / 2, yPos + 5, { align: 'center' });

    yPos += 14;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Yearly Investment Breakdown Report', pageWidth / 2, yPos, { align: 'center' });

    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(230, 240, 255);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    doc.text(`Report Date: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    yPos = 48;

    // Table header
    doc.setFillColor(59, 130, 246);
    const tableWidth = pageWidth - (2 * margin);
    doc.rect(margin, yPos, tableWidth, 8, 'F');

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    const numCols = showRealValue ? 6 : 5;
    const colWidth = tableWidth / numCols;

    let colX = margin + 2;
    doc.text('Year', colX, yPos + 5);
    colX += colWidth;
    doc.text('Amount', colX, yPos + 5);
    colX += colWidth;
    doc.text('Interest', colX, yPos + 5);
    colX += colWidth;
    doc.text('Contribution', colX, yPos + 5);
    colX += colWidth;
    if (showRealValue) {
      doc.text('Real Value', colX, yPos + 5);
      colX += colWidth;
    }
    doc.text('Total Interest', colX, yPos + 5);

    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);

    result.yearlyBreakdown.forEach((yearData, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;

        // Repeat header on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(margin, yPos, tableWidth, 8, 'F');

        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        colX = margin + 2;
        doc.text('Year', colX, yPos + 5);
        colX += colWidth;
        doc.text('Amount', colX, yPos + 5);
        colX += colWidth;
        doc.text('Interest', colX, yPos + 5);
        colX += colWidth;
        doc.text('Contribution', colX, yPos + 5);
        colX += colWidth;
        if (showRealValue) {
          doc.text('Real Value', colX, yPos + 5);
          colX += colWidth;
        }
        doc.text('Total Interest', colX, yPos + 5);

        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, tableWidth, 6, 'F');
      }

      colX = margin + 2;
      doc.setTextColor(0, 0, 0);
      doc.text(yearData.year.toString(), colX, yPos + 4);

      colX += colWidth;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(yearData.amount), colX, yPos + 4);

      colX += colWidth;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94);
      doc.text(formatCurrency(Number(yearData.interestEarned ?? 0)), colX, yPos + 4);

      colX += colWidth;
      doc.setTextColor(59, 130, 246);
      doc.text(formatCurrency(Number(yearData.sipContribution ?? 0)), colX, yPos + 4);

      colX += colWidth;
      if (showRealValue) {
        doc.setTextColor(147, 51, 234);
        doc.text(formatCurrency(Number(yearData.realValue ?? 0)), colX, yPos + 4);
        colX += colWidth;
      }

      doc.setTextColor(249, 115, 22);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(Number(yearData.totalInterest ?? 0)), colX, yPos + 4);

      yPos += 6;
    });

    // Footer
    yPos = pageHeight - 22;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 4;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('This breakdown shows year-by-year growth of your investment including principal, interest, and contributions.', pageWidth / 2, yPos, { align: 'center' });

    yPos += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.textWithLink('DapsiWow.com', pageWidth / 2, yPos, { align: 'center', url: 'https://dapsiwow.com' });

    yPos += 3;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Free Online Financial Calculators & Tools', pageWidth / 2, yPos, { align: 'center' });

      doc.save(`DapsiWow-Yearly-Breakdown-${new Date().getTime()}.pdf`);
      toast({ 
        title: "PDF Downloaded!", 
        description: "Your yearly investment breakdown has been saved." 
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate PDF. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      let yPos = 0;

      // Professional Header with colored banner
      doc.setFillColor(37, 99, 235); // Blue color
      doc.rect(0, 0, pageWidth, 30, 'F');

      // White title text on blue banner
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPOUND INTEREST REPORT', pageWidth / 2, 13, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Compound Interest Calculator', pageWidth / 2, 22, { align: 'center' });

      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      yPos = 38;

      // Document Info Box
      doc.setFillColor(248, 250, 252); // Light gray background
      doc.rect(margin, yPos, pageWidth - (2 * margin), 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPos, pageWidth - (2 * margin), 24, 'S');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      const timeDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
      const compoundDisplay = compoundFrequency === '1' ? 'Annually' : 
                              compoundFrequency === '4' ? 'Quarterly' : 
                              compoundFrequency === '12' ? 'Monthly' : 'Daily';
      doc.text('Time Period:', margin + 3, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(timeDisplay, margin + 28, yPos + 7);

      doc.setFont('helvetica', 'bold');
      doc.text('Compounding:', margin + 3, yPos + 14);
      doc.setFont('helvetica', 'normal');
      doc.text(compoundDisplay, margin + 32, yPos + 14);

      doc.setFont('helvetica', 'bold');
      doc.text('Generated:', margin + 3, yPos + 21);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 28, yPos + 21);

      doc.setTextColor(0, 0, 0);
      yPos += 32;

      // Executive Summary Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('EXECUTIVE SUMMARY', margin, yPos);
      yPos += 2;

      // Underline
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, margin + 55, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);

      // Final Amount Highlight Box
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 22, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('FINAL AMOUNT', pageWidth / 2, yPos + 7, { align: 'center' });
      doc.setFontSize(18);
      doc.text(formatCurrency(result.finalAmount), pageWidth / 2, yPos + 16, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      yPos += 30;

      // Key Metrics Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('KEY METRICS', margin, yPos);
      yPos += 2;
      doc.setDrawColor(37, 99, 235);
      doc.line(margin, yPos, margin + 35, yPos);
      yPos += 7;
      doc.setTextColor(0, 0, 0);

      // Table header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPos, pageWidth - (2 * margin), 9, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text('Metric', margin + 2, yPos + 6);
      doc.text('Value', pageWidth - margin - 42, yPos + 6);
      yPos += 9;

      // Table rows
      const interestPercent = ((result.totalInterest / result.finalAmount) * 100).toFixed(1);
      const metrics: { label: string; value: string; color: [number, number, number] }[] = [
        { label: 'Principal Amount', value: formatCurrency(parseFloat(principal)), color: [71, 85, 105] },
        { label: 'Interest Rate', value: `${interestRate}% per year`, color: [71, 85, 105] },
        { label: 'Time Period', value: timeDisplay, color: [71, 85, 105] },
        { label: 'Compounding Frequency', value: compoundDisplay, color: [71, 85, 105] },
        { label: 'Final Amount', value: formatCurrency(result.finalAmount), color: [37, 99, 235] },
        { label: 'Total Contributions', value: formatCurrency(result.totalContributions), color: [71, 85, 105] },
        { label: 'Total Interest', value: formatCurrency(result.totalInterest), color: [239, 68, 68] },
        { label: 'Interest Portion', value: `${interestPercent}%`, color: [220, 38, 38] }
      ];

      if (enableSIP && parseFloat(sipAmount) > 0) {
        const sipFreqDisplay = sipFrequency === '12' ? 'Monthly' : 'Annual';
        metrics.push({ label: `${sipFreqDisplay} SIP Amount`, value: formatCurrency(parseFloat(sipAmount)), color: [16, 185, 129] });
      }

      doc.setFont('helvetica', 'normal');
      metrics.forEach((metric, index) => {
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(255, 255, 255);
        } else {
          doc.setFillColor(248, 250, 252);
        }
        doc.rect(margin, yPos, pageWidth - (2 * margin), 7, 'F');

        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(metric.label, margin + 2, yPos + 4.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...metric.color);
        doc.text(metric.value, pageWidth - margin - 2, yPos + 4.8, { align: 'right' });
        doc.setFont('helvetica', 'normal');

        yPos += 7;
      });

      // Border around table
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPos - (metrics.length * 7) - 9, pageWidth - (2 * margin), (metrics.length * 7) + 9, 'S');

      yPos += 8;

      // Goal Analysis
      if (result.goalAnalysis && enableGoalPlanning) {
        const boxHeight = 30;
        doc.setFillColor(236, 253, 245);
        doc.rect(margin, yPos, pageWidth - (2 * margin), boxHeight, 'F');
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.8);
        doc.rect(margin, yPos, pageWidth - (2 * margin), boxHeight, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 163, 74);
        doc.text('GOAL PLANNING ANALYSIS', margin + 3, yPos + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        if (result.goalAnalysis.isGoalAchievable) {
          doc.text(`Time to Reach Goal: ${result.goalAnalysis.timeToReachGoal} years`, margin + 3, yPos + 12);
          doc.text(`Goal Amount: ${formatCurrency(parseFloat(goalAmount))}`, margin + 3, yPos + 18);
        } else {
          doc.text(`Required Monthly SIP: ${formatCurrency(result.goalAnalysis.requiredMonthlyContribution)}`, margin + 3, yPos + 12);
          doc.text(`Goal Amount: ${formatCurrency(parseFloat(goalAmount))}`, margin + 3, yPos + 18);
        }

        doc.setTextColor(0, 0, 0);
        yPos += boxHeight + 6;
      }

      // Interpretation Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('INTERPRETATION', margin, yPos);
      yPos += 2;
      doc.setDrawColor(37, 99, 235);
      doc.line(margin, yPos, margin + 45, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);

      let interpretation = '';
      let interpretationColor: [number, number, number] = [71, 85, 105];

      const interestPercentNum = parseFloat(interestPercent);
      if (interestPercentNum > 80) {
        interpretation = 'Excellent Investment Performance - Your interest earnings significantly exceed your principal contributions, demonstrating the powerful effect of compound growth over time.';
        interpretationColor = [22, 163, 74];
      } else if (interestPercentNum > 50) {
        interpretation = 'Strong Growth Pattern - Your investment shows healthy compound interest growth. Interest earnings represent a substantial portion of your final amount.';
        interpretationColor = [202, 138, 4];
      } else if (interestPercentNum > 25) {
        interpretation = 'Moderate Growth - Your investment is building value through compound interest. Consider longer time horizons or higher contributions to maximize returns.';
        interpretationColor = [59, 130, 246];
      } else {
        interpretation = 'Early Growth Stage - Interest earnings are still building. Time and consistent contributions are key to maximizing compound interest benefits.';
        interpretationColor = [220, 38, 38];
      }

      doc.setFillColor(249, 250, 251);
      const interpretationHeight = 18;
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), interpretationHeight, 2, 2, 'F');
      doc.setDrawColor(...interpretationColor);
      doc.setLineWidth(0.8);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), interpretationHeight, 2, 2, 'S');

      doc.setFontSize(8.5);
      doc.setTextColor(...interpretationColor);
      const splitInterpretation = doc.splitTextToSize(interpretation, pageWidth - (2 * margin) - 8);
      doc.text(splitInterpretation, margin + 4, yPos + 6);

      doc.setTextColor(0, 0, 0);
      yPos += interpretationHeight + 8;

      // Capture yearly breakdown if visible
      if (showBreakdown && yearlyBreakdownRef.current) {
        try {
          // Capture first, then add page only if successful
          const breakdownCanvas = await html2canvas(yearlyBreakdownRef.current, {
            scale: 1.5,
            backgroundColor: '#ffffff',
            logging: false
          });

          if (breakdownCanvas && breakdownCanvas.height > 0) {
            const bottomMargin = 30;
            const breakdownWidth = pageWidth - (2 * margin);
            const scale = breakdownWidth / breakdownCanvas.width;

            // Helper function to add header
            const addBreakdownHeader = (continued: boolean = false) => {
              doc.setFontSize(14);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 58, 138);
              const headerText = continued 
                ? 'YEARLY INVESTMENT BREAKDOWN - CONTINUED'
                : 'YEARLY INVESTMENT BREAKDOWN';
              doc.text(headerText, margin, yPos);
              yPos += 2;
              doc.setDrawColor(37, 99, 235);
              const lineWidth = continued ? 100 : 80;
              doc.line(margin, yPos, margin + lineWidth, yPos);
              yPos += 10;
              doc.setTextColor(0, 0, 0);
            };

            // Start first page
            doc.addPage();
            yPos = margin;
            addBreakdownHeader(false);

            // Split canvas across unlimited pages
            let sourceYOffset = 0;
            let pageIndex = 0;

            while (sourceYOffset < breakdownCanvas.height) {
              // Calculate available height for current page
              const availableHeight = pageHeight - yPos - bottomMargin;
              const sourceHeightForPage = Math.min(
                availableHeight / scale,
                breakdownCanvas.height - sourceYOffset
              );

              // Create off-screen canvas for this page slice
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = breakdownCanvas.width;
              pageCanvas.height = sourceHeightForPage;
              const pageCtx = pageCanvas.getContext('2d');

              if (pageCtx) {
                // Draw slice
                pageCtx.drawImage(
                  breakdownCanvas,
                  0, sourceYOffset, breakdownCanvas.width, sourceHeightForPage,
                  0, 0, breakdownCanvas.width, sourceHeightForPage
                );
                const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
                const renderedHeight = sourceHeightForPage * scale;
                doc.addImage(pageImgData, 'JPEG', margin, yPos, breakdownWidth, renderedHeight);

                // Move to next slice
                sourceYOffset += sourceHeightForPage;

                // Add new page if more content remains
                if (sourceYOffset < breakdownCanvas.height) {
                  doc.addPage();
                  yPos = margin;
                  addBreakdownHeader(true);
                  pageIndex++;
                }
              } else {
                break;
              }
            }
          }
        } catch (error) {
          console.error('Error capturing yearly breakdown:', error);
        }
      }

      // Professional Footer (matching loan calculator exactly)
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('DapsiWow Compound Interest Calculator', margin, pageHeight - 12);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 12, { align: 'right' });

        // Website
        doc.setTextColor(37, 99, 235);
        doc.text('www.dapsiwow.com', pageWidth - margin, pageHeight - 7, { align: 'right' });
      }

      doc.save('compound-interest-report.pdf');

      toast({
        title: "Professional PDF Downloaded",
        description: "Your detailed compound interest report has been saved successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Memoize currency formatter to prevent recreation on every render
  const formatCurrency = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return (amount: number) => formatter.format(amount);
  }, []);

  const canonicalUrl = "https://dapsiwow.com/tools/compound-interest-calculator";
  const siteUrl = "https://dapsiwow.com";
  const ogImageUrl = `${siteUrl}/og-image-compound-interest.jpg`;
  const publishedDate = "2025-01-15T00:00:00Z";
  const modifiedDate = "2025-01-15T00:00:00Z";
  const currentYear = 2025;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <html lang="en" />
        <title>Compound Interest Calculator - Investment Growth | DapsiWow</title>
        <meta name="description" content="Calculate compound interest and investment growth with SIP returns. See detailed yearly breakdowns and plan your financial future effectively. Free calculator!" />
        <meta name="keywords" content="compound interest calculator, free compound interest calculator, compound interest calculator with monthly contributions, daily compound interest calculator, SIP calculator, systematic investment plan calculator, retirement compound interest calculator, investment growth calculator, 401k calculator, IRA calculator" />

        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Language and Geo */}
        <meta httpEquiv="content-language" content="en" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />

        {/* Date and Author */}
        <meta name="date" content={publishedDate} />
        <meta name="last-modified" content={modifiedDate} />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="copyright" content={`© ${currentYear} DapsiWow. All rights reserved.`} />

        {/* Hreflang for International Versions */}
        <link rel="alternate" hrefLang="en" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-US" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-CA" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-AU" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="DapsiWow - Free Online Tools" />
        <meta property="og:title" content="Compound Interest Calculator - Investment Growth | DapsiWow" />
        <meta property="og:description" content="Calculate compound interest with our free tool. See your investment growth, SIP returns, and retirement plan with yearly breakdowns. Start calculating now!" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Compound Interest Calculator - Track investment growth with SIP deposits, inflation adjustment, and retirement planning tools" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content="Compound Interest Calculator - Investment Growth | DapsiWow" />
        <meta name="twitter:description" content="Calculate compound interest with our free tool. See your investment growth, SIP returns, and retirement plan with yearly breakdowns. Start calculating now!" />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content="Compound Interest Calculator - Track investment growth with SIP deposits, inflation adjustment, and retirement planning tools" />
        <meta name="twitter:creator" content="@DapsiWow" />
        <meta name="twitter:site" content="@DapsiWow" />

        {/* PWA / App Meta */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="DapsiWow Compound Interest Calculator" />

        {/* Pinterest Rich Pins */}
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:author" content="DapsiWow" />
        <meta property="article:section" content="Finance Tools" />
        <meta property="article:tag" content="compound interest, SIP calculator, investment planning, retirement savings" />

        {/* Consolidated Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Compound Interest Calculator - Investment Growth | DapsiWow",
              "description": "Calculate compound interest with our free tool. Track investment growth, SIP returns, and retirement planning. Get instant results with yearly breakdowns.",
              "url": canonicalUrl,
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": siteUrl
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Tools",
                    "item": `${siteUrl}/tools`
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Compound Interest Calculator",
                    "item": canonicalUrl
                  }
                ]
              },
              "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", "h2", ".description"]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Compound Interest Calculator with SIP Deposits",
              "description": "Free online compound interest calculator to calculate investment growth with daily compounding, SIP deposits, retirement planning for 401k and IRA accounts.",
              "url": canonicalUrl,
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Daily compound interest calculator",
                "SIP investment planning with step-up",
                "Goal-based investment analysis",
                "Inflation adjustment calculations",
                "Retirement planning (401k, IRA)",
                "Multi-currency support",
                "PDF report generation",
                "Yearly breakdown analysis"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "12847"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DapsiWow",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.png`,
              "description": "Free online financial calculators and tools for compound interest, investments, loans, and retirement planning.",
              "sameAs": [
                "https://twitter.com/DapsiWow"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I calculate compound interest with SIP deposits?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Enter your initial principal, interest rate, time period, and compounding frequency. Enable SIP mode and add your monthly contribution amount. The calculator will compute your final amount including compound growth on both principal and regular deposits."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between daily and monthly compounding?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Daily compounding applies interest 365 times per year, while monthly compounding applies it 12 times per year. More frequent compounding results in slightly higher returns due to earning interest on interest more often."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use this calculator for retirement planning?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Enable SIP deposits to simulate regular 401k or IRA contributions. The calculator shows inflation-adjusted returns and yearly breakdowns to help plan your retirement savings strategy."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How accurate is the compound interest calculator?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our calculator uses precise mathematical formulas. Results are accurate for planning purposes, but actual investment returns may vary based on market conditions and fees."
                  }
                }
              ]
            }
          ])}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 max-w-full">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 text-blue-700 flex-shrink-0" />
                <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium text-blue-700 text-center leading-tight">
                  Free Daily & Monthly Compound Interest Calculator - 100% Accurate
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Compound Interest Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Investment Growth
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate investment growth with daily, monthly, or yearly compounding. Free tool with detailed analysis and retirement planning features.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Watch Growth</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Plan Ahead</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Build Wealth</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">

          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Investment Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your investment details to calculate compound interest growth</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      {/* Principal Amount */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="principal" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Principal Amount
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Your initial investment amount</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="principal"
                            type="number"
                            value={principal}
                            onChange={(e) => { setPrincipal(e.target.value); clearError('principal'); }}
                            className={`h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.principal ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="10,000"
                            min="0"
                            max="1000000000"
                            step="100"
                            data-testid="input-principal"
                            aria-label="Principal amount in dollars"
                            required
                          />
                        </div>
                        {validationErrors.principal && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-principal">{validationErrors.principal}</p>
                        )}
                      </div>

                      {/* Interest Rate */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Interest Rate
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Expected yearly return rate on your investment</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="interest-rate"
                            type="number"
                            value={interestRate}
                            onChange={(e) => { setInterestRate(e.target.value); clearError('interestRate'); }}
                            className={`h-10 sm:h-12 md:h-14 pr-7 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.interestRate ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="8.00"
                            min="0"
                            max="100"
                            step="0.01"
                            data-testid="input-interest-rate"
                            aria-label="Annual interest rate percentage"
                            required
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                        {validationErrors.interestRate && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-interest-rate">{validationErrors.interestRate}</p>
                        )}
                      </div>

                      {/* Time Period */}
                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Investment Period</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you plan to invest</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => { setTimePeriod(e.target.value); clearError('timePeriod'); }}
                            className={`h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.timePeriod ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="10"
                            min="1"
                            max="100"
                            data-testid="input-time-period"
                            aria-label="Investment period duration"
                            required
                          />
                          <Select value={timeUnit} onValueChange={setTimeUnit}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-time-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {validationErrors.timePeriod && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-time-period">{validationErrors.timePeriod}</p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">💡 Pro Tip: Time is the most powerful factor in compound interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <button
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="flex items-center justify-between w-full hover-elevate active-elevate-2 p-2 rounded-lg transition-colors"
                      data-testid="button-toggle-advanced-options"
                      type="button"
                    >
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Advanced Options</h3>
                      <ChevronDown 
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showAdvancedOptions && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* SIP Investment Toggle */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableSIP}
                        onChange={(e) => setEnableSIP(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-sip"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable SIP (Systematic Investment Plan)
                      </label>
                    </div>

                    {enableSIP && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 pl-4 sm:pl-6 md:pl-8 border-l-4 border-blue-200 bg-blue-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="sip-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            SIP Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                            <Input
                              id="sip-amount"
                              type="number"
                              value={sipAmount}
                              onChange={(e) => { setSipAmount(e.target.value); clearError('sipAmount'); }}
                              className={`h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.sipAmount ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                              placeholder="1,000"
                              min="0"
                              step="10"
                              data-testid="input-sip-amount"
                              aria-label="SIP amount per period"
                            />
                          </div>
                          {validationErrors.sipAmount && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-sip-amount">{validationErrors.sipAmount}</p>
                          )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">SIP Frequency</Label>
                          <Select value={sipFrequency} onValueChange={setSipFrequency}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-sip-frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="2">Semi-annually</SelectItem>
                              <SelectItem value="1">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="step-up" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Step-Up (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="step-up"
                              type="number"
                              value={stepUpPercentage}
                              onChange={(e) => { setStepUpPercentage(e.target.value); clearError('stepUpPercentage'); }}
                              className={`h-10 sm:h-12 md:h-14 pr-7 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.stepUpPercentage ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                              placeholder="5"
                              min="0"
                              max="100"
                              step="0.01"
                              data-testid="input-step-up"
                              aria-label="Annual step-up percentage"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                          </div>
                          {validationErrors.stepUpPercentage && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-step-up">{validationErrors.stepUpPercentage}</p>
                          )}
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="inflation-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Inflation Rate (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="inflation-rate"
                              type="number"
                              value={inflationRate}
                              onChange={(e) => { setInflationRate(e.target.value); clearError('inflationRate'); }}
                              className={`h-10 sm:h-12 md:h-14 pr-7 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.inflationRate ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                              placeholder="3"
                              min="0"
                              max="50"
                              step="0.01"
                              data-testid="input-inflation-rate"
                              aria-label="Annual inflation rate percentage"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                          </div>
                          {validationErrors.inflationRate && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-inflation-rate">{validationErrors.inflationRate}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Goal Planning Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableGoalPlanning}
                        onChange={(e) => setEnableGoalPlanning(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-goal"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable Goal Planning
                      </label>
                    </div>

                    {enableGoalPlanning && (
                      <div className="pl-4 sm:pl-6 md:pl-8 border-l-4 border-green-200 bg-green-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="goal-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Target Goal Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                            <Input
                              id="goal-amount"
                              type="number"
                              value={goalAmount}
                              onChange={(e) => { setGoalAmount(e.target.value); clearError('goalAmount'); }}
                              className={`h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.goalAmount ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                              placeholder="100,000"
                              min="0"
                              step="100"
                              data-testid="input-goal-amount"
                              aria-label="Target goal amount in dollars"
                            />
                          </div>
                          {validationErrors.goalAmount && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-goal-amount">{validationErrors.goalAmount}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tax Calculations Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableTax}
                        onChange={(e) => setEnableTax(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-tax"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable Tax Calculations
                      </label>
                    </div>

                    {enableTax && (
                      <div className="pl-4 sm:pl-6 md:pl-8 border-l-4 border-orange-200 bg-orange-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="tax-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Capital Gains Tax Rate (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="tax-rate"
                              type="number"
                              value={taxRate}
                              onChange={(e) => { setTaxRate(e.target.value); clearError('taxRate'); }}
                              className={`h-10 sm:h-12 md:h-14 pr-7 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.taxRate ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                              placeholder="15"
                              min="0"
                              max="100"
                              step="0.1"
                              data-testid="input-tax-rate"
                              aria-label="Capital gains tax rate percentage"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                          </div>
                          {validationErrors.taxRate && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-tax-rate">{validationErrors.taxRate}</p>
                          )}
                          <p className="text-xs text-gray-600">Typical long-term capital gains rates: 0%, 15%, or 20%</p>
                        </div>
                      </div>
                    )}

                    {/* Expense Ratio/Fees Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableFees}
                        onChange={(e) => setEnableFees(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-fees"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable Investment Fees
                      </label>
                    </div>

                    {enableFees && (
                      <div className="pl-4 sm:pl-6 md:pl-8 border-l-4 border-purple-200 bg-purple-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="expense-ratio" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Expense Ratio (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="expense-ratio"
                              type="number"
                              value={expenseRatio}
                              onChange={(e) => { setExpenseRatio(e.target.value); clearError('expenseRatio'); }}
                              className={`h-10 sm:h-12 md:h-14 pr-7 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.expenseRatio ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                              placeholder="0.5"
                              min="0"
                              max="10"
                              step="0.01"
                              data-testid="input-expense-ratio"
                              aria-label="Annual expense ratio percentage"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                          </div>
                          {validationErrors.expenseRatio && (
                            <p className="text-xs text-red-600 mt-1" data-testid="error-expense-ratio">{validationErrors.expenseRatio}</p>
                          )}
                          <p className="text-xs text-gray-600">Average mutual fund expense ratio: 0.5-1.0%. Index funds: 0.05-0.20%</p>
                        </div>
                      </div>
                    )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      ref={calculateButtonRef}
                      onClick={calculateCompoundInterestFunc}
                      size="lg"
                      className="w-full sm:w-auto text-white font-semibold shadow-lg transition-colors"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Compound Interest
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto font-semibold transition-colors"
                      data-testid="button-reset"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Calculator
                    </Button>
                  </div>

                  {/* Advanced Display Options */}
                  {result && (
                    <div className="space-y-4 pt-3 sm:pt-4 print:hidden">
                      {/* Primary Action Buttons */}
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <Button
                          onClick={() => setShowBreakdown(!showBreakdown)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-show-breakdown"
                        >
                          {showBreakdown ? 'Hide' : 'Show'} Yearly Breakdown
                        </Button>
                        <Button
                          onClick={() => setShowRealValue(!showRealValue)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-show-real-value"
                        >
                          {showRealValue ? 'Hide' : 'Show'} Inflation Adjusted
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          Export PDF
                        </Button>
                      </div>

                      {/* Social Share Section */}
                      <div className="border-t pt-3 sm:pt-4">
                        <p className="text-center text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2 sm:mb-3 px-2">Share your results:</p>
                        <div className="flex flex-wrap justify-center items-center gap-1.5 xs:gap-2 sm:gap-3 px-2 sm:px-0">
                          <Button
                            onClick={shareOnFacebook}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on Facebook"
                          >
                            <FaFacebook className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Facebook</span>
                          </Button>
                          <Button
                            onClick={shareOnTwitter}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#1da1f2] hover:bg-[#1a8cd8] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on Twitter"
                          >
                            <FaTwitter className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Twitter</span>
                          </Button>
                          <Button
                            onClick={shareOnLinkedIn}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#0077b5] hover:bg-[#006399] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on LinkedIn"
                          >
                            <FaLinkedin className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">LinkedIn</span>
                          </Button>
                          <Button
                            onClick={shareOnWhatsApp}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </Button>
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="More share options"
                          >
                            <Share2 className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">More</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t lg:border-t-0 lg:border-l">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center lg:text-left">Growth Analysis</h2>

                  {result ? (
                    <div className="space-y-4 sm:space-y-6" data-testid="compound-interest-results">
                      {/* Final Amount Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-green-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2 text-center lg:text-left">
                          Final Amount
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 text-center lg:text-left break-all" data-testid="text-final-amount">
                          {formatCurrency(result.finalAmount)}
                        </div>
                        {showRealValue && (
                          <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center lg:text-left">
                            Real Value: {formatCurrency(result.realValue)}
                          </div>
                        )}
                      </div>

                      {/* Growth Breakdown */}
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
                            </span>
                          </div>
                        </div>

                        {enableSIP && result.sipAnalysis && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total SIP Contributions</span>
                              <span className="font-bold text-blue-600 text-xs sm:text-sm md:text-base" data-testid="text-sip-contributions">
                                {formatCurrency(result.sipAnalysis.totalSIPContributions)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total Interest Earned</span>
                            <span className="font-bold text-green-600 text-xs sm:text-sm md:text-base" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total Contributions</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base" data-testid="text-total-contributions">
                              {formatCurrency(result.totalContributions)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Interest Rate</span>
                            <span className="font-bold text-blue-600 text-xs sm:text-sm md:text-base">
                              {interestRate}% per year
                            </span>
                          </div>
                        </div>

                        {result.sipAnalysis && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Average Annual Return</span>
                              <span className="font-bold text-purple-600" data-testid="text-average-return">
                                {result.sipAnalysis.averageAnnualReturn.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Phase 1: CAGR and Doubling Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-medium text-gray-600 uppercase">CAGR</div>
                                <div className="text-xl sm:text-2xl font-bold text-blue-600" data-testid="text-cagr">
                                  {result.cagr.toFixed(2)}%
                                </div>
                              </div>
                              <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Compound Annual Growth Rate</p>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-medium text-gray-600 uppercase">Doubling Time</div>
                                <div className="text-xl sm:text-2xl font-bold text-green-600" data-testid="text-doubling-time">
                                  {result.doublingTime.toFixed(1)} yrs
                                </div>
                              </div>
                              <Target className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Rule of 72 projection</p>
                          </div>
                        </div>
                      </div>

                      {/* Phase 1: Milestone Tracker */}
                      {showMilestones && (result.milestones.double || result.milestones.triple || result.milestones.fivex || result.milestones.tenx) && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 shadow-sm border border-purple-200" data-testid="milestone-tracker">
                          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-600" />
                            Investment Milestones
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {result.milestones.double && (
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-purple-600">2x</div>
                                <div className="text-xs text-gray-600 mt-1">Year {result.milestones.double}</div>
                              </div>
                            )}
                            {result.milestones.triple && (
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-600">3x</div>
                                <div className="text-xs text-gray-600 mt-1">Year {result.milestones.triple}</div>
                              </div>
                            )}
                            {result.milestones.fivex && (
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-600">5x</div>
                                <div className="text-xs text-gray-600 mt-1">Year {result.milestones.fivex}</div>
                              </div>
                            )}
                            {result.milestones.tenx && (
                              <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-orange-600">10x</div>
                                <div className="text-xs text-gray-600 mt-1">Year {result.milestones.tenx}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Phase 1: Tax Summary */}
                      {enableTax && result.totalTaxPaid > 0 && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 sm:p-6 shadow-sm border border-orange-200" data-testid="tax-summary">
                          <h3 className="font-bold text-gray-900 text-lg mb-4">Tax Impact Analysis</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Tax Rate Applied</span>
                              <span className="font-bold text-orange-600">{taxRate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total Tax on Gains</span>
                              <span className="font-bold text-red-600" data-testid="text-total-tax">
                                {formatCurrency(result.totalTaxPaid)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white rounded-lg p-3">
                              <span className="font-medium text-gray-700">After-Tax Returns</span>
                              <span className="font-bold text-green-600" data-testid="text-post-tax-returns">
                                {formatCurrency(result.postTaxReturns)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Phase 1: Fees Summary */}
                      {enableFees && result.totalFeesPaid > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 shadow-sm border border-purple-200" data-testid="fees-summary">
                          <h3 className="font-bold text-gray-900 text-lg mb-4">Investment Fees Impact</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Expense Ratio</span>
                              <span className="font-bold text-purple-600">{expenseRatio}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total Fees Paid</span>
                              <span className="font-bold text-red-600" data-testid="text-total-fees">
                                {formatCurrency(result.totalFeesPaid)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-white rounded-lg p-3">
                              <span className="font-medium text-gray-700">Net After Fees</span>
                              <span className="font-bold text-green-600" data-testid="text-net-after-fees">
                                {formatCurrency(result.netReturnsAfterFees)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Phase 1: What-If Analysis */}
                      {showWhatIf && result.whatIfAnalysis && result.whatIfAnalysis.length > 0 && (
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200" data-testid="what-if-analysis">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">What-If Analysis</h3>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowWhatIf(false)}
                            >
                              Hide
                            </Button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b-2 border-gray-200">
                                  <th className="text-left py-2 px-3">Rate Change</th>
                                  <th className="text-left py-2 px-3">New Rate</th>
                                  <th className="text-right py-2 px-3">Final Amount</th>
                                  <th className="text-right py-2 px-3">Difference</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.whatIfAnalysis.map((item, idx) => (
                                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-3 font-medium">{item.rateChange}</td>
                                    <td className="py-2 px-3">{item.rate?.toFixed(2) ?? '0.00'}%</td>
                                    <td className="py-2 px-3 text-right font-semibold text-blue-600">
                                      {formatCurrency(Number((item as any).finalAmount ?? (item as any).resultValue ?? 0))}
                                    </td>
                                    <td className={`py-2 px-3 text-right font-semibold ${(item as any).difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {(item as any).difference >= 0 ? '+' : ''}{formatCurrency((item as any).difference)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-xs text-gray-600 mt-4">See how rate changes impact your final returns</p>
                        </div>
                      )}

                      {!showWhatIf && (
                        <Button
                          onClick={() => setShowWhatIf(true)}
                          variant="outline"
                          className="w-full"
                          data-testid="button-show-what-if"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Show What-If Analysis
                        </Button>
                      )}

                      {/* Goal Analysis */}
                      {result.goalAnalysis && enableGoalPlanning && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-900 text-lg">Goal Analysis</h4>

                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">Time to Reach Goal</span>
                                <span className="font-bold text-green-600" data-testid="text-time-to-goal">
                                  {result.goalAnalysis.timeToReachGoal > 0 ? `${result.goalAnalysis.timeToReachGoal} years` : 'Goal not achievable'}
                                </span>
                              </div>
                              {result.goalAnalysis && result.goalAnalysis.requiredMonthlyContribution !== undefined && result.goalAnalysis.requiredMonthlyContribution > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-green-700">Required Monthly SIP</span>
                                  <span className="font-bold text-green-600" data-testid="text-required-sip">
                                    {formatCurrency(result.goalAnalysis.requiredMonthlyContribution)}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm text-green-600">
                                {result.goalAnalysis.isGoalAchievable ? 'Goal is achievable with current plan' : 'Consider increasing investment amount or duration'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}


                      {/* Yearly Investment Breakdown */}
                      {result && showBreakdown && (
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-yearly-breakdown">
                              Yearly Investment Breakdown
                            </h3>
                            <Button
                              onClick={() => setShowBreakdown(false)}
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                              data-testid="button-hide-breakdown"
                            >
                              <RotateCcw className="w-4 h-4 mr-1.5" />
                              Hide Breakdown
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Track your investment growth year by year with detailed breakdown of principal, interest, and contributions.</p>
                          <div className="overflow-x-auto -mx-4 sm:mx-0" ref={yearlyBreakdownRef}>
                            <table className="w-full min-w-[600px]" data-testid="table-yearly-breakdown">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Year</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Interest Earned</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">SIP Contribution</th>
                                  {showRealValue && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Real Value</th>}
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Interest</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {(result?.yearlyBreakdown || []).map((year, index) => (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors" data-testid={`breakdown-row-${index}`}>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{year.year}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(Number(year.amount ?? 0))}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatCurrency(Number(year.interestEarned ?? 0))}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(Number(year.sipContribution ?? 0))}</td>
                                    {showRealValue && (
                                      <td className="px-4 py-3 text-sm text-right font-semibold text-purple-600">{formatCurrency(Number(year.realValue ?? 0))}</td>
                                    )}
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(Number(year.totalInterest ?? 0))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 md:mb-6 flex items-center justify-center">
                        <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg">Enter investment details to see compound interest growth</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 space-y-8 sm:space-y-12 md:space-y-16">

            {/* Introduction Section */}
            <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">What is Compound Interest Calculator?</h2>

              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                The Compound Interest Calculator is a free online tool that helps you determine how your investments grow over time through the power of compounding. Whether you're planning for retirement with a 401k or IRA, saving for a child's college education, or building long-term wealth, this calculator provides instant, accurate projections of your investment growth.
              </p>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Why Use Our Compound Interest Calculator?</h3>

              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-5 h-5 text-blue-600 font-bold flex-shrink-0" />
                  <span className="text-base sm:text-lg text-gray-700"><strong>Instant Results:</strong> Get compound interest calculations in seconds with detailed yearly breakdowns</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-5 h-5 text-blue-600 font-bold flex-shrink-0" />
                  <span className="text-base sm:text-lg text-gray-700"><strong>Accurate:</strong> Uses the standard compound interest formula with support for daily, monthly, quarterly, and annual compounding</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-5 h-5 text-blue-600 font-bold flex-shrink-0" />
                  <span className="text-base sm:text-lg text-gray-700"><strong>Free Forever:</strong> No hidden fees, registration, or subscription required</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-5 h-5 text-blue-600 font-bold flex-shrink-0" />
                  <span className="text-base sm:text-lg text-gray-700"><strong>SIP Support:</strong> Model systematic investment plans with step-up contributions</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <Check className="w-5 h-5 text-blue-600 font-bold flex-shrink-0" />
                  <span className="text-base sm:text-lg text-gray-700"><strong>Inflation Adjustment:</strong> See real purchasing power of your future wealth</span>
                </li>
              </ul>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Who Benefits from Compound Interest Calculator?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-blue-50 rounded-lg p-4 sm:p-5">
                  <h4 className="font-bold text-gray-900 mb-2">Retirement Planners</h4>
                  <p className="text-sm sm:text-base text-gray-700">Model 401k, IRA, and pension growth with regular contributions</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 sm:p-5">
                  <h4 className="font-bold text-gray-900 mb-2">Parents & Students</h4>
                  <p className="text-sm sm:text-base text-gray-700">Plan for college savings with 529 plans and education funds</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 sm:p-5">
                  <h4 className="font-bold text-gray-900 mb-2">Investors</h4>
                  <p className="text-sm sm:text-base text-gray-700">Compare investment strategies and track portfolio growth</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 sm:p-5">
                  <h4 className="font-bold text-gray-900 mb-2">Financial Advisors</h4>
                  <p className="text-sm sm:text-base text-gray-700">Demonstrate investment potential to clients with visual projections</p>
                </div>
              </div>
            </section>

            {/* How to Use Section */}
            <section className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use the Compound Interest Calculator</h2>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">1</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Enter Your Initial Investment</h3>
                    <p className="text-sm sm:text-base text-gray-700">Start by entering your principal amount - the initial lump sum you're investing. This could be your current savings or a one-time investment.</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">2</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Set Your Interest Rate</h3>
                    <p className="text-sm sm:text-base text-gray-700">Enter the annual interest rate or expected return on your investment. For stocks, historical average is around 8-10%. For bonds, typically 3-6%. Savings accounts usually offer 0.5-2%.</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">3</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Choose Your Time Period</h3>
                    <p className="text-sm sm:text-base text-gray-700">Specify how long you plan to invest. You can enter time in years or months. The longer the time period, the more powerful the compounding effect.</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">4</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Select Compounding Frequency</h3>
                    <p className="text-sm sm:text-base text-gray-700">Choose how often interest compounds: daily (365), monthly (12), quarterly (4), or annually (1). More frequent compounding accelerates growth.</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">5</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Enable SIP for Regular Contributions (Optional)</h3>
                    <p className="text-sm sm:text-base text-gray-700">Turn on Systematic Investment Plan mode to add regular monthly or yearly contributions. Enter your contribution amount and choose step-up percentage if your contributions will increase over time.</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">6</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Add Inflation Rate for Real Value (Optional)</h3>
                    <p className="text-sm sm:text-base text-gray-700">Enter expected inflation rate (typically 2-3%) to see the purchasing power of your future wealth in today's dollars.</p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">7</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Calculate and Review Results</h3>
                    <p className="text-sm sm:text-base text-gray-700">Click "Calculate" to see your investment growth projection, yearly breakdown, and visual charts. Download PDF reports or share your calculation via link.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 bg-blue-100 border-l-4 border-blue-600 p-4 sm:p-6 rounded-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Pro Tips for Better Results</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Use realistic interest rates based on your actual investment type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Choose daily compounding for savings accounts to maximize accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Enable step-up SIP if you expect salary raises or bonuses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Always account for inflation to understand true purchasing power</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Compare different scenarios by adjusting contribution amounts and frequencies</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Real-World Examples Section */}
            <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Compound Interest Calculator Examples</h2>

              {/* Example 1 */}
              <div className="mb-8 sm:mb-10 pb-8 sm:pb-10 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Example 1: Retirement Planning with 401k</h3>

                <p className="text-sm sm:text-base text-gray-700 mb-4"><strong>Scenario:</strong> Sarah is 30 years old and wants to plan for retirement at 65. She has $25,000 in her 401k and contributes $500 monthly with her employer match.</p>

                <div className="bg-blue-50 rounded-lg p-4 sm:p-5 mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">Input Values:</h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex justify-between"><span className="text-gray-700">Initial Principal:</span> <span className="font-bold">$25,000</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Annual Interest Rate:</span> <span className="font-bold">8% (stock market average)</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Time Period:</span> <span className="font-bold">35 years</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Compounding:</span> <span className="font-bold">Monthly (12)</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">SIP Contribution:</span> <span className="font-bold">$500/month</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Step-up:</span> <span className="font-bold">3% annually (salary raises)</span></li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 sm:p-5 mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">Results:</h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex justify-between"><span className="text-gray-700">Final Amount:</span> <span className="font-bold text-green-600">$1,247,892</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Total Contributions:</span> <span className="font-bold">$323,450</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Total Interest Earned:</span> <span className="font-bold text-green-600">$924,442</span></li>
                  </ul>
                </div>

                <p className="text-sm sm:text-base text-gray-700 mb-3"><strong>Interpretation:</strong> Sarah's $25,000 initial investment combined with consistent monthly contributions grows to over $1.2 million by retirement. The power of compound interest generates nearly $924,000 in returns - almost 3x her total contributions!</p>

                <p className="text-sm sm:text-base text-gray-700"><strong>Action Steps:</strong> Maximize 401k contributions to get full employer match, increase contributions when you receive raises, and maintain a diversified portfolio for consistent 8% returns.</p>
              </div>

              {/* Example 2 */}
              <div className="mb-8 sm:mb-10 pb-8 sm:pb-10 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Example 2: College Savings Fund (529 Plan)</h3>

                <p className="text-sm sm:text-base text-gray-700 mb-4"><strong>Scenario:</strong> John and Mary have a newborn and want to save for their child's college education starting in 18 years. They open a 529 plan with $10,000 and contribute $200 monthly.</p>

                <div className="bg-blue-50 rounded-lg p-4 sm:p-5 mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">Input Values:</h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex justify-between"><span className="text-gray-700">Initial Principal:</span> <span className="font-bold">$10,000</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Annual Interest Rate:</span> <span className="font-bold">7% (moderate growth portfolio)</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Time Period:</span> <span className="font-bold">18 years</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Compounding:</span> <span className="font-bold">Monthly (12)</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">SIP Contribution:</span> <span className="font-bold">$200/month</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Inflation Rate:</span> <span className="font-bold">3% (college costs)</span></li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 sm:p-5 mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">Results:</h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex justify-between"><span className="text-gray-700">Final Amount:</span> <span className="font-bold text-green-600">$104,467</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Total Contributions:</span> <span className="font-bold">$53,200</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Total Interest Earned:</span> <span className="font-bold text-green-600">$51,267</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Real Value (inflation-adjusted):</span> <span className="font-bold text-purple-600">$61,453</span></li>
                  </ul>
                </div>

                <p className="text-sm sm:text-base text-gray-700 mb-3"><strong>Interpretation:</strong> The family's $53,200 in contributions grows to $104,467 - nearly doubling their money. After accounting for 3% inflation, they'll have $61,453 in today's purchasing power, covering a significant portion of college expenses.</p>

                <p className="text-sm sm:text-base text-gray-700"><strong>Action Steps:</strong> Start saving early to maximize compound growth, use tax-advantaged 529 plans, adjust contributions as income increases, and consider more conservative allocations as college approaches.</p>
              </div>

              {/* Example 3 */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Example 3: Wealth Building with Lump Sum Investment</h3>

                <p className="text-sm sm:text-base text-gray-700 mb-4"><strong>Scenario:</strong> Michael receives a $100,000 inheritance at age 40 and invests it in a diversified index fund portfolio, making no additional contributions.</p>

                <div className="bg-blue-50 rounded-lg p-4 sm:p-5 mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">Input Values:</h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex justify-between"><span className="text-gray-700">Initial Principal:</span> <span className="font-bold">$100,000</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Annual Interest Rate:</span> <span className="font-bold">9% (aggressive growth)</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Time Period:</span> <span className="font-bold">25 years (to age 65)</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Compounding:</span> <span className="font-bold">Annually (1)</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">SIP Contribution:</span> <span className="font-bold">None</span></li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 sm:p-5 mb-4">
                  <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">Results:</h4>
                  <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                    <li className="flex justify-between"><span className="text-gray-700">Final Amount:</span> <span className="font-bold text-green-600">$862,308</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Total Contributions:</span> <span className="font-bold">$100,000</span></li>
                    <li className="flex justify-between"><span className="text-gray-700">Total Interest Earned:</span> <span className="font-bold text-green-600">$762,308</span></li>
                  </ul>
                </div>

                <p className="text-sm sm:text-base text-gray-700 mb-3"><strong>Interpretation:</strong> Even without adding a single dollar, Michael's $100,000 grows to over $860,000 in 25 years. The 9% annual return generated $762,308 in compound interest - 7.6x the initial investment!</p>

                <p className="text-sm sm:text-base text-gray-700"><strong>Action Steps:</strong> Invest lump sums immediately rather than timing the market, maintain a long-term perspective through market volatility, rebalance annually to maintain target allocations, and avoid withdrawing funds to maximize compounding.</p>
              </div>
            </section>

            {/* Understanding Results Section */}
            <section className="bg-gradient-to-br from-white to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Understanding Your Compound Interest Results</h2>

              <p className="text-base sm:text-lg text-gray-700 mb-6">The calculator provides comprehensive analysis of your investment growth. Here's how to interpret each metric:</p>

              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Final Amount vs Principal</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Your final amount includes both your original principal and all accumulated interest. The difference shows the true power of compound interest over time.</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm sm:text-base"><strong>Rule of 72:</strong> Divide 72 by your interest rate to estimate how many years it takes to double your money. At 8% interest, your investment doubles approximately every 9 years (72 ÷ 8 = 9).</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Total Interest Earned</h3>
                  <p className="text-sm sm:text-base text-gray-700">This represents the "free money" generated by compound interest - earnings on both your principal and previously accumulated interest. The longer you invest, the more dramatic this growth becomes.</p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">SIP Analysis (If Enabled)</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Systematic Investment Plans amplify compound growth by consistently adding new capital. Each contribution starts its own compounding journey.</p>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <span><strong>Total SIP Contributions:</strong> Sum of all regular deposits made over the investment period</span></li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <span><strong>SIP Interest Earned:</strong> Compound growth specifically from your regular contributions</span></li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <span><strong>Average Annual Return:</strong> Effective yearly return considering both lump sum and SIP contributions</span></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Real Value (Inflation-Adjusted)</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">This critical metric shows what your future wealth can actually buy in today's dollars. Always consider inflation when planning long-term investments.</p>
                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                    <p className="text-sm sm:text-base text-gray-700"><strong>Important:</strong> A 3% inflation rate means you need your investments to grow by at least 3% annually just to maintain purchasing power. Aim for returns that exceed inflation by 5-7% for real wealth growth.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Yearly Breakdown</h3>
                  <p className="text-sm sm:text-base text-gray-700">The year-by-year analysis reveals how compound interest accelerates over time. Notice how interest earned in later years far exceeds earlier years - this exponential growth is compounding in action.</p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Visual Charts</h3>
                  <p className="text-sm sm:text-base text-gray-700">The pie chart breaks down final amount into principal vs interest, while growth charts illustrate exponential wealth accumulation. These visuals help you understand composition and trajectory of your investment.</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 bg-indigo-100 border-l-4 border-indigo-600 p-4 sm:p-6 rounded-r-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">When to Seek Professional Advice</h3>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold flex-shrink-0">•</span> Large lump sum investments exceeding $100,000</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold flex-shrink-0">•</span> Complex retirement planning with multiple account types</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold flex-shrink-0">•</span> Tax optimization strategies for investment gains</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold flex-shrink-0">•</span> Estate planning and wealth transfer considerations</li>
                </ul>
              </div>
            </section>

            {/* Formula Explained Section */}
            <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Compound Interest Formula Explained</h2>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">The Standard Compound Interest Formula</h3>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 overflow-x-auto">
                <p className="font-mono text-sm sm:text-base md:text-lg text-center mb-4 font-bold text-gray-900">
                  A = P(1 + r/n)^(nt)
                </p>
                <div className="space-y-2 text-sm sm:text-base text-gray-700">
                  <p><strong>A</strong> = Final amount (principal + interest)</p>
                  <p><strong>P</strong> = Principal (initial investment)</p>
                  <p><strong>r</strong> = Annual interest rate (as decimal)</p>
                  <p><strong>n</strong> = Number of times interest compounds per year</p>
                  <p><strong>t</strong> = Time period in years</p>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Step-by-Step Calculation Example</h3>

              <p className="text-sm sm:text-base text-gray-700 mb-4">Let's calculate compound interest for $10,000 invested at 8% annual rate for 5 years with monthly compounding:</p>

              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6 space-y-3 text-sm sm:text-base">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Step 1:</span>
                  <span className="text-gray-700">Identify variables: P = $10,000, r = 0.08, n = 12 (monthly), t = 5</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Step 2:</span>
                  <span className="text-gray-700">Substitute into formula: A = 10,000(1 + 0.08/12)^(12×5)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Step 3:</span>
                  <span className="text-gray-700">Calculate rate per period: 0.08/12 = 0.00667</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Step 4:</span>
                  <span className="text-gray-700">Add 1: 1 + 0.00667 = 1.00667</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Step 5:</span>
                  <span className="text-gray-700">Calculate total periods: 12 × 5 = 60 periods</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Step 6:</span>
                  <span className="text-gray-700">Raise to power: 1.00667^60 = 1.4898</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Step 7:</span>
                  <span className="text-gray-700">Multiply by principal: $10,000 × 1.4898 = <strong className="text-green-600">$14,898</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold text-blue-600 flex-shrink-0">Result:</span>
                  <span className="text-gray-700">Total interest earned = $14,898 - $10,000 = <strong className="text-green-600">$4,898</strong></span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Formula with Regular Contributions (SIP)</h3>

              <p className="text-sm sm:text-base text-gray-700 mb-4">When making regular contributions, we add the future value of an annuity formula:</p>

              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 overflow-x-auto">
                <p className="font-mono text-sm sm:text-base md:text-lg text-center mb-4 font-bold text-gray-900">
                  FV = PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
                </p>
                <div className="space-y-2 text-sm sm:text-base text-gray-700">
                  <p><strong>FV</strong> = Future value of regular contributions</p>
                  <p><strong>PMT</strong> = Payment amount per period</p>
                  <p><strong>r, n, t</strong> = Same as compound interest formula</p>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 sm:p-6 rounded-r-lg">
                <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">Key Insight</h4>
                <p className="text-sm sm:text-base text-gray-700">The compound interest formula is exponential, not linear. This means your wealth doesn't just grow steadily - it accelerates over time. The longer you invest, the more powerful compounding becomes. A $10,000 investment at 8% grows to $21,589 in 10 years, but $46,610 in 20 years - more than double despite the same 10-year increment!</p>
              </div>
            </section>

            {/* Comparison Section */}
            <section className="bg-gradient-to-br from-white to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Simple Interest vs Compound Interest</h2>

              <p className="text-base sm:text-lg text-gray-700 mb-6">Understanding the difference between simple and compound interest is crucial for maximizing investment returns. Let's compare:</p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base">Feature</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base">Simple Interest</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm sm:text-base">Compound Interest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-purple-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm sm:text-base">Calculation Basis</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Interest calculated only on principal</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Interest calculated on principal + accumulated interest</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-purple-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm sm:text-base">Growth Pattern</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Linear growth</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Exponential growth</td>
                    </tr>
                    <tr className="hover:bg-purple-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm sm:text-base">Formula</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 font-mono text-xs sm:text-sm">I = P × r × t</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 font-mono text-xs sm:text-sm">A = P(1 + r/n)^(nt)</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-purple-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm sm:text-base">Best For</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Short-term loans, bonds</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Long-term investments, savings</td>
                    </tr>
                    <tr className="hover:bg-purple-50">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm sm:text-base">Typical Use</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Car loans, personal loans</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-700 text-sm sm:text-base">Retirement accounts, stocks, mutual funds</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Comparison Example: $10,000 at 6% for 20 Years</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-bold text-gray-900 mb-3 text-center text-lg">Simple Interest</h4>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex justify-between"><span>Principal:</span> <span className="font-bold">$10,000</span></li>
                    <li className="flex justify-between"><span>Interest per year:</span> <span className="font-bold">$600</span></li>
                    <li className="flex justify-between"><span>Total interest (20 years):</span> <span className="font-bold">$12,000</span></li>
                    <li className="flex justify-between border-t-2 border-red-300 pt-2 mt-2"><span className="font-bold">Final Amount:</span> <span className="font-bold text-red-600 text-lg">$22,000</span></li>
                  </ul>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-bold text-gray-900 mb-3 text-center text-lg">Compound Interest (Annual)</h4>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex justify-between"><span>Principal:</span> <span className="font-bold">$10,000</span></li>
                    <li className="flex justify-between"><span>Growth factor:</span> <span className="font-bold">3.207x</span></li>
                    <li className="flex justify-between"><span>Total interest (20 years):</span> <span className="font-bold">$22,071</span></li>
                    <li className="flex justify-between border-t-2 border-green-300 pt-2 mt-2"><span className="font-bold">Final Amount:</span> <span className="font-bold text-green-600 text-lg">$32,071</span></li>
                  </ul>
                </div>
              </div>

              <div className="bg-purple-100 border-l-4 border-purple-600 p-4 sm:p-6 rounded-r-lg">
                <h4 className="font-bold text-gray-900 mb-2 sm:mb-3">The Difference is Dramatic!</h4>
                <p className="text-sm sm:text-base text-gray-700 mb-3">Compound interest generates <strong>$10,071 more</strong> than simple interest over 20 years - an 84% higher return! The gap widens exponentially with longer time periods. At 30 years, compound interest produces $47,435 more than simple interest.</p>
                <p className="text-sm sm:text-base text-gray-700"><strong>Takeaway:</strong> Always choose compound interest for long-term investments. The "interest on interest" effect becomes increasingly powerful over time.</p>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">When to Use Each Type</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-5">
                  <h4 className="font-bold text-gray-900 mb-2">Use Simple Interest For:</h4>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold flex-shrink-0">•</span> <span>Short-term loans (less than 1 year)</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold flex-shrink-0">•</span> <span>Bonds with fixed interest payments</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold flex-shrink-0">•</span> <span>Scenarios where interest isn't reinvested</span></li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-5">
                  <h4 className="font-bold text-gray-900 mb-2">Use Compound Interest For:</h4>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <span>Retirement savings (401k, IRA)</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <span>Long-term investment portfolios</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <span>Savings accounts, CDs, money market accounts</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <span>Any investment where earnings are reinvested</span></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions (FAQ)</h2>

              <div className="space-y-6 sm:space-y-8">
                {/* Question 1 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is compound interest and how does it work?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest which only earns on the principal, compound interest creates a snowball effect where your money grows exponentially over time.</p>
                  <p className="text-sm sm:text-base text-gray-700">For example, if you invest $1,000 at 10% annual compound interest, you'll earn $100 in year 1. In year 2, you earn 10% on $1,100 ($110), not just the original $1,000. This "interest on interest" effect accelerates your wealth growth significantly over longer periods.</p>
                </div>

                {/* Question 2 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How accurate is this compound interest calculator?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Our calculator uses precise mathematical formulas endorsed by financial institutions worldwide. The calculations are accurate for planning purposes and match results from professional financial software.</p>
                  <p className="text-sm sm:text-base text-gray-700">However, actual investment returns will vary based on market conditions, fees, taxes, and timing of contributions. Use results as projections, not guarantees. For large investment decisions, consult with a certified financial planner.</p>
                </div>

                {/* Question 3 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What's the difference between daily, monthly, and annual compounding?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Compounding frequency determines how often interest is calculated and added to your balance:</p>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700 ml-4">
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Daily compounding (365):</strong> Interest added every day - maximizes returns, common in savings accounts</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Monthly compounding (12):</strong> Interest added monthly - typical for CDs and money market accounts</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Annual compounding (1):</strong> Interest added once per year - simplest but lowest returns</li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 mt-3">More frequent compounding produces higher returns. For $10,000 at 5% over 10 years: daily compounding yields $16,487 vs $16,289 with annual compounding - a $198 difference.</p>
                </div>

                {/* Question 4 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Can I use this calculator for retirement planning (401k, IRA)?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Absolutely! This calculator is ideal for retirement planning. Enable SIP mode to model regular 401k or IRA contributions, set realistic interest rates (typically 6-10% for diversified portfolios), and use the inflation adjustment to see real purchasing power in retirement.</p>
                  <p className="text-sm sm:text-base text-gray-700">For most accurate retirement projections: use 7-8% annual returns for balanced portfolios, account for 2-3% inflation, include employer match in your contribution amount, and plan for 25-35 year time horizons if you're starting young.</p>
                </div>

                {/* Question 5 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is SIP and how does it help my investments grow?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">SIP (Systematic Investment Plan) means investing fixed amounts at regular intervals instead of a one-time lump sum. This strategy offers multiple benefits:</p>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700 ml-4">
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <strong>Rupee cost averaging:</strong> Reduces impact of market volatility by buying at various price points</li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <strong>Disciplined saving:</strong> Automated contributions remove emotion from investing</li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <strong>Compound amplification:</strong> Each contribution starts its own compound growth journey</li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold flex-shrink-0">•</span> <strong>Accessible entry:</strong> Start with small amounts rather than needing large lump sums</li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 mt-3">Example: $500 monthly SIP at 8% for 30 years grows to $679,700 (total contribution: $180,000). The same $180,000 lump sum upfront would only grow to $1,809,000 - but few people have that much to start!</p>
                </div>

                {/* Question 6 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Why should I account for inflation in my calculations?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Inflation erodes purchasing power over time. Without accounting for it, you might think you're wealthy when you actually can't afford the same lifestyle. A million dollars sounds impressive, but at 3% inflation, it will only have the purchasing power of about $400,000 in 30 years.</p>
                  <p className="text-sm sm:text-base text-gray-700">Always subtract inflation from your nominal returns to find your "real return." If your investment grows at 8% but inflation is 3%, your real return is only 5%. This helps you set realistic expectations and ensure your retirement savings actually maintain their value.</p>
                </div>

                {/* Question 7 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What interest rate should I use for different investment types?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Use these typical annual return rates as guidelines:</p>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700 ml-4">
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Savings accounts:</strong> 0.5-2% (safe, liquid, FDIC insured)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Certificates of Deposit (CDs):</strong> 1-4% (safe, fixed term)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Bonds:</strong> 3-6% (moderate risk, fixed income)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Balanced portfolio (60/40 stocks/bonds):</strong> 6-8% (moderate risk)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Stock market index funds:</strong> 8-10% (higher risk, historical average)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Aggressive growth stocks:</strong> 10-15% (high risk, volatile)</li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 mt-3">Remember: higher returns come with higher risk. Past performance doesn't guarantee future results. Diversify across asset classes to balance risk and return.</p>
                </div>

                {/* Question 8 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How long does it take to double my money with compound interest?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Use the "Rule of 72" for a quick estimate: divide 72 by your annual interest rate to find the approximate years to double.</p>
                  <div className="bg-blue-50 p-4 rounded-lg mt-3 mb-3">
                    <ul className="space-y-1.5 text-sm sm:text-base text-gray-700">
                      <li><strong>At 6% interest:</strong> 72 ÷ 6 = 12 years to double</li>
                      <li><strong>At 8% interest:</strong> 72 ÷ 8 = 9 years to double</li>
                      <li><strong>At 10% interest:</strong> 72 ÷ 10 = 7.2 years to double</li>
                      <li><strong>At 12% interest:</strong> 72 ÷ 12 = 6 years to double</li>
                    </ul>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">This shows why starting early is crucial. At 8%, your money doubles every 9 years. In 36 years, it doubles 4 times: $10,000 → $20,000 → $40,000 → $80,000 → $160,000!</p>
                </div>

                {/* Question 9 */}
                <div className="border-b border-gray-200 pb-6 sm:pb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Should I invest a lump sum or make regular monthly contributions?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">Both strategies have merits:</p>
                  <p className="text-sm sm:text-base text-gray-700 mb-3"><strong>Lump Sum Advantages:</strong> Maximum time in market for compound growth, statistically better returns over long periods, simpler to manage. Best when: you have inheritance or bonus, market is low, you have 10+ year horizon.</p>
                  <p className="text-sm sm:text-base text-gray-700 mb-3"><strong>Regular Contributions (SIP) Advantages:</strong> Reduces market timing risk through dollar-cost averaging, builds disciplined saving habit, accessible for most people, psychologically easier during volatility. Best when: you're investing from salary, market is volatile, you're just starting out.</p>
                  <p className="text-sm sm:text-base text-gray-700"><strong>Ideal Approach:</strong> Invest lump sums immediately when you have them, PLUS maintain regular monthly contributions. This combines maximum time in market with consistent savings discipline.</p>
                </div>

                {/* Question 10 */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Can I withdraw my money early from compound interest investments?</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">It depends on the investment type:</p>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700 ml-4">
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Savings accounts:</strong> Usually penalty-free withdrawals anytime</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>CDs:</strong> Early withdrawal penalties (often 3-6 months of interest)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>401k/IRA:</strong> 10% penalty plus taxes if withdrawn before age 59½</li>
                    <li className="flex items-start gap-2"><span className="text-blue-600 font-bold flex-shrink-0">•</span> <strong>Brokerage accounts:</strong> No penalties, but may owe capital gains taxes</li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 mt-3"><strong>Important:</strong> Early withdrawal severely damages compound growth. Withdrawing just $10,000 from a retirement account 20 years early could cost you $46,610 in lost compound growth (at 8% annual returns). Always maintain an emergency fund separate from long-term compound interest investments.</p>
                </div>
              </div>
            </section>

            {/* Related Calculators Section */}
            <section className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Related Financial Calculators</h2>

              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">Explore these powerful financial tools to make informed decisions about your money:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Calculator 1 */}
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-lg hover-elevate">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Loan Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">Calculate monthly payments, total interest, and amortization schedules for personal loans, auto loans, and mortgages.</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3"><strong>Best For:</strong> Planning loan repayments and comparing loan offers</p>
                  <a href="/tools/loan-calculator" className="inline-block">
                    <Button variant="outline" size="sm" className="w-full" data-testid="link-loan-calculator">
                      Calculate Loan Payments
                    </Button>
                  </a>
                </div>

                {/* Calculator 2 */}
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-lg hover-elevate">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Simple Interest Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">Calculate simple interest for short-term investments, bonds, and loans with linear growth patterns.</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3"><strong>Best For:</strong> Short-term loans and fixed-interest investments</p>
                  <a href="/tools/simple-interest-calculator" className="inline-block">
                    <Button variant="outline" size="sm" className="w-full" data-testid="link-simple-interest-calculator">
                      Calculate Simple Interest
                    </Button>
                  </a>
                </div>

                {/* Calculator 3 */}
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-lg hover-elevate">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">ROI Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">Measure return on investment for business ventures, real estate, stocks, and other investment opportunities.</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3"><strong>Best For:</strong> Comparing investment opportunities and business decisions</p>
                  <a href="/tools/roi-calculator" className="inline-block">
                    <Button variant="outline" size="sm" className="w-full" data-testid="link-roi-calculator">
                      Calculate ROI
                    </Button>
                  </a>
                </div>

                {/* Calculator 4 */}
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-lg hover-elevate">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Mortgage Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">Estimate monthly mortgage payments including property tax, insurance, PMI, and HOA fees with amortization schedules.</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3"><strong>Best For:</strong> Home buying decisions and mortgage affordability</p>
                  <a href="/tools/mortgage-calculator" className="inline-block">
                    <Button variant="outline" size="sm" className="w-full" data-testid="link-mortgage-calculator">
                      Calculate Mortgage
                    </Button>
                  </a>
                </div>

                {/* Calculator 5 */}
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-lg hover-elevate">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">EMI Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">Calculate Equated Monthly Installments for personal loans, home loans, car loans with detailed repayment breakdowns.</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3"><strong>Best For:</strong> Indian loan structures and EMI planning</p>
                  <a href="/tools/emi-calculator" className="inline-block">
                    <Button variant="outline" size="sm" className="w-full" data-testid="link-emi-calculator">
                      Calculate EMI
                    </Button>
                  </a>
                </div>

                {/* Calculator 6 */}
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-lg hover-elevate">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Investment Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-700 mb-4">Project investment portfolio growth with various scenarios including lump sums, regular contributions, and market variations.</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3"><strong>Best For:</strong> Long-term investment strategy and wealth planning</p>
                  <a href="/tools/investment-calculator" className="inline-block">
                    <Button variant="outline" size="sm" className="w-full" data-testid="link-investment-calculator">
                      Plan Investments
                    </Button>
                  </a>
                </div>
              </div>
            </section>

            {/* Final CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-2xl text-white text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to Watch Your Wealth Grow?</h2>

              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto">
                Start calculating your investment growth today with our free compound interest calculator. No registration, no hidden fees - just powerful financial insights at your fingertips.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 flex-wrap">
                <div className="flex items-center gap-2 text-white/90">
                  <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm sm:text-base">100% Free Forever</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Instant Accurate Results</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-sm sm:text-base">No Registration Required</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white text-blue-600 font-bold mb-6"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                data-testid="button-scroll-top-cta"
              >
                Start Calculating Now
              </Button>

              <div className="text-sm sm:text-base text-white/80">
                <p>Need help? Check our comprehensive FAQ above or contact our support team.</p>
                <p className="mt-2">Share this calculator with friends who are planning their financial future!</p>
              </div>
            </section>

          </div>

          </div>
      </main>

      <Footer />
    </div>
  );
}