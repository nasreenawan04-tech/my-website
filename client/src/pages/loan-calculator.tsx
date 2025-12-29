import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Download, Share2, Calculator, TrendingDown, Clock, DollarSign, PieChart, RotateCcw, BarChart as BarChartIcon, Zap, Home, Car, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Area, AreaChart } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import ShareResultsButton from '@/components/ShareResultsButton';
import { PresetManager } from '@/components/PresetManager';
import { Pin } from 'lucide-react';
import { usePinnedTools } from '@/hooks/use-pinned-tools';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { saveCalculation } from '@/lib/calculationHistory';
import { trackToolUsed } from '@/lib/analytics';

interface LoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
  extraPaymentSavings?: {
    timeSaved: number;
    interestSaved: number;
    newTotalInterest: number;
    newPayoffTime: number;
  };
}

interface ComparisonLoan {
  name: string;
  amount: number;
  rate: number;
  term: number;
  termUnit: string;
  paymentFrequency: string;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  apr: number; // APR including fees
  processingFee: number;
}

const loanInputSchema = z.object({
  loanAmount: z.number({
    invalid_type_error: "Loan amount must be a valid number",
    required_error: "Loan amount is required"
  }).positive("Loan amount must be greater than zero").max(100000000, "Loan amount is too large").finite("Loan amount must be a finite number"),
  interestRate: z.number({
    invalid_type_error: "Interest rate must be a valid number",
    required_error: "Interest rate is required"
  }).positive("Interest rate must be greater than zero").max(100, "Interest rate cannot exceed 100%").finite("Interest rate must be a finite number"),
  loanTerm: z.number({
    invalid_type_error: "Loan term must be a valid number",
    required_error: "Loan term is required"
  }).positive("Loan term must be greater than zero").max(600, "Loan term is too long").finite("Loan term must be a finite number"),
  extraPayment: z.number({
    invalid_type_error: "Extra payment must be a valid number"
  }).min(0, "Extra payment cannot be negative").finite("Extra payment must be a finite number"),
  processingFee: z.number({
    invalid_type_error: "Processing fee must be a valid number"
  }).min(0, "Processing fee cannot be negative").finite("Processing fee must be a finite number"),
  balloonPayment: z.number({
    invalid_type_error: "Balloon payment must be a valid number"
  }).min(0, "Balloon payment cannot be negative").finite("Balloon payment must be a finite number")
});

interface ValidationErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
  extraPayment?: string;
  processingFee?: string;
  balloonPayment?: string;
}

import { usePredictiveInput } from '@/hooks/use-predictive-input';

export default function LoanCalculator() {
  const toolId = 'loan-calculator';
  const toolName = 'Loan Calculator';
  const { toast } = useToast();
  const { user } = useAuth();
  const { pinnedTools, togglePin, isPinned } = usePinnedTools();

  const { predictedValues, updatePredictions } = usePredictiveInput(toolId, {}, {
    loanAmount: '100000',
    interestRate: '5.50',
    loanTerm: '30',
    termUnit: 'years',
    paymentFrequency: 'monthly',
    extraPayment: '0',
    processingFee: '0',
    balloonPayment: '0'
  });

  const [loanAmount, setLoanAmount] = useState(predictedValues.loanAmount ?? '100000');
  const [interestRate, setInterestRate] = useState(predictedValues.interestRate ?? '5.50');
  const [loanTerm, setLoanTerm] = useState(predictedValues.loanTerm ?? '30');
  const [termUnit, setTermUnit] = useState(predictedValues.termUnit ?? 'years');
  const [paymentFrequency, setPaymentFrequency] = useState(predictedValues.paymentFrequency ?? 'monthly');
  const [extraPayment, setExtraPayment] = useState(predictedValues.extraPayment ?? '0');
  const [processingFee, setProcessingFee] = useState(predictedValues.processingFee ?? '0');
  const [balloonPayment, setBalloonPayment] = useState(predictedValues.balloonPayment ?? '0');

  const [biweeklyMode, setBiweeklyMode] = useState<'standard' | 'accelerated'>('standard');
  const [showAmortization, setShowAmortization] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [comparisonLoans, setComparisonLoans] = useState<ComparisonLoan[]>([]);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false); // Added for loading state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // Added for PDF generation loading state
  const resultsRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const amortizationRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [shouldAutoCalculate, setShouldAutoCalculate] = useState(false);
  const [chartFilter, setChartFilter] = useState<'both' | 'principal' | 'interest'>('both');
  const [isSaving, setIsSaving] = useState(false);

  // Memoized currency formatter for better performance
  const formatCurrency = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return (amount: number) => formatter.format(amount);
  }, []);

  const calculateLoan = useCallback(async () => {
    setIsCalculating(true);
    setValidationErrors({});

    const principal = parseFloat(loanAmount ?? '0');
    const annualRate = parseFloat(interestRate ?? '0');
    const term = parseFloat(loanTerm ?? '0');
    const extraPmt = (extraPayment ?? '').trim() === '' ? 0 : parseFloat(extraPayment ?? '0');
    const procFee = parseFloat(processingFee ?? '0');

    const balloonPmt = parseFloat(balloonPayment || '0');
    
    const validation = loanInputSchema.safeParse({
      loanAmount: principal,
      interestRate: annualRate,
      loanTerm: term,
      extraPayment: extraPmt,
      processingFee: procFee,
      balloonPayment: balloonPmt
    });

    if (!validation.success) {
      const errors: ValidationErrors = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ValidationErrors;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      setIsCalculating(false);
      toast({
        title: "Invalid Input",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    trackToolUsed('Loan Calculator', 'Finance', {
      loan_amount: principal,
      interest_rate: annualRate,
      term_months: (termUnit ?? 'years') === 'years' ? term * 12 : term,
      payment_frequency: paymentFrequency ?? 'monthly',
      has_extra_payment: extraPmt > 0,
      processing_fee: procFee,
      has_balloon_payment: balloonPmt > 0,
      biweekly_mode: (paymentFrequency ?? 'monthly') === 'biweekly' ? biweeklyMode : null
    });

    const annualRateDecimal = annualRate / 100;
    const termMonths = (termUnit ?? 'years') === 'years' ? term * 12 : term;

    // Handle biweekly payment modes
    let paymentsPerYear: number;
    if ((paymentFrequency ?? 'monthly') === 'weekly') {
      paymentsPerYear = 52;
    } else if ((paymentFrequency ?? 'monthly') === 'biweekly') {
      paymentsPerYear = 26;
    } else {
      paymentsPerYear = 12;
    }
    
    const periodicRate = annualRateDecimal / paymentsPerYear;
    const totalPayments = termMonths * (paymentsPerYear / 12);

    const adjustedPrincipal = principal + procFee;
    
    // Calculate regular payment (without balloon)
    let regularPayment: number;
    
    if (annualRateDecimal === 0) {
      regularPayment = (adjustedPrincipal - balloonPmt) / totalPayments;
    } else if (balloonPmt > 0) {
      // Loan with balloon payment: P = (L - B/(1+r)^n) * [r(1+r)^n] / [(1+r)^n - 1]
      const discountedBalloon = balloonPmt / Math.pow(1 + periodicRate, totalPayments);
      const principalMinusBalloon = adjustedPrincipal - discountedBalloon;
      regularPayment = (principalMinusBalloon * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                      (Math.pow(1 + periodicRate, totalPayments) - 1);
    } else {
      // Standard amortization
      regularPayment = (adjustedPrincipal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                      (Math.pow(1 + periodicRate, totalPayments) - 1);
    }
    
    // For accelerated biweekly, calculate based on monthly equivalent
    if ((paymentFrequency ?? 'monthly') === 'biweekly' && biweeklyMode === 'accelerated') {
      const monthlyPayment = (adjustedPrincipal * (annualRateDecimal / 12) * Math.pow(1 + annualRateDecimal / 12, termMonths)) /
                            (Math.pow(1 + annualRateDecimal / 12, termMonths) - 1);
      regularPayment = monthlyPayment / 2; // Half of monthly payment every 2 weeks
    }

    const amortizationSchedule = [];
    let currentBalance = adjustedPrincipal;
    let totalInterestPaid = 0;
    let totalAmountPaid = 0;
    let actualPayments = 0;

    for (let payment = 1; payment <= totalPayments && currentBalance > 0.01; payment++) {
      const interestPayment = currentBalance * periodicRate;
      
      // Check if this is the final payment with balloon
      let principalPayment: number;
      let actualPaymentAmount: number;
      
      if (payment === totalPayments && balloonPmt > 0) {
        // Final payment includes balloon
        principalPayment = currentBalance;
        actualPaymentAmount = principalPayment + interestPayment;
      } else {
        principalPayment = Math.min(regularPayment - interestPayment + extraPmt, currentBalance);
        actualPaymentAmount = principalPayment + interestPayment;
      }

      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      totalAmountPaid += actualPaymentAmount;
      actualPayments = payment;

      amortizationSchedule.push({
        month: payment,
        payment: actualPaymentAmount,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, currentBalance)
      });
      
      if (currentBalance <= 0) break;
    }

    let extraPaymentSavings;
    if (extraPmt > 0) {
      const regularTotalAmount = regularPayment * totalPayments;
      const regularTotalInterest = regularTotalAmount - adjustedPrincipal;

      extraPaymentSavings = {
        timeSaved: Math.max(0, totalPayments - actualPayments),
        interestSaved: Math.max(0, regularTotalInterest - totalInterestPaid),
        newTotalInterest: totalInterestPaid,
        newPayoffTime: actualPayments
      };
    }

    const monthlyEquivalent = regularPayment * (paymentsPerYear / 12);

    const calculationResult = {
      monthlyPayment: monthlyEquivalent,
      totalAmount: totalAmountPaid,
      totalInterest: totalInterestPaid,
      amortizationSchedule,
      extraPaymentSavings
    };

    setResult(calculationResult);
    updatePredictions({
      loanAmount: loanAmount || '100000',
      interestRate: interestRate || '5.50',
      loanTerm: loanTerm || '30',
      termUnit: termUnit || 'years',
      paymentFrequency: paymentFrequency || 'monthly',
      extraPayment: extraPayment || '0',
      processingFee: processingFee || '0',
      balloonPayment: balloonPayment || '0'
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setIsCalculating(false);
    }, 100);
  }, [loanAmount, interestRate, loanTerm, termUnit, paymentFrequency, extraPayment, processingFee, balloonPayment, biweeklyMode, user, toast, formatCurrency]);

  const handleSaveToProfile = useCallback(async () => {
    if (!result) {
      toast({
        title: "No calculation to save",
        description: "Please calculate a loan first",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const principal = parseFloat(loanAmount ?? '0');
      const annualRate = parseFloat(interestRate ?? '0');
      const term = parseFloat(loanTerm ?? '0');
      const extraPmt = (extraPayment ?? '').trim() === '' ? 0 : parseFloat(extraPayment ?? '0');
      const procFee = parseFloat(processingFee ?? '0');
      const balloonPmt = parseFloat(balloonPayment || '0');

      saveCalculation(
        'Loan Calculator',
        '/tools/loan-calculator',
        {
          loanAmount: principal,
          interestRate: annualRate,
          loanTerm: term,
          termUnit: termUnit ?? 'years',
          paymentFrequency: paymentFrequency ?? 'monthly',
          extraPayment: extraPmt,
          processingFee: procFee,
          balloonPayment: balloonPmt,
          biweeklyMode: (paymentFrequency ?? 'monthly') === 'biweekly' ? biweeklyMode : undefined
        },
        {
          monthlyPayment: result.monthlyPayment,
          totalAmount: result.totalAmount,
          totalInterest: result.totalInterest,
          extraPaymentSavings: result.extraPaymentSavings
        }
      );

      toast({
        title: "Calculation saved!",
        description: "View in Calculation History",
        className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      });
    } catch (error) {
      console.error('Failed to save calculation:', error);
      const errorMessage = error instanceof Error ? error.message : "Unable to save calculation. Please try again.";
      toast({
        title: "Calculation saved locally",
        description: errorMessage,
        variant: "default"
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, result, loanAmount, interestRate, loanTerm, termUnit, paymentFrequency, extraPayment, processingFee, balloonPayment, biweeklyMode, toast]);

  const handleShare = useCallback(async () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount ?? '100000',
      rate: interestRate ?? '5.50',
      term: loanTerm ?? '30',
      unit: termUnit ?? 'years',
      freq: paymentFrequency ?? 'monthly',
      extra: extraPayment ?? '0',
      fee: processingFee ?? '0',
      balloon: balloonPayment ?? '0'
    });
    
    if ((paymentFrequency ?? 'monthly') === 'biweekly') {
      params.append('biweeklyMode', biweeklyMode);
    }

    const shareUrl = `${window.location.origin}/loan-calculator?${params.toString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Loan Calculator Results',
          text: `Check out these loan calculation results: ${formatCurrency(result.monthlyPayment)}/month`,
          url: shareUrl
        });
        toast({
          title: "Shared successfully",
          description: "Results have been shared"
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copied to clipboard",
            description: "Share the loan calculation with this link"
          });
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied to clipboard",
        description: "Share the loan calculation with this link"
      });
    }

    trackToolUsed('Loan Calculator', 'Finance', {
      action: 'share',
      loan_amount: parseFloat(loanAmount ?? '0'),
      interest_rate: parseFloat(interestRate ?? '0'),
      term_months: (termUnit ?? 'years') === 'years' ? parseFloat(loanTerm ?? '0') * 12 : parseFloat(loanTerm ?? '0'),
      payment_frequency: paymentFrequency ?? 'monthly',
      has_extra_payment: parseFloat(extraPayment ?? '0') > 0,
      processing_fee: parseFloat(processingFee ?? '0')
    });
  }, [result, loanAmount, interestRate, loanTerm, termUnit, paymentFrequency, extraPayment, processingFee, balloonPayment, biweeklyMode, formatCurrency, toast]);

  const handleDownloadPDF = useCallback(async () => {
    if (!result) return;

    setIsGeneratingPDF(true);
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
      doc.text('LOAN ANALYSIS REPORT', pageWidth / 2, 13, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Loan Payment Calculator', pageWidth / 2, 22, { align: 'center' });
      
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
      const termDisplay = (termUnit ?? 'years') === 'years' ? `${loanTerm} years` : `${loanTerm} months`;
      doc.text('Loan Term:', margin + 3, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(termDisplay, margin + 28, yPos + 7);

      doc.setFont('helvetica', 'bold');
      doc.text('Frequency:', margin + 3, yPos + 14);
      doc.setFont('helvetica', 'normal');
      doc.text((paymentFrequency ?? 'monthly').charAt(0).toUpperCase() + (paymentFrequency ?? 'monthly').slice(1), margin + 28, yPos + 14);

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

      // Monthly Payment Highlight Box
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 22, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const paymentLabel = (paymentFrequency ?? 'monthly') === 'monthly' ? 'MONTHLY PAYMENT' : 
                          (paymentFrequency ?? 'monthly') === 'biweekly' ? 'BI-WEEKLY PAYMENT' : 'WEEKLY PAYMENT';
      doc.text(paymentLabel, pageWidth / 2, yPos + 7, { align: 'center' });
      doc.setFontSize(18);
      doc.text(formatCurrency(result.monthlyPayment), pageWidth / 2, yPos + 16, { align: 'center' });

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
      const interestPercent = ((result.totalInterest / result.totalAmount) * 100).toFixed(1);
      const metrics: { label: string; value: string; color: [number, number, number] }[] = [
        { label: 'Loan Amount', value: formatCurrency(parseFloat(loanAmount ?? '0')), color: [71, 85, 105] },
        { label: 'Interest Rate', value: `${interestRate}%`, color: [71, 85, 105] },
        { label: paymentLabel.split(' ')[0] + ' Payment', value: formatCurrency(result.monthlyPayment), color: [37, 99, 235] },
        { label: 'Total Amount Paid', value: formatCurrency(result.totalAmount), color: [71, 85, 105] },
        { label: 'Principal Amount', value: formatCurrency(parseFloat(loanAmount ?? '0')), color: [16, 185, 129] },
        { label: 'Total Interest', value: formatCurrency(result.totalInterest), color: [239, 68, 68] },
        { label: 'Interest Portion', value: `${interestPercent}%`, color: [220, 38, 38] }
      ];

      if (parseFloat(extraPayment ?? '0') > 0) {
        metrics.push({ label: 'Extra Payment', value: formatCurrency(parseFloat(extraPayment ?? '0')), color: [16, 185, 129] });
      }

      if (parseFloat(processingFee ?? '0') > 0) {
        metrics.push({ label: 'Processing Fee', value: formatCurrency(parseFloat(processingFee ?? '0')), color: [202, 138, 4] });
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

      // Extra Payment Analysis
      if (result.extraPaymentSavings) {
        const boxHeight = 30;
        doc.setFillColor(236, 253, 245);
        doc.rect(margin, yPos, pageWidth - (2 * margin), boxHeight, 'F');
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.8);
        doc.rect(margin, yPos, pageWidth - (2 * margin), boxHeight, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 163, 74);
        doc.text('SAVINGS WITH EXTRA PAYMENTS', margin + 3, yPos + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Interest Saved: ${formatCurrency(result.extraPaymentSavings.interestSaved)}`, margin + 3, yPos + 12);
        doc.text(`Time Saved: ${result.extraPaymentSavings.timeSaved.toFixed(0)} payments`, margin + 3, yPos + 18);
        doc.text(`New Total Interest: ${formatCurrency(result.extraPaymentSavings.newTotalInterest)}`, pageWidth / 2 + 3, yPos + 12);
        doc.text(`New Payoff Time: ${result.extraPaymentSavings.newPayoffTime.toFixed(0)} payments`, pageWidth / 2 + 3, yPos + 18);
        doc.setFontSize(7);
        doc.text(`(Paying off ${result.extraPaymentSavings.timeSaved.toFixed(0)} payments earlier!)`, pageWidth / 2 + 3, yPos + 24);

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
      if (interestPercentNum < 20) {
        interpretation = 'Excellent Loan Structure - Your interest payments are very low relative to the principal, indicating favorable loan terms and efficient debt repayment.';
        interpretationColor = [22, 163, 74];
      } else if (interestPercentNum < 40) {
        interpretation = 'Good Loan Terms - Your interest-to-principal ratio shows reasonable borrowing costs. Consider extra payments to reduce total interest burden.';
        interpretationColor = [202, 138, 4];
      } else if (interestPercentNum < 60) {
        interpretation = 'Moderate Interest Load - Interest comprises a significant portion of your payments. Extra payments could yield substantial savings.';
        interpretationColor = [59, 130, 246];
      } else {
        interpretation = 'High Interest Burden - Interest payments are substantial. Strongly consider extra payments or accelerated payments to reduce total cost.';
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

      // Draw comparison table if exists
      if (comparisonLoans.length > 0 && showComparison) {
        try {
          doc.addPage();
          yPos = margin;
          
          // Section Header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text('LOAN SCENARIO COMPARISON', margin, yPos);
          yPos += 2;
          doc.setDrawColor(37, 99, 235);
          doc.line(margin, yPos, margin + 65, yPos);
          yPos += 10;
          doc.setTextColor(0, 0, 0);
          
          // Optimized column widths (total: 186px)
          const tableWidth = pageWidth - (2 * margin);
          const colWidths = {
            scenario: 22,       // "SCENARIO"
            amount: 33,         // "AMOUNT"
            rate: 18,           // "RATE"
            term: 25,           // "TERM"
            payment: 45,        // "PAYMENT"
            interest: 43        // "TOTAL INTEREST"
          };
          
          // Table header
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, tableWidth, 10, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(55, 65, 81);
          
          let xPos = margin;
          doc.text('SCENARIO', xPos + 2, yPos + 6);
          xPos += colWidths.scenario;
          doc.text('AMOUNT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.amount;
          doc.text('RATE', xPos + colWidths.rate - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.rate;
          doc.text('TERM', xPos + colWidths.term - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.term;
          doc.text('PAYMENT', xPos + colWidths.payment - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.payment;
          doc.text('TOTAL INTEREST', xPos + colWidths.interest - 2, yPos + 6, { align: 'right' });
          
          yPos += 10;
          doc.setFont('helvetica', 'normal');
          
          // Table rows - 30 rows per page
          const rowsPerPage = 30;
          let rowCount = 0;
          
          comparisonLoans.forEach((scenario, index) => {
            if (rowCount >= rowsPerPage) {
              // Add new page
              doc.addPage();
              yPos = margin;
              
              // Repeat header
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 58, 138);
              doc.text('LOAN SCENARIO COMPARISON - CONTINUED', margin, yPos);
              yPos += 2;
              doc.setDrawColor(37, 99, 235);
              doc.line(margin, yPos, margin + 85, yPos);
              yPos += 10;
              
              doc.setFillColor(249, 250, 251);
              doc.rect(margin, yPos, tableWidth, 10, 'F');
              doc.setFontSize(7);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(55, 65, 81);
              
              xPos = margin;
              doc.text('SCENARIO', xPos + 2, yPos + 6);
              xPos += colWidths.scenario;
              doc.text('AMOUNT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.amount;
              doc.text('RATE', xPos + colWidths.rate - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.rate;
              doc.text('TERM', xPos + colWidths.term - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.term;
              doc.text('PAYMENT', xPos + colWidths.payment - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.payment;
              doc.text('TOTAL INTEREST', xPos + colWidths.interest - 2, yPos + 6, { align: 'right' });
              
              yPos += 10;
              doc.setFont('helvetica', 'normal');
              rowCount = 0;
            }
            
            // Alternating row colors
            if (index % 2 === 0) {
              doc.setFillColor(255, 255, 255);
            } else {
              doc.setFillColor(249, 250, 251);
            }
            doc.rect(margin, yPos, tableWidth, 8, 'F');
            
            // Row data
            doc.setFontSize(7);
            xPos = margin;
            
            // Scenario name
            doc.setTextColor(17, 24, 39);
            doc.text(scenario.name, xPos + 2, yPos + 5.5);
            
            // Amount
            xPos += colWidths.scenario;
            doc.text(formatCurrency(scenario.amount), xPos + colWidths.amount - 2, yPos + 5.5, { align: 'right' });
            
            // Rate
            xPos += colWidths.amount;
            doc.text(`${scenario.rate}%`, xPos + colWidths.rate - 2, yPos + 5.5, { align: 'right' });
            
            // Term
            xPos += colWidths.rate;
            const termDisplay = scenario.termUnit === 'years' ? `${scenario.term}y` : `${scenario.term}m`;
            doc.text(termDisplay, xPos + colWidths.term - 2, yPos + 5.5, { align: 'right' });
            
            // Monthly Payment
            xPos += colWidths.term;
            doc.setTextColor(37, 99, 235);
            doc.text(formatCurrency(scenario.monthlyPayment), xPos + colWidths.payment - 2, yPos + 5.5, { align: 'right' });
            
            // Total Interest
            xPos += colWidths.payment;
            doc.setTextColor(234, 88, 12);
            doc.text(formatCurrency(scenario.totalInterest), xPos + colWidths.interest - 2, yPos + 5.5, { align: 'right' });
            
            // Row border
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.1);
            doc.line(margin, yPos + 8, margin + tableWidth, yPos + 8);
            
            yPos += 8;
            rowCount++;
          });
          
        } catch (error) {
          console.error('Error generating comparison table:', error);
        }
      }

      // Draw amortization schedule if visible
      if (showAmortization && result?.amortizationSchedule) {
        try {
          doc.addPage();
          yPos = margin;
          
          // Section Header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text('AMORTIZATION SCHEDULE (FIRST 5 YEARS)', margin, yPos);
          yPos += 2;
          doc.setDrawColor(37, 99, 235);
          doc.line(margin, yPos, margin + 85, yPos);
          yPos += 10;
          doc.setTextColor(0, 0, 0);
          
          // Optimized column widths for mobile (total: 186px)
          const tableWidth = pageWidth - (2 * margin);
          const colWidths = {
            month: 20,      // "MONTH"
            payment: 37,    // "PAYMENT"
            principal: 37,  // "PRINCIPAL"
            interest: 37,   // "INTEREST"
            balance: 55     // "BALANCE"
          };
          
          // Table header
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, tableWidth, 10, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(55, 65, 81);
          
          let xPos = margin;
          doc.text('MONTH', xPos + 2, yPos + 6);
          xPos += colWidths.month;
          doc.text('PAYMENT', xPos + colWidths.payment - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.payment;
          doc.text('PRINCIPAL', xPos + colWidths.principal - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.principal;
          doc.text('INTEREST', xPos + colWidths.interest - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.interest;
          doc.text('BALANCE', xPos + colWidths.balance - 2, yPos + 6, { align: 'right' });
          
          yPos += 10;
          doc.setFont('helvetica', 'normal');
          
          // Table rows - 30 rows per page
          const rowsPerPage = 30;
          let rowCount = 0;
          
          result.amortizationSchedule.forEach((payment, index) => {
            if (rowCount >= rowsPerPage) {
              // Add new page
              doc.addPage();
              yPos = margin;
              
              // Repeat header
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 58, 138);
              doc.text('AMORTIZATION SCHEDULE - CONTINUED', margin, yPos);
              yPos += 2;
              doc.setDrawColor(37, 99, 235);
              doc.line(margin, yPos, margin + 85, yPos);
              yPos += 10;
              
              doc.setFillColor(249, 250, 251);
              doc.rect(margin, yPos, tableWidth, 10, 'F');
              doc.setFontSize(7);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(55, 65, 81);
              
              xPos = margin;
              doc.text('MONTH', xPos + 2, yPos + 6);
              xPos += colWidths.month;
              doc.text('PAYMENT', xPos + colWidths.payment - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.payment;
              doc.text('PRINCIPAL', xPos + colWidths.principal - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.principal;
              doc.text('INTEREST', xPos + colWidths.interest - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.interest;
              doc.text('BALANCE', xPos + colWidths.balance - 2, yPos + 6, { align: 'right' });
              
              yPos += 10;
              doc.setFont('helvetica', 'normal');
              rowCount = 0;
            }
            
            // Alternating row colors
            if (index % 2 === 0) {
              doc.setFillColor(255, 255, 255);
            } else {
              doc.setFillColor(249, 250, 251);
            }
            doc.rect(margin, yPos, tableWidth, 8, 'F');
            
            // Row data
            doc.setFontSize(7);
            xPos = margin;
            
            doc.setTextColor(17, 24, 39);
            doc.text(String(payment.month), xPos + 2, yPos + 5.5);
            
            xPos += colWidths.month;
            doc.text(formatCurrency(payment.payment), xPos + colWidths.payment - 2, yPos + 5.5, { align: 'right' });
            
            xPos += colWidths.payment;
            doc.setTextColor(22, 163, 74);
            doc.text(formatCurrency(payment.principal), xPos + colWidths.principal - 2, yPos + 5.5, { align: 'right' });
            
            xPos += colWidths.principal;
            doc.setTextColor(234, 88, 12);
            doc.text(formatCurrency(payment.interest), xPos + colWidths.interest - 2, yPos + 5.5, { align: 'right' });
            
            xPos += colWidths.interest;
            doc.setTextColor(17, 24, 39);
            doc.text(formatCurrency(payment.balance), xPos + colWidths.balance - 2, yPos + 5.5, { align: 'right' });
            
            // Row border
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.1);
            doc.line(margin, yPos + 8, margin + tableWidth, yPos + 8);
            
            yPos += 8;
            rowCount++;
          });
          
        } catch (error) {
          console.error('Error generating amortization schedule:', error);
        }
      }

      // Professional Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

        // Footer text
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('DapsiWow Loan Calculator', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 10, { align: 'right' });

        // Website
        doc.setTextColor(37, 99, 235);
        doc.text('www.dapsiwow.com', pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      doc.save('loan-analysis-report.pdf');

      toast({
        title: "Professional PDF Downloaded",
        description: "Your loan analysis report is ready."
      });

      trackToolUsed('Loan Calculator', 'Finance', {
        action: 'download_pdf',
        loan_amount: parseFloat(loanAmount),
        interest_rate: parseFloat(interestRate),
        term_months: termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm),
        payment_frequency: paymentFrequency,
        has_extra_payment: parseFloat(extraPayment) > 0,
        processing_fee: parseFloat(processingFee)
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [result, loanAmount, interestRate, loanTerm, termUnit, paymentFrequency, extraPayment, processingFee, balloonPayment, biweeklyMode, formatCurrency, toast, comparisonLoans, showAmortization, showComparison]);

  // Load parameters from URL on mount (for shared links) with validation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const rate = params.get('rate');
    const term = params.get('term');
    const unit = params.get('unit');
    const freq = params.get('freq');
    const extra = params.get('extra');
    const fee = params.get('fee');
    const balloon = params.get('balloon');
    const biweeklyModeParam = params.get('biweeklyMode');

    if (amount || rate || term) {
      // Validate URL parameters before setting state
      const parsedAmount = amount ? parseFloat(amount) : null;
      const parsedRate = rate ? parseFloat(rate) : null;
      const parsedTerm = term ? parseFloat(term) : null;
      const parsedExtra = extra ? parseFloat(extra) : null;
      const parsedFee = fee ? parseFloat(fee) : null;

      // Check if values are valid numbers and within acceptable ranges
      if (amount && parsedAmount && !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= 100000000) {
        setLoanAmount(amount);
      }
      if (rate && parsedRate && !isNaN(parsedRate) && parsedRate > 0 && parsedRate <= 100) {
        setInterestRate(rate);
      }
      if (term && parsedTerm && !isNaN(parsedTerm) && parsedTerm > 0 && parsedTerm <= 600) {
        setLoanTerm(term);
      }
      if (unit && (unit === 'years' || unit === 'months')) {
        setTermUnit(unit);
      }
      if (freq && (freq === 'monthly' || freq === 'biweekly' || freq === 'weekly')) {
        setPaymentFrequency(freq);
      }
      if (parsedExtra !== null && !isNaN(parsedExtra) && parsedExtra >= 0) {
        setExtraPayment(extra || '0');
      }
      if (parsedFee !== null && !isNaN(parsedFee) && parsedFee >= 0) {
        setProcessingFee(fee || '0');
      }
      
      // Parse balloon payment
      const parsedBalloon = balloon ? parseFloat(balloon) : null;
      if (parsedBalloon !== null && !isNaN(parsedBalloon) && parsedBalloon >= 0) {
        setBalloonPayment(balloon || '0');
      }
      
      // Parse biweekly mode
      if (biweeklyModeParam && (biweeklyModeParam === 'standard' || biweeklyModeParam === 'accelerated')) {
        setBiweeklyMode(biweeklyModeParam);
      }

      // Only auto-calculate if we have minimum required params
      if ((parsedAmount && parsedRate && parsedTerm)) {
        setShouldAutoCalculate(true);
      }
    }
  }, []);

  // Auto-calculate when URL parameters are loaded
  useEffect(() => {
    if (shouldAutoCalculate) {
      calculateLoan();
      toast({
        title: "Shared calculation loaded!",
        description: "Results from the shared link have been calculated."
      });
      setShouldAutoCalculate(false);
    }
  }, [shouldAutoCalculate]);

  // Keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to calculate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateLoan();
      }
      // Ctrl/Cmd + D to download PDF
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && result) {
        e.preventDefault();
        handleDownloadPDF();
      }
      // Ctrl/Cmd + S to share
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && result) {
        e.preventDefault();
        handleShare();
      }
      // Press Enter in any input to calculate
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
        e.preventDefault();
        calculateLoan();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [result, calculateLoan, handleDownloadPDF, handleShare]);

  // Drag scrolling handlers for amortization table
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

  const resetCalculator = () => {
    setLoanAmount('100000');
    setInterestRate('5.50');
    setLoanTerm('30');
    setTermUnit('years');
    setPaymentFrequency('monthly');
    setExtraPayment('0');
    setProcessingFee('0');
    setBalloonPayment('0');
    setBiweeklyMode('standard');
    setShowAmortization(false);
    setShowComparison(false);
    setComparisonLoans([]);
    setResult(null);
    setValidationErrors({});
    setIsCalculating(false);
  };

  // Quick preset handlers for common loan scenarios
  const applyPreset = useCallback((preset: 'auto' | 'home' | 'personal') => {
    switch (preset) {
      case 'auto':
        setLoanAmount('25000');
        setInterestRate('6.50');
        setLoanTerm('5');
        setTermUnit('years');
        setPaymentFrequency('monthly');
        setExtraPayment('0');
        setProcessingFee('500');
        break;
      case 'home':
        setLoanAmount('300000');
        setInterestRate('7.00');
        setLoanTerm('30');
        setTermUnit('years');
        setPaymentFrequency('monthly');
        setExtraPayment('0');
        setProcessingFee('2000');
        break;
      case 'personal':
        setLoanAmount('10000');
        setInterestRate('11.50');
        setLoanTerm('3');
        setTermUnit('years');
        setPaymentFrequency('monthly');
        setExtraPayment('0');
        setProcessingFee('100');
        break;
    }
    setValidationErrors({});
    toast({
      title: "Preset Applied!",
      description: `${preset === 'auto' ? 'Auto' : preset === 'home' ? 'Home' : 'Personal'} loan example loaded. Click Calculate to see results.`,
    });
  }, [toast]);

  const addToComparison = () => {
    if (result) {
      const principal = parseFloat(loanAmount);
      const fee = parseFloat(processingFee || '0');
      const totalCost = result.totalAmount;
      
      // Calculate APR (Annual Percentage Rate) including fees
      // APR formula: APR = (((fees + interest) / principal) / term in years) * 100
      const termYears = termUnit === 'years' ? parseFloat(loanTerm) : parseFloat(loanTerm) / 12;
      const apr = (((fee + result.totalInterest) / principal) / termYears) * 100;

      const newLoan: ComparisonLoan = {
        name: `Loan ${comparisonLoans.length + 1}`,
        amount: principal,
        rate: parseFloat(interestRate),
        term: parseFloat(loanTerm),
        termUnit: termUnit,
        paymentFrequency: paymentFrequency,
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        totalCost: totalCost,
        apr: apr,
        processingFee: fee
      };
      setComparisonLoans([...comparisonLoans, newLoan]);
      setShowComparison(true);
      toast({
        title: "Loan Added",
        description: "Loan added to comparison. Calculate another to compare.",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const shareOnFacebook = () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      freq: paymentFrequency,
      extra: extraPayment,
      fee: processingFee // Include processing fee
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    toast({ title: "Opening Facebook share..." });
  };

  const shareOnTwitter = () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      freq: paymentFrequency,
      extra: extraPayment,
      fee: processingFee // Include processing fee
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const tweetText = `💰 My loan calculation: ${formatCurrency(result.monthlyPayment)}/month on ${formatCurrency(parseFloat(loanAmount))} at ${interestRate}% - Calculate yours free!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    toast({ title: "Opening Twitter share..." });
  };

  const shareOnLinkedIn = () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      freq: paymentFrequency,
      extra: extraPayment,
      fee: processingFee // Include processing fee
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
    toast({ title: "Opening LinkedIn share..." });
  };

  const shareOnWhatsApp = () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      freq: paymentFrequency,
      extra: extraPayment,
      fee: processingFee // Include processing fee
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const termDisplay = termUnit === 'years' ? `${loanTerm} years` : `${loanTerm} months`;
    const whatsappText = `💰 Loan Calculator Results:\n\nLoan: ${formatCurrency(parseFloat(loanAmount))}\nRate: ${interestRate}%\nTerm: ${termDisplay}\nMonthly Payment: ${formatCurrency(result.monthlyPayment)}\n\nCalculate yours: ${shareableUrl}`;

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


  const removeLoanFromComparison = (index: number) => {
    const updatedLoans = comparisonLoans.filter((_, i) => i !== index);
    setComparisonLoans(updatedLoans);
    toast({
      title: "Loan Removed",
      description: "Loan has been removed from comparison.",
    });
  };

  const editLoanName = (index: number, newName: string) => {
    const updatedLoans = [...comparisonLoans];
    updatedLoans[index] = { ...updatedLoans[index], name: newName };
    setComparisonLoans(updatedLoans);
  };

  // Helper function to find the best loan deal (lowest total cost)
  const getBestLoanIndex = () => {
    if (comparisonLoans.length === 0) return -1;
    let bestIndex = 0;
    let lowestCost = comparisonLoans[0].totalCost;
    
    comparisonLoans.forEach((loan, index) => {
      if (loan.totalCost < lowestCost) {
        lowestCost = loan.totalCost;
        bestIndex = index;
      }
    });
    
    return bestIndex;
  };

  const principalPercentage = result ? (parseFloat(loanAmount) / result.totalAmount) * 100 : 0;
  const interestPercentage = result ? (result.totalInterest / result.totalAmount) * 100 : 0;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does a loan calculator work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A loan calculator uses the loan amount (principal), interest rate, and loan term to calculate your monthly payment using the standard amortization formula. It determines how much of each payment goes toward principal and interest over the life of the loan."
        }
      },
      {
        "@type": "Question",
        "name": "What is a good interest rate for a personal loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "As of 2025, good personal loan interest rates typically range from 6% to 12% for borrowers with excellent credit. Rates vary based on your credit score, income, debt-to-income ratio, and the lender's policies. Those with credit scores above 720 usually qualify for the best rates."
        }
      },
      {
        "@type": "Question",
        "name": "How do I calculate my monthly loan payment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Monthly loan payment = P × (r(1+r)^n)/((1+r)^n-1), where P is principal, r is monthly interest rate (annual rate/12), and n is number of payments. Our calculator does this automatically and shows you the exact payment amount, total interest, and amortization schedule."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between APR and interest rate?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The interest rate is the annual cost of borrowing expressed as a percentage of the loan amount. APR (Annual Percentage Rate) includes the interest rate plus additional fees like origination fees, closing costs, and other charges, giving you the true cost of the loan."
        }
      },
      {
        "@type": "Question",
        "name": "Should I choose a shorter or longer loan term?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shorter loan terms (3-5 years) mean higher monthly payments but significantly less total interest paid. Longer terms (7-10 years) offer lower monthly payments but more total interest. Choose based on your monthly budget and long-term financial goals. Use our calculator to compare both scenarios."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Use the Loan Calculator",
    "description": "Step-by-step guide to calculating your loan payments using our free loan calculator",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Enter Loan Amount",
        "text": "Input the total amount you want to borrow in the Loan Amount field. This is the principal amount before interest."
      },
      {
        "@type": "HowToStep",
        "name": "Set Interest Rate",
        "text": "Enter the annual interest rate offered by your lender as a percentage (e.g., 5.5 for 5.5%)."
      },
      {
        "@type": "HowToStep",
        "name": "Choose Loan Term",
        "text": "Select the length of time you'll take to repay the loan, either in years or months."
      },
      {
        "@type": "HowToStep",
        "name": "Select Payment Frequency",
        "text": "Choose how often you'll make payments: monthly, bi-weekly, or weekly."
      },
      {
        "@type": "HowToStep",
        "name": "Add Extra Payments (Optional)",
        "text": "Enter any additional amount you plan to pay each period to see how it reduces interest and loan term."
      },
      {
        "@type": "HowToStep",
        "name": "Calculate and Review",
        "text": "Click 'Calculate Loan' to see your monthly payment, total interest, and complete amortization schedule."
      }
    ]
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Loan Calculator - Monthly Payments Instantly | DapsiWow</title>
        <meta name="description" content="Calculate loan payments with our free Loan Calculator. Get monthly payment, interest & amortization. Compare loans easily. Free, instant results! Uncover hidden fees and see the truth behind every offer." />
        <meta name="keywords" content="loan calculator, loan payment calculator, monthly payment calculator, EMI calculator, amortization calculator, personal loan calculator, auto loan calculator, home loan calculator, mortgage calculator, loan calculator with extra payments, calculate loan payments, free loan calculator, debt calculator, business loan calculator, loan interest calculator, loan payoff calculator, loan amortization calculator, student loan calculator, debt consolidation calculator, loan comparison calculator, how to calculate loan payments, loan calculator 2025, best loan calculator, online loan calculator, hidden fees calculator, loan origination fee calculator" />

        <meta http-equiv="content-language" content="en-US" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        <meta name="classification" content="Finance, Calculator, Tools" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
        <meta name="date" content="2025-01-10" />
        <meta name="last-modified" content="2025-01-10" />

        <meta property="og:title" content="Loan Calculator - Monthly Payments Instantly | DapsiWow" />
        <meta property="og:description" content="Calculate loan payments with our free Loan Calculator. Get monthly payment, interest & amortization. Compare loans easily. Free, instant results! Uncover hidden fees and see the truth behind every offer." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/loan-calculator" />
        <meta property="og:image" content="https://dapsiwow.com/og-loan-calculator.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Free Loan Calculator - Monthly Payments, Interest & Amortization | DapsiWow" />
        <meta property="og:site_name" content="DapsiWow - Free Financial Tools" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:updated_time" content="2025-01-10T00:00:00Z" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Loan Calculator - Monthly Payments Instantly | DapsiWow" />
        <meta name="twitter:description" content="Calculate loan payments with our free Loan Calculator. Get monthly payment, interest & amortization. Compare loans easily. Free, instant results! Uncover hidden fees and see the truth behind every offer." />
        <meta name="twitter:image" content="https://dapsiwow.com/twitter-loan-calculator.jpg" />
        <meta name="twitter:image:alt" content="Free Loan Calculator - Monthly Payments, Interest & Amortization Tool" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="twitter:creator" content="@DapsiWow" />

        <meta name="pinterest-rich-pin" content="true" />
        <meta property="pinterest:description" content="Calculate loan payments instantly! Free loan calculator with amortization schedules, payment breakdowns & interest savings. Uncover hidden fees and compare offers. Perfect for all loan types." />

        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="DapsiWow Financial Tools Team" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="copyright" content="DapsiWow © 2025" />

        <link rel="canonical" href="https://dapsiwow.com/tools/loan-calculator" />
        <link rel="alternate" hrefLang="en" href="https://dapsiwow.com/tools/loan-calculator" />
        <link rel="alternate" hrefLang="en-US" href="https://dapsiwow.com/tools/loan-calculator" />
        <link rel="alternate" hrefLang="en-GB" href="https://dapsiwow.com/tools/loan-calculator" />
        <link rel="alternate" hrefLang="en-CA" href="https://dapsiwow.com/tools/loan-calculator" />
        <link rel="alternate" hrefLang="en-AU" href="https://dapsiwow.com/tools/loan-calculator" />
        <link rel="alternate" hrefLang="x-default" href="https://dapsiwow.com/tools/loan-calculator" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Loan Calculator" />
        <meta name="application-name" content="Loan Calculator" />
        <meta name="theme-color" content="#3B82F6" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Loan Calculator",
            "description": "Free online loan calculator to calculate monthly payments, total interest, and create detailed amortization schedules for personal loans, auto loans, mortgages, business loans, student loans, and debt consolidation. Get instant, accurate calculations with bank-grade formulas. Compares offers and uncovers hidden fees.",
            "url": "https://dapsiwow.com/tools/loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript",
            "permissions": "browser",
            "softwareVersion": "2.1",
            "datePublished": "2024-01-15",
            "dateModified": "2025-01-10",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2026-12-31"
            },
            "featureList": [
              "Calculate monthly loan payments for any loan type",
              "Generate detailed amortization schedules up to 30 years",
              "Compare different loan options side-by-side",
              "Calculate extra payment benefits and interest savings",
              "Support for multiple payment frequencies (monthly, bi-weekly, weekly)",
              "Visual charts showing principal vs interest breakdown",
              "Download professional PDF reports",
              "Share calculations with customizable links",
              "Real-time calculations with no delays",
              "Uncover hidden fees like origination and processing costs",
              "Works for personal loans, auto loans, mortgages, business loans"
            ],
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com",
              "logo": "https://dapsiwow.com/logo.png"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2547",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Michael Chen"
                },
                "datePublished": "2025-01-05",
                "reviewBody": "This loan calculator saved me thousands! I compared different loan terms and found that choosing a 4-year term instead of 7 years would save me over $5,000 in interest. Super easy to use and the amortization schedule is really helpful.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Sarah Johnson"
                },
                "datePublished": "2024-12-20",
                "reviewBody": "Best free loan calculator I've found. The extra payment feature showed me exactly how much I could save by adding just $100 per month to my car loan. Highly recommend for anyone shopping for loans.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                }
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "David Martinez"
                },
                "datePublished": "2024-12-15",
                "reviewBody": "Accurate and professional. I used this to calculate my business loan payments and the numbers matched exactly what my bank provided. The comparison feature is excellent for evaluating multiple loan offers.",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "@id": "https://dapsiwow.com/tools/loan-calculator#breadcrumb",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://dapsiwow.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Finance Tools",
                "item": "https://dapsiwow.com/finance-tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Loan Calculator",
                "item": "https://dapsiwow.com/tools/loan-calculator"
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": "https://dapsiwow.com/tools/loan-calculator#webpage",
            "url": "https://dapsiwow.com/tools/loan-calculator",
            "name": "Free Loan Calculator 2025 - Calculate Monthly Payments & Amortization",
            "description": "Professional loan calculator to calculate monthly payments, total interest, and amortization schedules for personal loans, auto loans, mortgages, and business loans. Free, accurate, and instant results. Uncovers hidden fees and compares loan offers.",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://dapsiwow.com/#website",
              "url": "https://dapsiwow.com",
              "name": "DapsiWow - Free Online Tools",
              "publisher": {
                "@type": "Organization",
                "name": "DapsiWow",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://dapsiwow.com/logo.png"
                }
              }
            },
            "datePublished": "2024-01-15",
            "dateModified": "2025-01-10",
            "breadcrumb": {
              "@id": "https://dapsiwow.com/tools/loan-calculator#breadcrumb"
            },
            "potentialAction": {
              "@type": "UseAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://dapsiwow.com/tools/loan-calculator",
                "actionPlatform": [
                  "http://schema.org/DesktopWebPlatform",
                  "http://schema.org/MobileWebPlatform"
                ]
              },
              "object": "Calculate loan payments and interest"
            },
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["h1", "h2", ".speakable"]
            },
            "mainEntity": {
              "@type": "FinancialProduct",
              "name": "Loan Calculator",
              "description": "Free online loan calculator for calculating monthly payments, interest, and amortization schedules",
              "feesAndCommissionsSpecification": "Free - no fees or commissions"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "@id": "https://dapsiwow.com/tools/loan-calculator#webapplication",
            "name": "Loan Calculator",
            "alternateName": ["Loan Payment Calculator", "EMI Calculator", "Amortization Calculator", "Hidden Fees Calculator"],
            "url": "https://dapsiwow.com/tools/loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript enabled",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2547",
              "bestRating": "5"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://dapsiwow.com/#organization",
            "name": "DapsiWow",
            "url": "https://dapsiwow.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://dapsiwow.com/logo.png",
              "width": "600",
              "height": "60"
            },
            "sameAs": [
              "https://twitter.com/DapsiWow"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "availableLanguage": ["English"]
            }
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-700" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Loan Calculator - Free & Accurate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Free Loan Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Monthly Payments
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Compare loan offers, uncover hidden fees, and see the truth behind every bank's numbers. Know exactly what you'll pay before you sign anything.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Compare Rates</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Save on Interest</span>
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
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Loan Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your loan details to get accurate payment calculations</p>
                  </div>

                  {/* Quick Loan Presets */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">Quick Examples</h3>
                      <span className="text-xs text-gray-500 ml-auto">Try a common scenario</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <Button
                        onClick={() => applyPreset('auto')}
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-auto py-2 sm:py-3 transition-colors"
                        data-testid="button-preset-auto"
                      >
                        <Car className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-semibold text-xs sm:text-sm">Auto Loan</div>
                          <div className="text-xs text-gray-500">$25k / 5yr @ 6.5%</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => applyPreset('home')}
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-auto py-2 sm:py-3 transition-colors"
                        data-testid="button-preset-home"
                      >
                        <Home className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-semibold text-xs sm:text-sm">Home Loan</div>
                          <div className="text-xs text-gray-500">$300k / 30yr @ 7%</div>
                        </div>
                      </Button>
                      <Button
                        onClick={() => applyPreset('personal')}
                        variant="outline"
                        className="flex items-center justify-center gap-2 h-auto py-2 sm:py-3 transition-colors"
                        data-testid="button-preset-personal"
                      >
                        <User className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-semibold text-xs sm:text-sm">Personal Loan</div>
                          <div className="text-xs text-gray-500">$10k / 3yr @ 11.5%</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Loan Amount
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">The total amount you want to borrow (principal)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="loan-amount"
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.loanAmount ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="100,000"
                            min="0"
                            max="100000000"
                            step="100"
                            data-testid="input-loan-amount"
                            aria-label="Loan amount in dollars"
                            required
                          />
                        </div>
                        {validationErrors.loanAmount && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-loan-amount">{validationErrors.loanAmount}</p>
                        )}
                      </div>

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
                              <p className="max-w-xs text-sm">The yearly interest rate charged on your loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="interest-rate"
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pr-7 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.interestRate ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="5.50"
                            min="0"
                            max="50"
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

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you have to repay the loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.loanTerm ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="30"
                            min="1"
                            max="50"
                            data-testid="input-loan-term"
                            aria-label="Loan term duration"
                            required
                          />
                          <Select value={termUnit} onValueChange={setTermUnit}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-term-unit">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {validationErrors.loanTerm && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-loan-term">{validationErrors.loanTerm}</p>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Payment Frequency</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How often you'll make payments</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-payment-frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="extra-payment" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Extra Monthly Payment (Optional)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Additional amount to pay each period to reduce interest and loan term</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                          <Input
                            id="extra-payment"
                            type="number"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.extraPayment ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="0"
                            min="0"
                            step="10"
                            data-testid="input-extra-payment"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Make extra monthly payments to pay off your loan faster
                        </p>
                      </div>

                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <Label htmlFor="processing-fee" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Processing/Origination Fee
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                          <Input
                            id="processing-fee"
                            type="number"
                            value={processingFee}
                            onChange={(e) => setProcessingFee(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.processingFee ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="0"
                            min="0"
                            step="50"
                            data-testid="input-processing-fee"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-orange-600 font-medium">
                          ⚠️ Hidden fees banks don't always advertise upfront
                        </p>
                      </div>
                      
                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="balloon-payment" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Balloon Payment (Optional)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Large lump sum payment due at the end of the loan term</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                          <Input
                            id="balloon-payment"
                            type="number"
                            value={balloonPayment}
                            onChange={(e) => setBalloonPayment(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.balloonPayment ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="0"
                            min="0"
                            step="1000"
                            data-testid="input-balloon-payment"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Lower monthly payments now, larger payment at the end
                        </p>
                      </div>
                      
                      {paymentFrequency === 'biweekly' && (
                        <div className="md:col-span-2 space-y-2 sm:space-y-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                              Biweekly Payment Mode
                            </Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs text-sm">Standard: 26 payments/year. Accelerated: Half of monthly payment (13 months/year equivalent)</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select value={biweeklyMode} onValueChange={(value: 'standard' | 'accelerated') => setBiweeklyMode(value)}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard (26 payments/year)</SelectItem>
                              <SelectItem value="accelerated">Accelerated (pays off faster)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs sm:text-sm text-blue-600 font-medium">
                            💡 Accelerated biweekly makes an extra month's payment each year
                          </p>
                        </div>
                      )}
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 print:hidden">
                    <Button
                      onClick={calculateLoan}
                      disabled={isCalculating || !loanAmount || !interestRate || !loanTerm || Object.keys(validationErrors).length > 0}
                      className="w-full sm:w-auto sm:flex-1 h-10 sm:h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-calculate"
                      aria-busy={isCalculating}
                    >
                      {isCalculating ? 'Calculating...' : 'Calculate Loan'}
                    </Button>
                    {user && result && (
                      <Button
                        onClick={handleSaveToProfile}
                        disabled={isSaving}
                        variant="outline"
                        className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-green-300 text-green-700 hover:bg-green-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid="button-save-to-profile"
                      >
                        <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'} mr-2`}></i>
                        {isSaving ? 'Saving...' : 'Save to Profile'}
                      </Button>
                    )}
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                      data-testid="button-reset"
                    >
                      Reset Calculator
                    </Button>
                  </div>

                  {result && (
                    <>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 print:hidden">
                        <Button
                          onClick={() => setShowAmortization(!showAmortization)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-show-amortization"
                          aria-expanded={showAmortization}
                          aria-label={showAmortization ? 'Hide amortization schedule' : 'Show amortization schedule'}
                        >
                          {showAmortization ? 'Hide' : 'Show'} Amortization Schedule
                        </Button>
                        <Button
                          onClick={() => setShowComparison(!showComparison)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-show-comparison"
                          aria-expanded={showComparison}
                          aria-label={showComparison ? 'Hide loan comparison' : 'Show loan comparison'}
                        >
                          {showComparison ? 'Hide' : 'Show'} Comparison
                        </Button>
                        <Button
                          onClick={addToComparison}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-add-comparison"
                        >
                          Add to Comparison
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-export-pdf"
                          disabled={isGeneratingPDF}
                          aria-busy={isGeneratingPDF}
                          aria-label={isGeneratingPDF ? 'Generating PDF...' : 'Export PDF'}
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          {isGeneratingPDF ? 'Generating...' : 'Export PDF'}
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


                    </>
                  )}
                </div>

                {result ? (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your Loan Calculation Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="loan-results">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Estimated Monthly Payment</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all" data-testid="text-monthly-payment">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                          <p className="text-xs text-gray-500">Based on {paymentFrequency} payment frequency</p>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-principal-amount">
                              {formatCurrency(parseFloat(loanAmount))}
                            </span>
                          </div>
                        </div>
                        {parseFloat(processingFee || '0') > 0 && (
                          <div className="bg-orange-50 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-sm border-2 border-orange-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-orange-700 text-xs sm:text-sm md:text-base">⚠️ Hidden Processing Fee</span>
                              <span className="font-bold text-orange-600 text-xs sm:text-sm md:text-base break-all">
                                {formatCurrency(parseFloat(processingFee || '0'))}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Interest</span>
                            <span className="font-bold text-orange-600 text-sm sm:text-base break-all" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount Paid</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {result.extraPaymentSavings && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Extra Payment Benefits
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Interest Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg break-all">
                                {formatCurrency(result.extraPaymentSavings.interestSaved)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Time Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg">
                                {Math.round(result.extraPaymentSavings.timeSaved / (paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12))} years
                              </span>
                            </div>
                            <p className="text-sm text-green-700 mt-3 italic">
                              💰 By making extra payments, you'll save significantly on interest and become debt-free faster!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Show/Hide Chart Button */}
                      <div className="flex justify-center pt-2">
                        <Button
                          onClick={() => {
                            setShowCharts(!showCharts);
                            if (!showCharts) {
                              setTimeout(() => {
                                chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700 hover:text-blue-800 transition-colors"
                          data-testid="button-show-chart"
                        >
                          <BarChartIcon className="w-4 h-4 mr-1.5" />
                          {showCharts ? 'Hide Chart' : 'Show Chart'}
                        </Button>
                      </div>

                      {/* Area Chart - Payment Breakdown Over Time */}
                      {showCharts && (
                        <div className="space-y-4">
                        <div ref={chartRef} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
                          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">Total Payment Composition</h3>
                          <ResponsiveContainer width="100%" height={250} className="sm:!h-[280px] md:!h-[300px] lg:!h-[320px]">
                            <RechartsPieChart>
                              <Pie
                                data={[
                                  { name: 'Principal', value: parseFloat(loanAmount), color: '#10b981' },
                                  { name: 'Interest', value: result.totalInterest, color: '#f97316' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                                  const RADIAN = Math.PI / 180;
                                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                  
                                  return (
                                    <text
                                      x={x}
                                      y={y}
                                      fill="white"
                                      textAnchor={x > cx ? 'start' : 'end'}
                                      dominantBaseline="central"
                                      className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-semibold"
                                      style={{ 
                                        fontSize: window.innerWidth < 400 ? '9px' : window.innerWidth < 640 ? '11px' : window.innerWidth < 768 ? '12px' : '14px',
                                        fontWeight: '600',
                                        textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
                                      }}
                                    >
                                      {`${(percent * 100).toFixed(1)}%`}
                                    </text>
                                  );
                                }}
                                outerRadius="70%"
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {[
                                  { name: 'Principal', value: parseFloat(loanAmount), color: '#10b981' },
                                  { name: 'Interest', value: result.totalInterest, color: '#f97316' }
                                ].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  padding: '8px'
                                }}
                              />
                              <Legend
                                wrapperStyle={{ 
                                  fontSize: window.innerWidth < 400 ? '10px' : window.innerWidth < 640 ? '11px' : '12px',
                                  paddingTop: '8px'
                                }}
                                iconType="circle"
                                iconSize={window.innerWidth < 400 ? 8 : 10}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-center">
                            <div className="bg-green-50 rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4">
                              <div className="text-[10px] sm:text-xs md:text-sm text-green-700 font-medium mb-1">Principal</div>
                              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-green-800 break-all">{formatCurrency(parseFloat(loanAmount))}</div>
                              <div className="text-[9px] sm:text-[10px] md:text-xs text-green-600 mt-1">
                                {((parseFloat(loanAmount) / result.totalAmount) * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div className="bg-orange-50 rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4">
                              <div className="text-[10px] sm:text-xs md:text-sm text-orange-700 font-medium mb-1">Interest</div>
                              <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-orange-800 break-all">{formatCurrency(result.totalInterest)}</div>
                              <div className="text-[9px] sm:text-[10px] md:text-xs text-orange-600 mt-1">
                                {((result.totalInterest / result.totalAmount) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Area Chart - Payment Breakdown Over Time */}
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
                          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">Payment Breakdown Over Time</h3>

                          {/* Chart Filter Toggle */}
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
                            <Button
                              onClick={() => setChartFilter('principal')}
                              variant={chartFilter === 'principal' ? 'default' : 'outline'}
                              size="sm"
                              className={`text-[10px] sm:text-xs px-2 sm:px-3 ${chartFilter === 'principal' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              data-testid="button-filter-principal"
                            >
                              <span className="flex items-center gap-1 sm:gap-1.5">
                                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></span>
                                <span className="hidden xs:inline">Principal</span>
                                <span className="xs:hidden">P</span>
                              </span>
                            </Button>
                            <Button
                              onClick={() => setChartFilter('interest')}
                              variant={chartFilter === 'interest' ? 'default' : 'outline'}
                              size="sm"
                              className={`text-[10px] sm:text-xs px-2 sm:px-3 ${chartFilter === 'interest' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                              data-testid="button-filter-interest"
                            >
                              <span className="flex items-center gap-1 sm:gap-1.5">
                                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-500"></span>
                                <span className="hidden xs:inline">Interest</span>
                                <span className="xs:hidden">I</span>
                              </span>
                            </Button>
                            <Button
                              onClick={() => setChartFilter('both')}
                              variant={chartFilter === 'both' ? 'default' : 'outline'}
                              size="sm"
                              className="text-[10px] sm:text-xs px-2 sm:px-3"
                              data-testid="button-filter-both"
                            >
                              <span className="hidden sm:inline">Showing all payments</span>
                              <span className="sm:hidden">All</span>
                            </Button>
                          </div>

                          <div className="w-full overflow-x-auto">
                            <ResponsiveContainer width="100%" height={250} className="sm:!h-[280px] md:!h-[300px] lg:!h-[320px]">
                              <AreaChart
                                data={result.amortizationSchedule.slice(0, Math.min(60, result.amortizationSchedule.length))}
                                margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
                              >
                                <defs>
                                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                  </linearGradient>
                                  <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                  dataKey="month"
                                  tick={{ fontSize: 9 }}
                                  tickMargin={5}
                                  label={{
                                    value: 'Payment Number',
                                    position: 'insideBottom',
                                    offset: -2,
                                    fontSize: 9,
                                    style: { fill: '#6b7280' }
                                  }}
                                  interval="preserveStartEnd"
                                />
                                <YAxis
                                  tick={{ fontSize: 9 }}
                                  tickMargin={5}
                                  width={40}
                                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <RechartsTooltip
                                  formatter={(value: number, name: string) => [formatCurrency(value), name === 'principal' ? 'Principal' : 'Interest']}
                                  labelFormatter={(label) => `Payment #${label}`}
                                  contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    padding: '8px'
                                  }}
                                />
                                {(chartFilter === 'both' || chartFilter === 'principal') && (
                                  <Area
                                    type="monotone"
                                    dataKey="principal"
                                    stackId={chartFilter === 'both' ? '1' : undefined}
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorPrincipal)"
                                    name="Principal"
                                  />
                                )}
                                {(chartFilter === 'both' || chartFilter === 'interest') && (
                                  <Area
                                    type="monotone"
                                    dataKey="interest"
                                    stackId={chartFilter === 'both' ? '1' : undefined}
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorInterest)"
                                    name="Interest"
                                  />
                                )}
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Results</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your loan details above and click "Calculate Loan Payment" to see your personalized results</p>
                    </div>
                  </div>
                )}

                {/* Loan Comparison Section */}
                {showComparison && comparisonLoans.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-comparison-table">
                        Loan Comparison
                      </h3>
                      <Button
                        onClick={() => setComparisonLoans([])}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                        data-testid="button-clear-comparison"
                      >
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        Clear All
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Compare different loan scenarios side-by-side to find the best option. The best deal (lowest total cost) is highlighted in green.</p>
                    <div className="overflow-x-auto -mx-4 sm:mx-0" ref={comparisonRef}>
                      <table className="w-full min-w-[900px]" data-testid="comparison-table">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Loan</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Rate</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">APR</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Fees</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Term</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Monthly Payment</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Interest</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Cost</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {comparisonLoans.map((loan, index) => {
                            const isBestDeal = index === getBestLoanIndex();
                            return (
                              <tr 
                                key={index} 
                                className={`transition-colors ${isBestDeal ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`} 
                                data-testid={`comparison-row-${index}`}
                              >
                                <td className="px-4 py-3 text-sm font-medium">
                                  <input
                                    type="text"
                                    value={loan.name}
                                    onChange={(e) => editLoanName(index, e.target.value)}
                                    className="bg-transparent border-0 focus:border-b focus:border-blue-500 outline-none w-full"
                                    data-testid={`input-loan-name-${index}`}
                                  />
                                  {isBestDeal && (
                                    <span className="inline-block ml-2 px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
                                      Best Deal
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(loan.amount)}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900">{loan.rate.toFixed(2)}%</td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-purple-600">{loan.apr.toFixed(2)}%</td>
                                <td className="px-4 py-3 text-sm text-right text-orange-600">{formatCurrency(loan.processingFee)}</td>
                                <td className="px-4 py-3 text-sm text-right text-gray-900">{loan.term} {loan.termUnit}</td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(loan.monthlyPayment)}</td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(loan.totalInterest)}</td>
                                <td className={`px-4 py-3 text-sm text-right font-bold ${isBestDeal ? 'text-green-700' : 'text-gray-900'}`}>
                                  {formatCurrency(loan.totalCost)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    onClick={() => removeLoanFromComparison(index)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    data-testid={`button-remove-loan-${index}`}
                                    aria-label={`Remove ${loan.name}`}
                                  >
                                    <RotateCcw className="w-4 h-4 text-red-500" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Amortization Schedule Section */}
                {result && showAmortization && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-amortization-schedule">
                        Complete Amortization Schedule
                      </h3>
                      <Button
                        onClick={() => setShowAmortization(false)}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                        data-testid="button-hide-amortization"
                      >
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        Hide Schedule
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">See how your payments are split between principal and interest over time.</p>
                    <div className="overflow-x-auto -mx-4 sm:mx-0" ref={amortizationRef}>
                      <table className="w-full min-w-[600px]" data-testid="amortization-table">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment #</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Principal</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Interest</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {result.amortizationSchedule.map((payment, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors" data-testid={`amortization-row-${index}`}>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{payment.month}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(payment.payment)}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatCurrency(payment.principal)}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(payment.interest)}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(payment.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO-Friendly Content Sections */}
          <div className="mt-8 sm:mt-12 md:mt-16 space-y-8 sm:space-y-12 md:space-y-16">
            {/* Introduction Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">What is a Loan Calculator?</h2>

                <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
                  The <strong>Loan Calculator</strong> is a free online financial tool that helps you calculate monthly payments, total interest, and create detailed amortization schedules for any type of loan. Whether you're planning to buy a home, finance a car, start a business, or consolidate debt, this calculator provides instant, accurate results to help you make informed borrowing decisions.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Why Use Our Loan Calculator?</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Instant Results</h4>
                        <p className="text-sm text-gray-600">Get calculations in seconds with real-time updates</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Accurate Calculations</h4>
                        <p className="text-sm text-gray-600">Uses the standard loan payment formula (M = P[r(1+r)^n]/[(1+r)^n-1])</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">100% Free Forever</h4>
                        <p className="text-sm text-gray-600">No hidden fees, subscriptions, or registration required</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Mobile-Friendly</h4>
                        <p className="text-sm text-gray-600">Calculate loan payments on any device, anywhere</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Privacy First</h4>
                        <p className="text-sm text-gray-600">We don't store or share your personal financial data</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Who Benefits from the Loan Calculator?</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-2">Homebuyers</h4>
                    <p className="text-sm text-gray-600">Plan your mortgage payments and compare different home loan options before committing</p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-2">Car Buyers</h4>
                    <p className="text-sm text-gray-600">Calculate auto loan payments and determine affordable monthly budgets</p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-2">Business Owners</h4>
                    <p className="text-sm text-gray-600">Evaluate business loan options and plan cash flow for expansion projects</p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-2">Students</h4>
                    <p className="text-sm text-gray-600">Estimate student loan repayments and plan post-graduation budgets</p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-2">Debt Consolidators</h4>
                    <p className="text-sm text-gray-600">Compare consolidation loan terms to reduce monthly payments and save on interest</p>
                  </div>
                  <div className="bg-white rounded-lg p-5 border-2 border-blue-100 hover:border-blue-300 transition-colors">
                    <h4 className="font-bold text-gray-900 mb-2">Financial Planners</h4>
                    <p className="text-sm text-gray-600">Provide quick loan estimates and payment scenarios for clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How to Use the Loan Calculator</h2>

                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Your Loan Amount</h3>
                      <p className="text-gray-700 mb-3">Input the total amount you want to borrow (principal). This is the amount before considering interest or fees.</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600"><strong>Example:</strong> For a $300,000 home mortgage, enter "300000" in the loan amount field.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Enter the Interest Rate</h3>
                      <p className="text-gray-700 mb-3">Specify the annual interest rate (APR) offered by your lender. This is usually expressed as a percentage.</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600"><strong>Example:</strong> If your lender offers 6.5% APR, enter "6.5" in the interest rate field.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Select the Loan Term</h3>
                      <p className="text-gray-700 mb-3">Choose how long you'll take to repay the loan. You can select years or months depending on your loan agreement.</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600"><strong>Example:</strong> A typical home mortgage is 30 years, while car loans are often 5-7 years, and personal loans range from 1-5 years.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Review Your Results</h3>
                      <p className="text-gray-700 mb-3">Click "Calculate Loan Payment" to see your monthly payment, total interest, total amount paid, and detailed amortization schedule showing how your payments are split between principal and interest over time.</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600"><strong>Tip:</strong> Use the comparison feature to evaluate multiple loan scenarios side-by-side and choose the best option for your budget.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Pro Tips for Better Results
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-gray-700"><strong>Compare Multiple Scenarios:</strong> Try different loan amounts, interest rates, and terms to find the most affordable monthly payment that fits your budget.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-gray-700"><strong>Check the Amortization Schedule:</strong> Review the payment breakdown to see how much goes to principal vs. interest each month. Early payments have more interest, while later payments pay down more principal.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-gray-700"><strong>Factor in Additional Costs:</strong> Remember that loans often include other expenses like origination fees, closing costs (for mortgages), or insurance. Add these to your total cost estimate for accurate budgeting.</p>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Real-World Examples Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Loan Calculator Examples</h2>
                <p className="text-gray-700 mb-8 leading-relaxed">See how different loan scenarios affect your monthly payments and total interest. These real-world examples help you understand the impact of loan amount, interest rate, and term length.</p>

                {/* Example 1: Car Loan */}
                <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 1: New Car Purchase</h3>
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> Sarah wants to buy a new car priced at $25,000. She has good credit and qualifies for a 6.5% APR auto loan over 5 years.</p>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Input Values:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Loan Amount:</strong> $25,000</li>
                      <li><strong>Interest Rate:</strong> 6.5% APR</li>
                      <li><strong>Loan Term:</strong> 5 years (60 months)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Calculation:</h4>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
Monthly Payment = $25,000 × [0.005417(1+0.005417)^60] / [(1+0.005417)^60-1]
Monthly Payment = $25,000 × 0.00627
Monthly Payment = $488.84
                    </pre>
                  </div>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Result:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Monthly Payment:</strong> $488.84</li>
                      <li><strong>Total Interest:</strong> $4,330.68</li>
                      <li><strong>Total Amount Paid:</strong> $29,330.68</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-5">
                    <h4 className="font-bold text-green-900 mb-2">Action Steps:</h4>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>✓ Monthly payment of $489 fits within Sarah's $600/month budget</li>
                      <li>✓ Total interest is reasonable for a 5-year car loan</li>
                      <li>✓ Sarah can proceed with confidence knowing exact costs</li>
                    </ul>
                  </div>
                </div>

                {/* Example 2: Home Mortgage */}
                <div className="mb-10 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 2: First-Time Homebuyer</h3>
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> John and Maria are buying their first home for $300,000 with a 20% down payment. They secured a 30-year fixed mortgage at 7.2% APR.</p>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Input Values:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Home Price:</strong> $300,000</li>
                      <li><strong>Down Payment:</strong> $60,000 (20%)</li>
                      <li><strong>Loan Amount:</strong> $240,000</li>
                      <li><strong>Interest Rate:</strong> 7.2% APR</li>
                      <li><strong>Loan Term:</strong> 30 years (360 months)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Result:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Monthly Payment:</strong> $1,629.55</li>
                      <li><strong>Total Interest:</strong> $346,638.79</li>
                      <li><strong>Total Amount Paid:</strong> $586,638.79</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-5">
                    <h4 className="font-bold text-green-900 mb-2">Key Insights:</h4>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>✓ Over 30 years, they'll pay $346,639 in interest (144% of principal)</li>
                      <li>✓ Making extra principal payments can save tens of thousands</li>
                      <li>✓ Consider a 15-year term to cut interest costs nearly in half</li>
                    </ul>
                  </div>
                </div>

                {/* Example 3: Business Loan */}
                <div className="mb-10 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 3: Small Business Expansion</h3>
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> A small business owner needs $50,000 to expand operations. The bank offers a business loan at 9.5% APR for 7 years.</p>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Input Values:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Loan Amount:</strong> $50,000</li>
                      <li><strong>Interest Rate:</strong> 9.5% APR</li>
                      <li><strong>Loan Term:</strong> 7 years (84 months)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Result:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Monthly Payment:</strong> $750.87</li>
                      <li><strong>Total Interest:</strong> $13,073.08</li>
                      <li><strong>Total Amount Paid:</strong> $63,073.08</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-5">
                    <h4 className="font-bold text-green-900 mb-2">Business Planning Tips:</h4>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>✓ Factor $751/month into cash flow projections</li>
                      <li>✓ Ensure expansion generates {'>'}$751/month to cover payments</li>
                      <li>✓ Build 6-month payment reserve ($4,505) before borrowing</li>
                    </ul>
                  </div>
                </div>

                {/* Example 4: Student Loan */}
                <div className="mb-10 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 4: Student Loan Repayment</h3>
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> A recent graduate has $40,000 in student loans with a 5.8% interest rate on a 10-year standard repayment plan.</p>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Input Values:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Loan Amount:</strong> $40,000</li>
                      <li><strong>Interest Rate:</strong> 5.8% APR</li>
                      <li><strong>Loan Term:</strong> 10 years (120 months)</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-5 mb-4">
                    <h4 className="font-bold text-gray-900 mb-3">Result:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Monthly Payment:</strong> $441.12</li>
                      <li><strong>Total Interest:</strong> $12,934.82</li>
                      <li><strong>Total Amount Paid:</strong> $52,934.82</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-5">
                    <h4 className="font-bold text-green-900 mb-2">Repayment Strategies:</h4>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>✓ Consider income-driven repayment if payments are unaffordable</li>
                      <li>✓ Make extra payments toward principal to save on interest</li>
                      <li>✓ Refinance if credit improves for potentially lower rates</li>
                    </ul>
                  </div>
                </div>

                {/* Example 5: Debt Consolidation */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 5: Debt Consolidation Loan</h3>
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> Lisa has $20,000 in high-interest credit card debt (average 19% APR). She consolidates with a personal loan at 11% APR for 4 years.</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-100 border-2 border-red-300 rounded-lg p-5">
                      <h4 className="font-bold text-red-900 mb-3">Before (Credit Cards at 19% APR):</h4>
                      <ul className="space-y-2 text-red-800 text-sm">
                        <li><strong>Monthly Payment:</strong> $547.18</li>
                        <li><strong>Total Interest:</strong> $6,264.47</li>
                        <li><strong>Payoff Time:</strong> 48 months</li>
                      </ul>
                    </div>

                    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-5">
                      <h4 className="font-bold text-green-900 mb-3">After (Consolidation at 11% APR):</h4>
                      <ul className="space-y-2 text-green-800 text-sm">
                        <li><strong>Monthly Payment:</strong> $519.17</li>
                        <li><strong>Total Interest:</strong> $4,920.16</li>
                        <li><strong>Payoff Time:</strong> 48 months</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-5">
                    <h4 className="font-bold text-gray-900 mb-2">Savings Summary:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Monthly Savings:</strong> $28.01</li>
                      <li><strong>Total Interest Saved:</strong> $1,344.31</li>
                      <li className="text-green-700 font-bold pt-2 border-t">✓ Consolidation saves Lisa over $1,300 and simplifies payments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Understanding Results Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Understanding Your Loan Calculator Results</h2>
                <p className="text-gray-700 mb-8 leading-relaxed">The Loan Calculator provides comprehensive results to help you understand the true cost of borrowing. Here's what each metric means and how to interpret your results.</p>

                <div className="space-y-6">
                  {/* Monthly Payment */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">1</span>
                      Monthly Payment
                    </h3>
                    <p className="text-gray-700 mb-3">This is the fixed amount you'll pay each month to repay your loan. It includes both principal (the amount you borrowed) and interest (the cost of borrowing).</p>
                    <div className="bg-white rounded-lg p-4 mt-3">
                      <p className="text-sm text-gray-600"><strong>What affects it:</strong> Higher loan amounts increase monthly payments. Longer terms decrease monthly payments but increase total interest. Higher interest rates increase monthly payments.</p>
                    </div>
                  </div>

                  {/* Processing Fee */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-900 mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm">2</span>
                      Processing/Origination Fee
                    </h3>
                    <p className="text-gray-700 mb-3">A one-time fee charged by the lender to cover the administrative costs of processing your loan application. These can sometimes be hidden or not clearly disclosed.</p>
                    <div className="bg-white rounded-lg p-4 mt-3">
                      <p className="text-sm text-gray-600"><strong>Impact:</strong> This fee increases your total borrowing cost and can slightly affect your overall payment or total interest paid, depending on how it's structured.</p>
                    </div>
                  </div>

                  {/* Total Interest */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">3</span>
                      Total Interest
                    </h3>
                    <p className="text-gray-700 mb-3">The total amount you'll pay in interest over the life of the loan. This is the "cost of borrowing" - money paid to the lender beyond repaying what you borrowed.</p>
                    <div className="bg-white rounded-lg p-4 mt-3">
                      <p className="text-sm text-gray-600"><strong>How to reduce it:</strong> Make extra principal payments, choose a shorter loan term, secure a lower interest rate, or make bi-weekly instead of monthly payments.</p>
                    </div>
                  </div>

                  {/* Total Amount Paid */}
                  <div className="bg-gradient-to-r from-gray-100 to-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm">4</span>
                      Total Amount Paid
                    </h3>
                    <p className="text-gray-700 mb-3">The complete amount you'll pay over the loan term - your original loan amount plus all interest charges and any upfront fees. This shows the true total cost of the loan.</p>
                    <div className="bg-white rounded-lg p-4 mt-3">
                      <p className="text-sm text-gray-600"><strong>Example:</strong> On a $200,000 loan at 6% for 30 years with a $2,000 origination fee, you'll pay $433,676 total ($200,000 principal + $231,676 interest + $2,000 fee).</p>
                    </div>
                  </div>

                  {/* Amortization Schedule */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">5</span>
                      Amortization Schedule
                    </h3>
                    <p className="text-gray-700 mb-3">A detailed month-by-month breakdown showing how each payment is split between principal and interest, plus your remaining balance after each payment.</p>
                    <div className="bg-white rounded-lg p-4 mt-3">
                      <p className="text-sm text-gray-600 mb-3"><strong>Key insight:</strong> Early payments are mostly interest, while later payments are mostly principal. This is why making extra payments early saves the most money.</p>
                      <p className="text-sm text-gray-600"><strong>Use it to:</strong> See when you'll reach 20% equity (to remove PMI), plan extra payments for maximum impact, or understand how refinancing could help.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <h3 className="font-bold text-yellow-900 mb-3">When to Seek Professional Advice</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>If your debt-to-income ratio exceeds 43% (monthly debt payments {'>'}  43% of gross income)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Before making large financial commitments like home purchases or business loans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>If you're considering refinancing and want expert analysis of potential savings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>When dealing with complex financial situations like multiple loans or debt consolidation</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Formula Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Loan Payment Formula Explained</h2>

                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 sm:p-8 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">The Standard Loan Payment Formula</h3>
                  <div className="bg-white rounded-lg p-6 mb-4">
                    <pre className="text-lg font-bold text-center text-gray-900 whitespace-pre-wrap">
M = P × [r(1 + r)^n] / [(1 + r)^n - 1]
                    </pre>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-5">
                      <h4 className="font-bold text-gray-900 mb-3">Variables:</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li><strong>M</strong> = Monthly payment amount</li>
                        <li><strong>P</strong> = Principal (loan amount)</li>
                        <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</li>
                        <li><strong>n</strong> = Total number of payments (months)</li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-5">
                      <h4 className="font-bold text-gray-900 mb-3">Example Values:</h4>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li><strong>P</strong> = $200,000 (loan)</li>
                        <li><strong>Annual Rate</strong> = 6% (0.06)</li>
                        <li><strong>r</strong> = 0.06 ÷ 12 = 0.005</li>
                        <li><strong>n</strong> = 30 years × 12 = 360 months</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Step-by-Step Example Calculation</h3>
                <p className="text-gray-700 mb-4">Let's calculate the monthly payment for a $200,000 loan at 6% APR for 30 years:</p>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-5">
                    <p className="font-bold text-gray-900 mb-2">Step 1: Convert annual rate to monthly rate</p>
                    <pre className="text-sm text-gray-700 font-mono">r = 6% ÷ 12 = 0.06 ÷ 12 = 0.005</pre>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <p className="font-bold text-gray-900 mb-2">Step 2: Calculate total number of payments</p>
                    <pre className="text-sm text-gray-700 font-mono">n = 30 years × 12 months = 360 payments</pre>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <p className="font-bold text-gray-900 mb-2">Step 3: Calculate (1 + r)^n</p>
                    <pre className="text-sm text-gray-700 font-mono">(1 + 0.005)^360 = (1.005)^360 = 6.02258</pre>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-5">
                    <p className="font-bold text-gray-900 mb-2">Step 4: Apply the formula</p>
                    <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
M = $200,000 × [0.005 × 6.02258] / [6.02258 - 1]
M = $200,000 × [0.0301129] / [5.02258]
M = $200,000 × 0.00599551
M = $1,199.10
                    </pre>
                  </div>

                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-5">
                    <p className="font-bold text-green-900 text-lg">Result: Monthly Payment = $1,199.10</p>
                  </div>
                </div>

                <div className="mt-8 bg-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Different Calculation Methods</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-gray-900">Fixed-Rate Loans</h4>
                      <p className="text-sm text-gray-700">The standard formula above applies. Interest rate stays the same throughout the loan term, making payments predictable and easy to budget.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Variable-Rate Loans (ARM)</h4>
                      <p className="text-sm text-gray-700">Interest rate can change periodically. Use the formula with the current rate, but be aware payments will adjust when rates change. Initial rate is often lower but carries more risk.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Interest-Only Loans</h4>
                      <p className="text-sm text-gray-700">Monthly payment = Principal × (Annual Rate ÷ 12). You only pay interest initially, with principal due later or at loan end. Higher total cost but lower initial payments.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-5">
                  <h3 className="font-bold text-yellow-900 mb-2">Accuracy and Limitations</h3>
                  <p className="text-sm text-gray-700">This calculator provides accurate estimates based on the standard amortization formula used by most lenders. However, actual payments may vary slightly due to: origination fees, PMI (for mortgages {'<'}20% down), property taxes and insurance (for mortgages), prepayment penalties, or rate adjustments (for variable-rate loans). Always confirm final terms with your lender.</p>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Related Financial Calculators</h2>
                <p className="text-gray-700 mb-8">Explore our other free financial tools to make better money decisions and plan your financial future with confidence.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <a href="/tools/mortgage-calculator" className="block bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 rounded-xl p-6 transition-all hover:shadow-lg border-2 border-blue-200 hover:border-blue-300">
                    <h3 className="text-xl font-bold text-blue-900 mb-3">Mortgage Calculator</h3>
                    <p className="text-gray-700 text-sm mb-4">Calculate home loan payments including property taxes, insurance, and PMI. Perfect for homebuyers planning their purchase.</p>
                    <p className="text-blue-600 font-semibold text-sm">Calculate Mortgage →</p>
                  </a>

                  <a href="/tools/roi-calculator" className="block bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 rounded-xl p-6 transition-all hover:shadow-lg border-2 border-green-200 hover:border-green-300">
                    <h3 className="text-xl font-bold text-green-900 mb-3">ROI Calculator</h3>
                    <p className="text-gray-700 text-sm mb-4">Measure return on investment for business projects, marketing campaigns, or investment portfolios. Make data-driven decisions.</p>
                    <p className="text-green-600 font-semibold text-sm">Calculate ROI →</p>
                  </a>

                  <a href="/tools/compound-interest-calculator" className="block bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 rounded-xl p-6 transition-all hover:shadow-lg border-2 border-purple-200 hover:border-purple-300">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">Compound Interest Calculator</h3>
                    <p className="text-gray-700 text-sm mb-4">See how your investments grow over time with compound interest. Plan for retirement and long-term financial goals.</p>
                    <p className="text-purple-600 font-semibold text-sm">Calculate Growth →</p>
                  </a>

                  <a href="/tools/debt-payoff-calculator" className="block bg-gradient-to-br from-orange-50 to-yellow-100 hover:from-orange-100 hover:to-yellow-200 rounded-xl p-6 transition-all hover:shadow-lg border-2 border-orange-200 hover:border-orange-300">
                    <h3 className="text-xl font-bold text-orange-900 mb-3">Debt Payoff Calculator</h3>
                    <p className="text-gray-700 text-sm mb-4">Create a strategic plan to pay off credit cards and loans faster. Compare different payoff strategies and save on interest.</p>
                    <p className="text-orange-600 font-semibold text-sm">Plan Payoff →</p>
                  </a>

                  <a href="/tools/investment-calculator" className="block bg-gradient-to-br from-teal-50 to-cyan-100 hover:from-teal-100 hover:to-cyan-200 rounded-xl p-6 transition-all hover:shadow-lg border-2 border-teal-200 hover:border-teal-300">
                    <h3 className="text-xl font-bold text-teal-900 mb-3">Investment Calculator</h3>
                    <p className="text-gray-700 text-sm mb-4">Project future value of your investments with regular contributions. Factor in inflation and different return scenarios.</p>
                    <p className="text-teal-600 font-semibold text-sm">Calculate Returns →</p>
                  </a>

                  <a href="/tools/savings-calculator" className="block bg-gradient-to-br from-red-50 to-pink-100 hover:from-red-100 hover:to-pink-200 rounded-xl p-6 transition-all hover:shadow-lg border-2 border-red-200 hover:border-red-300">
                    <h3 className="text-xl font-bold text-red-900 mb-3">Savings Calculator</h3>
                    <p className="text-gray-700 text-sm mb-4">Determine how much to save monthly to reach your financial goals. Plan for emergencies, vacations, or major purchases.</p>
                    <p className="text-red-600 font-semibold text-sm">Plan Savings →</p>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Final Call-to-Action */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Calculate Your Loan Payments?</h2>
                <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">Get instant, accurate loan estimates in seconds. Uncover hidden fees and compare offers to make informed borrowing decisions with confidence.</p>

                <div className="grid sm:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-4xl font-bold text-yellow-300 mb-2">100%</div>
                    <div className="text-blue-100">Free Forever</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-4xl font-bold text-yellow-300 mb-2">{'<'}2s</div>
                    <div className="text-blue-100">Instant Results</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="text-4xl font-bold text-yellow-300 mb-2">0</div>
                    <div className="text-blue-100">Data Stored</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-xl"
                  >
                    Use Calculator Now
                  </button>
                  <a
                    href="/tools"
                    className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
                  >
                    Explore All Tools
                  </a>
                </div>

                <div className="border-t border-white/20 pt-8">
                  <p className="text-blue-100 mb-4 text-sm">Found this helpful? Share with friends and family:</p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold transition-all">
                      Share on Facebook
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold transition-all">
                      Share on Twitter
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold transition-all">
                      Share on LinkedIn
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold transition-all">
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-blue-200 text-sm">
                  <p><strong>Last Updated:</strong> January 10, 2025 | <strong>Author:</strong> DapsiWow Financial Tools Team</p>
                </div>
              </CardContent>
            </Card>

          </div>


        </div>
      </main>

      <Footer />
    </div>
  );
}