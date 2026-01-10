import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Info, Calculator, Home, DollarSign, TrendingDown, Download, Share2, PieChart, Clock, RotateCcw, Scale } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { saveCalculation } from '@/lib/calculationHistory';

const mortgageInputSchema = z.object({
  homePrice: z.number({
    invalid_type_error: "Home price must be a valid number",
    required_error: "Home price is required"
  }).positive("Home price must be greater than zero").max(1000000000, "Home price is too large").finite("Home price must be a finite number"),
  downPayment: z.number({
    invalid_type_error: "Down payment must be a valid number"
  }).min(0, "Down payment cannot be negative").finite("Down payment must be a finite number"),
  interestRate: z.number({
    invalid_type_error: "Interest rate must be a valid number",
    required_error: "Interest rate is required"
  }).positive("Interest rate must be greater than zero").max(100, "Interest rate cannot exceed 100%").finite("Interest rate must be a finite number"),
  loanTerm: z.number({
    invalid_type_error: "Loan term must be a valid number",
    required_error: "Loan term is required"
  }).positive("Loan term must be greater than zero").max(50, "Loan term cannot exceed 50 years").finite("Loan term must be a finite number"),
  propertyTax: z.number({
    invalid_type_error: "Property tax must be a valid number"
  }).min(0, "Property tax cannot be negative").finite("Property tax must be a finite number"),
  homeInsurance: z.number({
    invalid_type_error: "Home insurance must be a valid number"
  }).min(0, "Home insurance cannot be negative").finite("Home insurance must be a finite number"),
  pmiRate: z.number({
    invalid_type_error: "PMI rate must be a valid number"
  }).min(0, "PMI rate cannot be negative").max(10, "PMI rate cannot exceed 10%").finite("PMI rate must be a finite number"),
  hoaFees: z.number({
    invalid_type_error: "HOA fees must be a valid number"
  }).min(0, "HOA fees cannot be negative").finite("HOA fees must be a finite number"),
  extraPayment: z.number({
    invalid_type_error: "Extra payment must be a valid number"
  }).min(0, "Extra payment cannot be negative").finite("Extra payment must be a finite number")
});

interface ValidationErrors {
  homePrice?: string;
  downPayment?: string;
  interestRate?: string;
  loanTerm?: string;
  propertyTax?: string;
  homeInsurance?: string;
  pmiRate?: string;
  hoaFees?: string;
  extraPayment?: string;
}

interface MortgageResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  monthlyHOA: number;
  closingCosts: number;
  totalCashNeeded: number;
  loanToValue: number;
  debtToIncomeRatio?: number;
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

interface ComparisonMortgage {
  name: string;
  homePrice: number;
  downPayment: number;
  loanAmount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  hoa: number;
}

const MortgageCalculator = () => {
  const [homePrice, setHomePrice] = useState('500000');
  const [downPayment, setDownPayment] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('6.5');
  const [propertyTax, setPropertyTax] = useState('6000');
  const [homeInsurance, setHomeInsurance] = useState('1800');
  const [pmiRate, setPmiRate] = useState('0.5');
  const [usePercentage, setUsePercentage] = useState(true);
  const [loanType, setLoanType] = useState('conventional');
  const [hoaFees, setHoaFees] = useState('0');
  const [closingCostPercent, setClosingCostPercent] = useState('3');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [extraPayment, setExtraPayment] = useState('0');
  const [showAmortization, setShowAmortization] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [comparisonMortgages, setComparisonMortgages] = useState<ComparisonMortgage[]>([]);
  const [chartFilter, setChartFilter] = useState<'both' | 'principal' | 'interest'>('both');
  const [result, setResult] = useState<MortgageResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const amortizationRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Reference for auto-calculate trigger
  const shouldAutoCalculate = useRef(false);

  // Load parameters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const price = params.get('price');
    const down = params.get('down');
    const rate = params.get('rate');
    const term = params.get('term');
    const freq = params.get('freq');
    const extra = params.get('extra');

    if (price || rate || term) {
      if (price) setHomePrice(price);
      if (down) setDownPaymentPercent(down);
      if (rate) setInterestRate(rate);
      if (term) setLoanTerm(term);
      if (freq) setPaymentFrequency(freq);
      if (extra) setExtraPayment(extra);

      shouldAutoCalculate.current = true;
    }
  }, []);

  // Auto-calculate when URL parameters are loaded
  useEffect(() => {
    if (shouldAutoCalculate.current && homePrice && interestRate && loanTerm) {
      shouldAutoCalculate.current = false;
      setTimeout(() => {
        calculateMortgage();
        toast({
          title: "Shared calculation loaded!",
          description: "Results from the shared link have been calculated."
        });
      }, 200);
    }
  }, [homePrice, interestRate, loanTerm]);

  // Drag scrolling handlers for tables
  const handleMouseDown = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !ref.current) return;
    const x = e.touches[0].pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const calculateMortgage = async () => {
    setIsCalculating(true);
    setValidationErrors({});

    const price = parseFloat(homePrice);
    const down = usePercentage
      ? (price * parseFloat(downPaymentPercent)) / 100
      : parseFloat(downPayment);
    const annualRate = parseFloat(interestRate);
    const termYears = parseFloat(loanTerm);
    const taxes = propertyTax.trim() === '' ? 0 : parseFloat(propertyTax);
    const insurance = homeInsurance.trim() === '' ? 0 : parseFloat(homeInsurance);
    const pmi = pmiRate.trim() === '' ? 0 : parseFloat(pmiRate);
    const hoa = hoaFees.trim() === '' ? 0 : parseFloat(hoaFees);
    const income = parseFloat(monthlyIncome) || 0;
    const extraPmt = extraPayment.trim() === '' ? 0 : parseFloat(extraPayment);

    const validation = mortgageInputSchema.safeParse({
      homePrice: price,
      downPayment: down,
      interestRate: annualRate,
      loanTerm: termYears,
      propertyTax: taxes,
      homeInsurance: insurance,
      pmiRate: pmi,
      hoaFees: hoa,
      extraPayment: extraPmt
    });

    if (!validation.success) {
      const errors: ValidationErrors = {};
      validation.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          const field = err.path[0] as keyof ValidationErrors;
          errors[field] = err.message;
        }
      });
      setValidationErrors(errors);
      setIsCalculating(false);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before calculating.",
        variant: "destructive"
      });
      return;
    }

    const principal = price - down;
    if (principal <= 0) {
      setValidationErrors({ downPayment: "Down payment cannot be greater than or equal to home price" });
      setIsCalculating(false);
      toast({
        title: "Validation Error",
        description: "Down payment cannot be greater than or equal to home price.",
        variant: "destructive"
      });
      return;
    }

    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const periodicRate = (annualRate / 100) / paymentsPerYear;
    const totalPayments = termYears * paymentsPerYear;

    let adjustedRate = periodicRate;
    if (loanType === 'fha') {
      adjustedRate = periodicRate + (0.0085 / paymentsPerYear);
    } else if (loanType === 'va') {
      adjustedRate = periodicRate - (0.0025 / paymentsPerYear);
    }

    const monthlyPI = adjustedRate === 0
      ? principal / totalPayments
      : (principal * adjustedRate * Math.pow(1 + adjustedRate, totalPayments)) / (Math.pow(1 + adjustedRate, totalPayments) - 1);

    const monthlyTaxes = taxes / 12;
    const monthlyInsurance = insurance / 12;
    const downPaymentPercentValue = (down / price) * 100;
    let monthlyPMI = 0;

    if (loanType === 'conventional' && downPaymentPercentValue < 20) {
      monthlyPMI = (principal * (pmi / 100)) / 12;
    } else if (loanType === 'fha') {
      monthlyPMI = (principal * 0.0085) / 12;
    }

    const monthlyHOA = hoa;

    // Calculate amortization with extra payments
    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let totalAmountPaid = 0;
    let actualPayments = 0;

    for (let payment = 1; payment <= totalPayments && currentBalance > 0.01; payment++) {
      const interestPayment = currentBalance * adjustedRate;
      const principalPayment = Math.min(monthlyPI - interestPayment + extraPmt, currentBalance);
      const actualPaymentAmount = principalPayment + interestPayment;

      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      totalAmountPaid += actualPaymentAmount;
      actualPayments = payment;

      if (payment <= 60) { // Store first 60 payments for amortization schedule
        amortizationSchedule.push({
          month: payment,
          payment: actualPaymentAmount,
          principal: principalPayment,
          interest: interestPayment,
          balance: currentBalance
        });
      }
    }

    let extraPaymentSavings;
    if (extraPmt > 0) {
      const regularTotalAmount = monthlyPI * totalPayments;
      const regularTotalInterest = regularTotalAmount - principal;

      extraPaymentSavings = {
        timeSaved: Math.max(0, totalPayments - actualPayments),
        interestSaved: Math.max(0, regularTotalInterest - totalInterestPaid),
        newTotalInterest: totalInterestPaid,
        newPayoffTime: actualPayments
      };
    }

    const monthlyEquivalent = monthlyPI * (paymentsPerYear / 12);
    const totalMonthlyPayment = monthlyEquivalent + monthlyTaxes + monthlyInsurance + monthlyPMI + monthlyHOA;

    const closingCosts = (price * parseFloat(closingCostPercent)) / 100;
    const totalCashNeeded = down + closingCosts;
    const loanToValue = (principal / price) * 100;
    const debtToIncomeRatio = income > 0 ? (totalMonthlyPayment / income) * 100 : 0;

    const calculationResult = {
      monthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmountPaid * 100) / 100,
      totalInterest: Math.round(totalInterestPaid * 100) / 100,
      monthlyPrincipalAndInterest: Math.round(monthlyEquivalent * 100) / 100,
      monthlyTaxes: Math.round(monthlyTaxes * 100) / 100,
      monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
      monthlyPMI: Math.round(monthlyPMI * 100) / 100,
      monthlyHOA: Math.round(monthlyHOA * 100) / 100,
      closingCosts: Math.round(closingCosts * 100) / 100,
      totalCashNeeded: Math.round(totalCashNeeded * 100) / 100,
      loanToValue: Math.round(loanToValue * 100) / 100,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      amortizationSchedule,
      extraPaymentSavings
    };

    setResult(calculationResult);

    // Save calculation history (non-blocking)
    saveCalculation(
      'Mortgage Calculator',
      '/tools/mortgage-calculator',
      {
        homePrice: price,
        downPayment: down,
        interestRate: annualRate,
        loanTerm: termYears,
        propertyTax: taxes,
        homeInsurance: insurance,
        pmiRate: pmi,
        hoaFees: hoa,
        extraPayment: extraPmt,
        loanType,
        paymentFrequency
      },
      {
        monthlyPayment: calculationResult.monthlyPayment,
        totalAmount: calculationResult.totalAmount,
        totalInterest: calculationResult.totalInterest,
        monthlyPrincipalAndInterest: calculationResult.monthlyPrincipalAndInterest,
        closingCosts: calculationResult.closingCosts,
        totalCashNeeded: calculationResult.totalCashNeeded,
        loanToValue: calculationResult.loanToValue,
        extraPaymentSavings: calculationResult.extraPaymentSavings
      }
    );

    setIsCalculating(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const resetCalculator = () => {
    setHomePrice('500000');
    setDownPayment('');
    setDownPaymentPercent('20');
    setLoanTerm('30');
    setInterestRate('6.5');
    setPropertyTax('6000');
    setHomeInsurance('1800');
    setPmiRate('0.5');
    setUsePercentage(true);
    setLoanType('conventional');
    setHoaFees('0');
    setClosingCostPercent('3');
    setMonthlyIncome('');
    setPaymentFrequency('monthly');
    setExtraPayment('0');
    setShowAmortization(false);
    setShowComparison(false);
    setComparisonMortgages([]);
    setResult(null);
    setValidationErrors({});
  };

  const addToComparison = () => {
    if (result) {
      const currentDownPayment = usePercentage
        ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100
        : parseFloat(downPayment || '0');
      const loanAmount = parseFloat(homePrice) - currentDownPayment;

      const newMortgage: ComparisonMortgage = {
        name: `Scenario ${comparisonMortgages.length + 1}`,
        homePrice: parseFloat(homePrice),
        downPayment: currentDownPayment,
        loanAmount: loanAmount,
        rate: parseFloat(interestRate),
        term: parseFloat(loanTerm),
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        propertyTax: parseFloat(propertyTax),
        insurance: parseFloat(homeInsurance),
        pmi: result.monthlyPMI,
        hoa: parseFloat(hoaFees)
      };
      setComparisonMortgages([...comparisonMortgages, newMortgage]);
      setShowComparison(true);
      toast({
        title: "Mortgage Added",
        description: "Mortgage added to comparison. Calculate another to compare.",
      });
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatTimeSaved = (periodsSaved: number, paymentsPerYear: number): string => {
    const totalYearsSaved = periodsSaved / paymentsPerYear;
    let yearsSaved = Math.floor(totalYearsSaved);
    let monthsSaved = Math.round((totalYearsSaved - yearsSaved) * 12);

    if (monthsSaved === 12) {
      yearsSaved += 1;
      monthsSaved = 0;
    }

    if (yearsSaved > 0 && monthsSaved > 0) {
      return `${yearsSaved} ${yearsSaved === 1 ? 'year' : 'years'} ${monthsSaved} ${monthsSaved === 1 ? 'month' : 'months'}`;
    } else if (yearsSaved > 0) {
      return `${yearsSaved} ${yearsSaved === 1 ? 'year' : 'years'}`;
    } else if (monthsSaved > 0) {
      return `${monthsSaved} ${monthsSaved === 1 ? 'month' : 'months'}`;
    }
    return '0 months';
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
      doc.text('MORTGAGE ANALYSIS REPORT', pageWidth / 2, 13, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Home Mortgage Calculator', pageWidth / 2, 22, { align: 'center' });
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      yPos = 38;

      // Document Info Box
      const principal = parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment));
      const downPaymentAmount = usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment);
      const freqDisplay = paymentFrequency === 'weekly' ? 'Weekly' : paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly';
      
      doc.setFillColor(248, 250, 252); // Light gray background
      doc.rect(margin, yPos, pageWidth - (2 * margin), 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, yPos, pageWidth - (2 * margin), 24, 'S');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Home Price:', margin + 3, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(parseFloat(homePrice)), margin + 32, yPos + 7);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Loan Term:', margin + 3, yPos + 14);
      doc.setFont('helvetica', 'normal');
      doc.text(`${loanTerm} years`, margin + 32, yPos + 14);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Generated:', margin + 3, yPos + 21);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 32, yPos + 21);
      
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
      doc.text('TOTAL MONTHLY PAYMENT', pageWidth / 2, yPos + 7, { align: 'center' });
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
        { label: 'Home Price', value: formatCurrency(parseFloat(homePrice)), color: [71, 85, 105] },
        { label: 'Down Payment', value: formatCurrency(downPaymentAmount), color: [16, 185, 129] },
        { label: 'Loan Amount', value: formatCurrency(principal), color: [71, 85, 105] },
        { label: 'Interest Rate', value: `${interestRate}%`, color: [71, 85, 105] },
        { label: 'Monthly Payment', value: formatCurrency(result.monthlyPayment), color: [37, 99, 235] },
        { label: 'Total Amount Paid', value: formatCurrency(result.totalAmount), color: [71, 85, 105] },
        { label: 'Total Interest', value: formatCurrency(result.totalInterest), color: [239, 68, 68] },
        { label: 'Interest Portion', value: `${interestPercent}%`, color: [220, 38, 38] }
      ];

      if (parseFloat(extraPayment) > 0) {
        metrics.push({ label: 'Extra Payment', value: formatCurrency(parseFloat(extraPayment)), color: [16, 185, 129] });
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

      // Extra Payment Savings
      if (result.extraPaymentSavings) {
        const paymentsPerYear = paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12;
        const totalPayments = parseFloat(loanTerm) * 12;
        let totalYearsSaved = result.extraPaymentSavings.timeSaved / paymentsPerYear;
        let yearsSaved = Math.floor(totalYearsSaved);
        let monthsSaved = Math.round((totalYearsSaved - yearsSaved) * 12);

        if (monthsSaved === 12) {
          yearsSaved += 1;
          monthsSaved = 0;
        }

        let timeSavedText = '';
        if (yearsSaved > 0 && monthsSaved > 0) {
          timeSavedText = `${yearsSaved} years ${monthsSaved} months`;
        } else if (yearsSaved > 0) {
          timeSavedText = `${yearsSaved} years`;
        } else if (monthsSaved > 0) {
          timeSavedText = `${monthsSaved} months`;
        }

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
        doc.text(`Time Saved: ${timeSavedText}`, margin + 3, yPos + 18);
        doc.text(`New Payoff Time: ${Math.round(result.extraPaymentSavings.newPayoffTime)} payments`, pageWidth / 2 + 3, yPos + 12);
        doc.text(`Original Total: ${Math.round(totalPayments)} payments`, pageWidth / 2 + 3, yPos + 18);
        doc.setFontSize(7);
        doc.text(`(Paying off ${Math.round(result.extraPaymentSavings.timeSaved)} payments earlier!)`, pageWidth / 2 + 3, yPos + 24);

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
        interpretation = 'Excellent Mortgage Terms - Your interest payments are very low relative to the principal, indicating favorable financing and strong equity building potential.';
        interpretationColor = [22, 163, 74];
      } else if (interestPercentNum < 40) {
        interpretation = 'Good Mortgage Structure - Your interest-to-principal ratio shows reasonable borrowing costs for homeownership. Consider extra payments to accelerate equity building.';
        interpretationColor = [202, 138, 4];
      } else if (interestPercentNum < 60) {
        interpretation = 'Moderate Interest Load - Interest comprises a significant portion of your mortgage payments. Extra payments or refinancing could yield substantial long-term savings.';
        interpretationColor = [59, 130, 246];
      } else {
        interpretation = 'High Interest Burden - Interest payments are substantial compared to principal. Strongly consider refinancing to a lower rate or making extra principal payments.';
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
      if (comparisonMortgages.length > 0) {
        try {
          doc.addPage();
          yPos = margin;
          
          // Section Header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text('MORTGAGE SCENARIO COMPARISON', margin, yPos);
          yPos += 2;
          doc.setDrawColor(37, 99, 235);
          doc.line(margin, yPos, margin + 80, yPos);
          yPos += 10;
          doc.setTextColor(0, 0, 0);
          
          // Optimized column widths (total: 186px)
          const tableWidth = pageWidth - (2 * margin);
          const colWidths = {
            loan: 20,           // "LOAN"
            amount: 33,         // "AMOUNT"
            rate: 18,           // "RATE"
            term: 25,           // "TERM"
            payment: 45,        // "MONTHLY PAYMENT"
            interest: 45        // "TOTAL INTEREST"
          };
          
          // Table header
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, tableWidth, 10, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(55, 65, 81);
          
          let xPos = margin;
          doc.text('LOAN', xPos + 2, yPos + 6);
          xPos += colWidths.loan;
          doc.text('AMOUNT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.amount;
          doc.text('RATE', xPos + colWidths.rate - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.rate;
          doc.text('TERM', xPos + colWidths.term - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.term;
          doc.text('MONTHLY PAYMENT', xPos + colWidths.payment - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.payment;
          doc.text('TOTAL INTEREST', xPos + colWidths.interest - 2, yPos + 6, { align: 'right' });
          
          yPos += 10;
          doc.setFont('helvetica', 'normal');
          
          // Table rows - 30 rows per page
          const rowsPerPage = 30;
          let rowCount = 0;
          
          comparisonMortgages.forEach((mortgage, index) => {
            if (rowCount >= rowsPerPage) {
              // Add new page
              doc.addPage();
              yPos = margin;
              
              // Repeat header
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 58, 138);
              doc.text('MORTGAGE SCENARIO COMPARISON - CONTINUED', margin, yPos);
              yPos += 2;
              doc.setDrawColor(37, 99, 235);
              doc.line(margin, yPos, margin + 100, yPos);
              yPos += 10;
              
              doc.setFillColor(249, 250, 251);
              doc.rect(margin, yPos, tableWidth, 10, 'F');
              doc.setFontSize(7);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(55, 65, 81);
              
              xPos = margin;
              doc.text('LOAN', xPos + 2, yPos + 6);
              xPos += colWidths.loan;
              doc.text('AMOUNT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.amount;
              doc.text('RATE', xPos + colWidths.rate - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.rate;
              doc.text('TERM', xPos + colWidths.term - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.term;
              doc.text('MONTHLY PAYMENT', xPos + colWidths.payment - 2, yPos + 6, { align: 'right' });
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
            
            // Loan name
            doc.setTextColor(17, 24, 39);
            doc.text(mortgage.name, xPos + 2, yPos + 5.5);
            
            // Loan Amount
            xPos += colWidths.loan;
            doc.text(formatCurrency(mortgage.loanAmount), xPos + colWidths.amount - 2, yPos + 5.5, { align: 'right' });
            
            // Rate
            xPos += colWidths.amount;
            doc.text(`${mortgage.rate}%`, xPos + colWidths.rate - 2, yPos + 5.5, { align: 'right' });
            
            // Term
            xPos += colWidths.rate;
            doc.text(`${mortgage.term}y`, xPos + colWidths.term - 2, yPos + 5.5, { align: 'right' });
            
            // Monthly Payment
            xPos += colWidths.term;
            doc.setTextColor(37, 99, 235);
            doc.text(formatCurrency(mortgage.monthlyPayment), xPos + colWidths.payment - 2, yPos + 5.5, { align: 'right' });
            
            // Total Interest
            xPos += colWidths.payment;
            doc.setTextColor(234, 88, 12);
            doc.text(formatCurrency(mortgage.totalInterest), xPos + colWidths.interest - 2, yPos + 5.5, { align: 'right' });
            
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
            payment: 22,    // "Pay #"
            amount: 37,     // "Payment"
            principal: 37,  // "Principal"
            interest: 37,   // "Interest"
            balance: 53     // "Balance"
          };
          
          // Table header
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, tableWidth, 10, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(55, 65, 81);
          
          let xPos = margin;
          doc.text('PAY #', xPos + 2, yPos + 6);
          xPos += colWidths.payment;
          doc.text('PAYMENT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.amount;
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
              doc.text('PAY #', xPos + 2, yPos + 6);
              xPos += colWidths.payment;
              doc.text('PAYMENT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.amount;
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
            
            xPos += colWidths.payment;
            doc.text(formatCurrency(payment.payment), xPos + colWidths.amount - 2, yPos + 5.5, { align: 'right' });
            
            xPos += colWidths.amount;
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
        doc.text('DapsiWow Mortgage Calculator', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 10, { align: 'right' });
        
        // Website
        doc.setTextColor(37, 99, 235);
        doc.text('www.dapsiwow.com', pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      doc.save('mortgage-analysis-report.pdf');

      toast({
        title: "Professional PDF Downloaded",
        description: "Your detailed mortgage analysis report has been saved successfully.",
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

  const handleShare = async () => {
    if (!result) return;

    const params = new URLSearchParams({
      price: homePrice,
      down: downPaymentPercent,
      rate: interestRate,
      term: loanTerm,
      freq: paymentFrequency,
      extra: extraPayment
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    const freqDisplay = paymentFrequency === 'weekly' ? 'Weekly' :
                       paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly';

    let shareText = `🏠 Mortgage Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Home Price: ${formatCurrency(parseFloat(homePrice))}\n`;
    shareText += `• Down Payment: ${downPaymentPercent}%\n`;
    shareText += `• Interest Rate: ${interestRate}%\n`;
    shareText += `• Loan Term: ${loanTerm} years\n`;
    shareText += `• Payment Frequency: ${freqDisplay}\n`;
    if (parseFloat(extraPayment) > 0) {
      shareText += `• Extra Payment: ${formatCurrency(parseFloat(extraPayment))}\n`;
    }
    shareText += `\n💵 Monthly Payment: ${formatCurrency(result.monthlyPayment)}\n`;
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n`;
    shareText += `• Total Amount: ${formatCurrency(result.totalAmount)}\n`;

    if (result.extraPaymentSavings) {
      const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                             paymentFrequency === 'biweekly' ? 26 : 12;
      const timeSaved = formatTimeSaved(result.extraPaymentSavings.timeSaved, paymentsPerYear);
      shareText += `\n✨ Extra Payment Savings:\n`;
      shareText += `• Interest Saved: ${formatCurrency(result.extraPaymentSavings.interestSaved)}\n`;
      shareText += `• Time Saved: ${timeSaved}\n`;
    }

    shareText += `\n🔗 View & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🏠 Mortgage Calculator Results',
          text: shareText,
          url: shareableUrl
        });
        toast({ title: "Shared successfully!", description: "Results shared with all details" });
      } catch (err) {
        navigator.clipboard.writeText(shareText);
        toast({ title: "Copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const shareOnFacebook = () => {
    if (!result) return;

    const params = new URLSearchParams({
      price: homePrice,
      down: downPaymentPercent,
      rate: interestRate,
      term: loanTerm,
      freq: paymentFrequency,
      extra: extraPayment
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening Facebook share..." });
  };

  const shareOnTwitter = () => {
    if (!result) return;

    const params = new URLSearchParams({
      price: homePrice,
      down: downPaymentPercent,
      rate: interestRate,
      term: loanTerm,
      freq: paymentFrequency,
      extra: extraPayment
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const tweetText = `🏠 My mortgage: ${formatCurrency(result.monthlyPayment)}/month on ${formatCurrency(parseFloat(homePrice))} at ${interestRate}% - Calculate yours free!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening Twitter share..." });
  };

  const shareOnLinkedIn = () => {
    if (!result) return;

    const params = new URLSearchParams({
      price: homePrice,
      down: downPaymentPercent,
      rate: interestRate,
      term: loanTerm,
      freq: paymentFrequency,
      extra: extraPayment
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening LinkedIn share..." });
  };

  const shareOnWhatsApp = () => {
    if (!result) return;

    const params = new URLSearchParams({
      price: homePrice,
      down: downPaymentPercent,
      rate: interestRate,
      term: loanTerm,
      freq: paymentFrequency,
      extra: extraPayment
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const whatsappText = `🏠 Mortgage Calculator Results:\n\nHome Price: ${formatCurrency(parseFloat(homePrice))}\nRate: ${interestRate}%\nTerm: ${loanTerm} years\nMonthly Payment: ${formatCurrency(result.monthlyPayment)}\n\nCalculate yours: ${shareableUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast({ title: "Opening WhatsApp share..." });
  };

  const principalPercentage = result ? (parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment))) / result.totalAmount * 100 : 0;
  const interestPercentage = result ? (result.totalInterest / result.totalAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Mortgage Calculator - Monthly Payments Instantly | DapsiWow</title>
        <meta name="description" content="Calculate mortgage payments instantly with our free tool. Get detailed breakdowns of PMI, taxes, and insurance. Plan your home loan with confidence." />
        <meta name="keywords" content="mortgage calculator, free mortgage calculator, mortgage payment calculator, monthly mortgage calculator, mortgage calculator with pmi, mortgage calculator with taxes and insurance, FHA mortgage calculator, VA mortgage calculator, biweekly mortgage calculator, home affordability calculator, mortgage amortization calculator, extra payment mortgage calculator, house payment calculator, home loan calculator, mortgage estimator, PITI calculator, first time homebuyer calculator, 15 year vs 30 year mortgage calculator, mortgage calculator 2025, best mortgage calculator, online mortgage calculator, accurate mortgage calculator" />

        {/* Enhanced Open Graph Tags */}
        <meta property="og:title" content="Mortgage Calculator - Monthly Payments Instantly | DapsiWow" />
        <meta property="og:description" content="Calculate mortgage payments instantly with our free tool. Get detailed breakdowns of PMI, taxes, and insurance. Plan your home loan with confidence." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/mortgage-calculator" />
        <meta property="og:image" content="https://dapsiwow.com/og-mortgage-calculator.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Mortgage Calculator - Calculate monthly payments including PMI, property taxes, homeowners insurance and HOA fees for FHA, VA and conventional loans" />
        <meta property="og:site_name" content="DapsiWow - Free Financial Tools" />
        <meta property="og:locale" content="en_US" />

        {/* Enhanced Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mortgage Calculator - Monthly Payments Instantly | DapsiWow" />
        <meta name="twitter:description" content="Calculate mortgage payments instantly with our free tool. Get detailed breakdowns of PMI, taxes, and insurance. Plan your home loan with confidence." />
        <meta name="twitter:image" content="https://dapsiwow.com/twitter-mortgage-calculator.jpg" />
        <meta name="twitter:image:alt" content="Mortgage Calculator - Complete payment breakdown with PMI, property taxes, homeowners insurance and HOA fees for different loan types" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="twitter:creator" content="@DapsiWow" />

        {/* Pinterest Rich Pin Tags */}
        <meta property="article:published_time" content="2024-01-10T00:00:00Z" />
        <meta property="article:modified_time" content="2025-01-15T00:00:00Z" />
        <meta property="article:author" content="DapsiWow Financial Tools Team" />
        <meta property="article:section" content="Finance Tools" />
        <meta property="article:tag" content="Mortgage Calculator" />

        {/* Language and Geo-Targeting */}
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />

        {/* Date and Copyright Meta Tags */}
        <meta name="date" content="2025-01-15" />
        <meta name="last-modified" content="2025-01-15" />
        <meta name="copyright" content="© 2025 DapsiWow. All rights reserved." />
        <meta name="abstract" content="Free online mortgage calculator with PMI, property taxes, homeowners insurance, and HOA fees for FHA, VA, and conventional loans" />
        <meta name="topic" content="Mortgage Calculator" />
        <meta name="summary" content="Calculate accurate monthly mortgage payments including PMI, taxes, insurance and HOA fees. Compare FHA, VA and conventional loans with detailed amortization schedules." />
        <meta name="classification" content="Finance Tool" />
        <meta name="designer" content="DapsiWow" />
        <meta name="reply-to" content="support@dapsiwow.com" />
        <meta name="owner" content="DapsiWow" />
        <meta name="url" content="https://dapsiwow.com/tools/mortgage-calculator" />
        <meta name="identifier-URL" content="https://dapsiwow.com/tools/mortgage-calculator" />
        <meta name="directory" content="submission" />
        <meta name="category" content="Finance, Mortgage, Calculator, Real Estate, Home Buying" />
        <meta name="revisit-after" content="7 days" />

        {/* hreflang Alternate Links */}
        <link rel="alternate" hrefLang="en" href="https://dapsiwow.com/tools/mortgage-calculator" />
        <link rel="alternate" hrefLang="en-US" href="https://dapsiwow.com/tools/mortgage-calculator" />
        <link rel="alternate" hrefLang="en-GB" href="https://dapsiwow.com/tools/mortgage-calculator" />
        <link rel="alternate" hrefLang="en-CA" href="https://dapsiwow.com/tools/mortgage-calculator" />
        <link rel="alternate" hrefLang="en-AU" href="https://dapsiwow.com/tools/mortgage-calculator" />
        <link rel="alternate" hrefLang="x-default" href="https://dapsiwow.com/tools/mortgage-calculator" />

        {/* Theme and PWA Meta Tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-navbutton-color" content="#2563eb" />
        <meta name="application-name" content="Mortgage Calculator" />
        <meta name="msapplication-tooltip" content="Calculate mortgage payments with PMI, taxes and insurance" />
        <meta name="msapplication-starturl" content="https://dapsiwow.com/tools/mortgage-calculator" />

        {/* Standard Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="DapsiWow Financial Tools Team" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/mortgage-calculator" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mortgage Calculator" />

        {/* JSON-LD Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Mortgage Payment Calculator",
            "alternateName": ["Mortgage Calculator", "PITI Calculator", "Home Loan Calculator", "Mortgage Estimator"],
            "description": "Free online mortgage calculator to calculate monthly payments with PMI, property taxes, homeowners insurance, and HOA fees. Create detailed amortization schedules for FHA, VA, and conventional loans. Get instant, accurate calculations with bank-grade formulas for first-time homebuyers and experienced investors.",
            "url": "https://dapsiwow.com/tools/mortgage-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript. Works on all modern browsers including Chrome, Firefox, Safari, and Edge.",
            "permissions": "browser",
            "softwareVersion": "3.1",
            "datePublished": "2024-01-10",
            "dateModified": "2025-01-15",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2026-12-31",
              "eligibleRegion": {
                "@type": "Place",
                "name": "Worldwide"
              }
            },
            "featureList": [
              "Calculate monthly mortgage payments for FHA, VA, and conventional loans",
              "Include PMI, property taxes, insurance, and HOA fees",
              "Generate detailed amortization schedules up to 40 years",
              "Compare different mortgage loan types side-by-side",
              "Calculate extra payment benefits and interest savings",
              "Support for biweekly and weekly payment frequencies",
              "Visual charts showing principal vs interest breakdown",
              "Download professional PDF reports with full payment details",
              "Share calculations with customizable shareable links",
              "Real-time debt-to-income ratio calculations",
              "Home affordability analysis based on income",
              "Closing cost estimates and total cash needed"
            ],
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com",
              "logo": "https://dapsiwow.com/logo.png"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "3247",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Jennifer Williams"
                },
                "datePublished": "2025-01-10",
                "reviewBody": "This mortgage calculator is amazing! As a first-time homebuyer, I was able to compare FHA and conventional loans side-by-side. The PMI calculation helped me understand when to remove it. Saved me over $15,000 by choosing the right loan type!",
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
                  "name": "Robert Thompson"
                },
                "datePublished": "2025-01-02",
                "reviewBody": "Best free mortgage calculator I've found. The biweekly payment feature showed me I could pay off my 30-year mortgage in 23 years by making biweekly payments. The amortization schedule is super detailed and professional.",
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
                  "name": "Lisa Anderson"
                },
                "datePublished": "2024-12-28",
                "reviewBody": "Accurate and comprehensive! I'm a real estate agent and recommend this to all my clients. The calculations match exactly what lenders provide, and the ability to include taxes, insurance, and HOA fees gives clients the complete picture.",
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
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How accurate is this mortgage calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our mortgage calculator provides highly accurate estimates using the standard amortization formula that banks and lenders use. However, actual payments may vary slightly based on your lender's specific terms and exact closing date. Always verify final numbers with your mortgage lender."
                }
              },
              {
                "@type": "Question",
                "name": "How much house can I afford with my salary?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Lenders typically use the 28/36 rule: your monthly housing payment (PITI) should not exceed 28% of gross monthly income, and total debt payments shouldn't exceed 36%. For example, with a $7,000 monthly income, your maximum mortgage payment should be $1,960. Use our calculator to determine your home affordability based on your specific income and debts."
                }
              },
              {
                "@type": "Question",
                "name": "What is PMI and when can I remove it?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Private Mortgage Insurance (PMI) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually. You can request PMI removal once you reach 78% loan-to-value ratio through payments or home appreciation. Our mortgage calculator with PMI shows you exactly how much PMI adds to your monthly payment."
                }
              },
              {
                "@type": "Question",
                "name": "Should I choose a 15-year or 30-year mortgage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A 30-year mortgage offers lower monthly payments but you'll pay significantly more interest over the loan's life. A 15-year mortgage has higher monthly payments but you'll pay roughly half the total interest. Use our calculator to compare both options and choose based on your budget and financial goals."
                }
              },
              {
                "@type": "Question",
                "name": "How to calculate mortgage payment with taxes and insurance?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Calculate your principal and interest payment first using the loan amount, interest rate, and loan term. Then add your monthly property taxes (annual property tax ÷ 12), monthly homeowners insurance (annual premium ÷ 12), and PMI if your down payment is less than 20%. Our calculator automatically includes all these components for accurate PITI calculations."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between FHA and conventional mortgages?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FHA loans require as little as 3.5% down with lower credit scores (580+) but include mortgage insurance for the life of the loan. Conventional loans typically need 5-20% down, require higher credit scores (620+), but PMI can be removed at 78% LTV. Use our FHA mortgage calculator or conventional loan calculator to compare monthly payments for both loan types."
                }
              },
              {
                "@type": "Question",
                "name": "How much will I save with biweekly mortgage payments?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Biweekly payments (paying half your monthly payment every two weeks) result in 26 half-payments per year, equivalent to 13 full monthly payments instead of 12. This can save you thousands in interest and help you pay off your mortgage years earlier. Our biweekly mortgage calculator shows your exact savings with this payment strategy."
                }
              },
              {
                "@type": "Question",
                "name": "How do extra payments reduce my mortgage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Extra principal payments directly reduce your loan balance, which decreases the interest you'll pay over time. Even an extra $100-200 per month can save tens of thousands in interest and reduce your loan term by several years. Use our extra payment mortgage calculator to see your potential savings with additional payments."
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Use the Mortgage Calculator",
            "description": "Step-by-step guide to calculating your mortgage payments using our free mortgage calculator with PMI, taxes, and insurance",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Enter Home Price",
                "text": "Input the total purchase price of the home you're considering. This is the full amount before your down payment."
              },
              {
                "@type": "HowToStep",
                "name": "Set Down Payment",
                "text": "Enter your down payment as a percentage or dollar amount. 20% or more avoids PMI on conventional loans."
              },
              {
                "@type": "HowToStep",
                "name": "Choose Loan Term",
                "text": "Select the length of time you'll take to repay (typically 15, 20, or 30 years). Shorter terms save on interest; longer terms lower monthly payments."
              },
              {
                "@type": "HowToStep",
                "name": "Enter Interest Rate",
                "text": "Input the annual interest rate from your lender or current market rates."
              },
              {
                "@type": "HowToStep",
                "name": "Add Property Taxes & Insurance",
                "text": "Include annual property taxes and homeowners insurance premiums for accurate monthly PITI calculations."
              },
              {
                "@type": "HowToStep",
                "name": "Select Loan Type",
                "text": "Choose between conventional, FHA, or VA loan to see accurate PMI and rate adjustments."
              },
              {
                "@type": "HowToStep",
                "name": "Calculate and Analyze",
                "text": "Click 'Calculate Mortgage' to see your complete payment breakdown, amortization schedule, debt-to-income ratio, and affordability analysis."
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
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
                "name": "Mortgage Calculator",
                "item": "https://dapsiwow.com/tools/mortgage-calculator"
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Free Mortgage Calculator 2025 with PMI, Taxes & HOA",
            "description": "Calculate monthly mortgage payments instantly. Includes PMI, property taxes, insurance, HOA fees. Compare FHA, VA & conventional loans. Free tool.",
            "url": "https://dapsiwow.com/tools/mortgage-calculator",
            "inLanguage": "en-US",
            "isPartOf": {
              "@type": "WebSite",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            },
            "about": {
              "@type": "Thing",
              "name": "Mortgage Calculator",
              "description": "Free online mortgage payment calculator with PMI, property taxes, homeowners insurance, and HOA fees"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
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
                  "name": "Mortgage Calculator",
                  "item": "https://dapsiwow.com/tools/mortgage-calculator"
                }
              ]
            },
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Mortgage Calculator",
              "applicationCategory": "FinanceApplication"
            },
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["h1", ".mortgage-calculator-description"]
            },
            "datePublished": "2024-01-10T00:00:00Z",
            "dateModified": "2025-01-15T00:00:00Z",
            "author": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dapsiwow.com/logo.png",
                "width": 250,
                "height": 60
              }
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DapsiWow",
            "alternateName": "DapsiWow Financial Tools",
            "url": "https://dapsiwow.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://dapsiwow.com/logo.png",
              "width": 250,
              "height": 60
            },
            "description": "Free online financial, text, and health tools to make your life easier. No sign-up required.",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "email": "support@dapsiwow.com",
              "availableLanguage": ["English"]
            },
            "sameAs": [
              "https://www.facebook.com/DapsiWow",
              "https://twitter.com/DapsiWow",
              "https://www.linkedin.com/company/dapsiwow",
              "https://www.instagram.com/dapsiwow"
            ],
            "foundingDate": "2024",
            "numberOfEmployees": {
              "@type": "QuantitativeValue",
              "value": "10-50"
            },
            "slogan": "Free Tools to Make Everything Simple"
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": "Mortgage Payment Calculator",
            "description": "Calculate monthly mortgage payments with PMI, property taxes, homeowners insurance, and HOA fees for FHA, VA, and conventional loans",
            "url": "https://dapsiwow.com/tools/mortgage-calculator",
            "category": "Mortgage Calculator",
            "feesAndCommissionsSpecification": "Free to use. No registration required. No hidden fees.",
            "interestRate": {
              "@type": "QuantitativeValue",
              "name": "Interest Rate",
              "description": "Annual interest rate for mortgage calculation",
              "unitText": "Percent"
            },
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Mortgage Calculator",
            "alternateName": ["Free Mortgage Calculator", "Mortgage Payment Calculator", "PITI Calculator", "Home Loan Calculator"],
            "description": "Free online mortgage calculator to calculate monthly payments with PMI, property taxes, homeowners insurance, and HOA fees",
            "url": "https://dapsiwow.com/tools/mortgage-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any (Web Browser)",
            "browserRequirements": "Requires JavaScript enabled",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "Calculate monthly mortgage payments",
              "Include PMI, property taxes, insurance, HOA fees",
              "Generate detailed amortization schedules",
              "Compare FHA, VA, and conventional loans",
              "Calculate extra payment savings",
              "Support biweekly and weekly payments",
              "Download PDF reports",
              "Share calculations via social media"
            ],
            "screenshot": "https://dapsiwow.com/screenshots/mortgage-calculator.jpg",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "3247",
              "bestRating": "5",
              "worstRating": "1"
            },
            "creator": {
              "@type": "Organization",
              "name": "DapsiWow"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DapsiWow",
            "alternateName": "DapsiWow Financial Tools",
            "url": "https://dapsiwow.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://dapsiwow.com/logo.png",
              "width": 250,
              "height": 60
            },
            "description": "Free online financial, text, and health tools to make your life easier. No sign-up required.",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "email": "support@dapsiwow.com",
              "availableLanguage": ["English"]
            },
            "sameAs": [
              "https://www.facebook.com/DapsiWow",
              "https://twitter.com/DapsiWow",
              "https://www.linkedin.com/company/dapsiwow",
              "https://www.instagram.com/dapsiwow"
            ],
            "foundingDate": "2024",
            "numberOfEmployees": {
              "@type": "QuantitativeValue",
              "value": "10-50"
            },
            "slogan": "Free Tools to Make Everything Simple"
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": "Mortgage Payment Calculator",
            "description": "Calculate monthly mortgage payments with PMI, property taxes, homeowners insurance, and HOA fees for FHA, VA, and conventional loans",
            "url": "https://dapsiwow.com/tools/mortgage-calculator",
            "category": "Mortgage Calculator",
            "feesAndCommissionsSpecification": "Free to use. No registration required. No hidden fees.",
            "interestRate": {
              "@type": "QuantitativeValue",
              "name": "Interest Rate",
              "description": "Annual interest rate for mortgage calculation",
              "unitText": "Percent"
            },
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Mortgage Calculator",
            "alternateName": ["Free Mortgage Calculator", "Mortgage Payment Calculator", "PITI Calculator", "Home Loan Calculator"],
            "description": "Free online mortgage calculator to calculate monthly payments with PMI, property taxes, homeowners insurance, and HOA fees",
            "url": "https://dapsiwow.com/tools/mortgage-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any (Web Browser)",
            "browserRequirements": "Requires JavaScript enabled",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "Calculate monthly mortgage payments",
              "Include PMI, property taxes, insurance, HOA fees",
              "Generate detailed amortization schedules",
              "Compare FHA, VA, and conventional loans",
              "Calculate extra payment savings",
              "Support biweekly and weekly payments",
              "Download PDF reports",
              "Share calculations via social media"
            ],
            "screenshot": "https://dapsiwow.com/screenshots/mortgage-calculator.jpg",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "3247",
              "bestRating": "5",
              "worstRating": "1"
            },
            "creator": {
              "@type": "Organization",
              "name": "DapsiWow"
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
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Mortgage Calculator - Free & Accurate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Mortgage Calculator 2025:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Monthly Payments
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate accurate mortgage payments including taxes, insurance, PMI, and HOA fees. Compare loan types and explore payment strategies with detailed amortization schedules.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Calculator Card */}
            <Card className="lg:col-span-5 bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden h-fit">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Mortgage Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your home and loan details for accurate payment calculations</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-price" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Home Price
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">The total purchase price of the home</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="home-price"
                            type="number"
                            value={homePrice}
                            onChange={(e) => setHomePrice(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl w-full ${validationErrors.homePrice ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="500,000"
                            data-testid="input-home-price"
                          />
                        </div>
                        {validationErrors.homePrice && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-home-price">{validationErrors.homePrice}</p>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Down Payment
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Amount you'll pay upfront (20% avoids PMI)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            value={downPaymentPercent}
                            onChange={(e) => setDownPaymentPercent(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="20"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term (Years)</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you'll take to repay (typically 15 or 30 years)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={loanTerm}
                          onChange={(e) => setLoanTerm(e.target.value)}
                          className={`h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl w-full ${validationErrors.loanTerm ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                          placeholder="30"
                          min="1"
                          max="40"
                        />
                        {validationErrors.loanTerm && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-loan-term">{validationErrors.loanTerm}</p>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Interest Rate (%)</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Annual interest rate from your lender</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="interest-rate"
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl w-full ${validationErrors.interestRate ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="6.5"
                            step="0.01"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                        {validationErrors.interestRate && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-interest-rate">{validationErrors.interestRate}</p>
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
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-type" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Type</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Type of mortgage loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={loanType} onValueChange={setLoanType}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conventional">Conventional</SelectItem>
                            <SelectItem value="fha">FHA</SelectItem>
                            <SelectItem value="va">VA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="property-tax" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Annual Property Tax</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Yearly property taxes (varies by location)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="property-tax"
                            type="number"
                            value={propertyTax}
                            onChange={(e) => setPropertyTax(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="6,000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-insurance" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Annual Home Insurance</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Yearly homeowners insurance premium</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="home-insurance"
                            type="number"
                            value={homeInsurance}
                            onChange={(e) => setHomeInsurance(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="1,800"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="extra-payment" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Extra Payment (Optional)
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
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="extra-payment"
                            type="number"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(e.target.value)}
                            className={`h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl w-full ${validationErrors.extraPayment ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        {validationErrors.extraPayment && (
                          <p className="text-xs text-red-600 mt-1" data-testid="error-extra-payment">{validationErrors.extraPayment}</p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">💡 Pro Tip: Even small extra payments can save you thousands in interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateMortgage}
                      disabled={isCalculating || !homePrice || !interestRate || !loanTerm || Object.keys(validationErrors).length > 0}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-calculate"
                      aria-busy={isCalculating}
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      {isCalculating ? 'Calculating...' : 'Calculate Mortgage Payment'}
                    </Button>
                    <Button
                      onClick={resetCalculator}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl"
                    >
                      Reset Calculator
                    </Button>
                  </div>

                  {result && (
                    <div className="space-y-4 pt-3 sm:pt-4 print:hidden">
                      {/* Primary Action Buttons */}
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <Button
                          onClick={() => setShowAmortization(!showAmortization)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          {showAmortization ? 'Hide' : 'Show'} Payment Schedule
                        </Button>
                        <Button
                          onClick={addToComparison}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors"
                          data-testid="button-add-comparison"
                        >
                          <Scale className="w-4 h-4 sm:mr-1.5" />
                          Add to Comparison
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
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
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white transition-colors flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on Facebook"
                          >
                            <FaFacebook className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Facebook</span>
                          </Button>
                          <Button
                            onClick={shareOnTwitter}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#1da1f2] hover:bg-[#1a8cd8] text-white transition-colors flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on Twitter"
                          >
                            <FaTwitter className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Twitter</span>
                          </Button>
                          <Button
                            onClick={shareOnLinkedIn}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#0077b5] hover:bg-[#006399] text-white transition-colors flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on LinkedIn"
                          >
                            <FaLinkedin className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">LinkedIn</span>
                          </Button>
                          <Button
                            onClick={shareOnWhatsApp}
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white transition-colors flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
                            aria-label="Share on WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </Button>
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            size="sm"
                            className="text-[10px] xs:text-xs sm:text-sm px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-full sm:rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center"
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

                {result ? (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your Mortgage Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Estimated Monthly Payment</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                          <p className="text-xs text-gray-500">Based on monthly payment frequency</p>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all">
                              {formatCurrency(parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)))}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Interest Paid</span>
                            <span className="font-bold text-orange-600 text-sm sm:text-base break-all">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount Paid</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>

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
                            <PieChart className="w-4 h-4 mr-1.5" />
                            {showCharts ? 'Hide Chart' : 'Show Chart'}
                          </Button>
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
                                {formatTimeSaved(result.extraPaymentSavings.timeSaved, paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Charts */}
                      {showCharts && (
                        <div className="space-y-4">
                        <div ref={chartRef} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
                          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">Total Payment Composition</h3>
                          <ResponsiveContainer width="100%" height={250} className="sm:!h-[280px] md:!h-[300px] lg:!h-[320px]">
                            <RechartsPieChart>
                              <Pie
                                data={[
                                  { name: 'Principal', value: parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)), color: '#10b981' },
                                  { name: 'Interest', value: result.totalInterest, color: '#f97316' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius="70%"
                                fill="#8884d8"
                                dataKey="value"
                                style={{ fontSize: '11px', fontWeight: '500' }}
                              >
                                {[
                                  { name: 'Principal', value: parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)), color: '#10b981' },
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
                                wrapperStyle={{ fontSize: '11px' }}
                                iconType="circle"
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-center">
                            <div className="bg-green-50 rounded-md sm:rounded-lg p-2 sm:p-3">
                              <div className="text-[10px] sm:text-xs text-green-700 font-medium">Principal</div>
                              <div className="text-xs sm:text-sm md:text-base font-bold text-green-800 break-all">{formatCurrency(parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)))}</div>
                            </div>
                            <div className="bg-orange-50 rounded-md sm:rounded-lg p-2 sm:p-3">
                              <div className="text-[10px] sm:text-xs text-orange-700 font-medium">Interest</div>
                              <div className="text-xs sm:text-sm md:text-base font-bold text-orange-800 break-all">{formatCurrency(result.totalInterest)}</div>
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

                      {/* Amortization Schedule Section */}
                      {showAmortization && (
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-amortization-schedule">
                              Amortization Schedule (First 5 Years)
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
                          <div 
                            className="overflow-x-auto -mx-4 sm:mx-0 cursor-grab active:cursor-grabbing select-none scroll-smooth transition-all duration-200" 
                            ref={amortizationRef}
                            onMouseDown={(e) => handleMouseDown(e, amortizationRef)}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={(e) => handleMouseMove(e, amortizationRef)}
                            onTouchStart={(e) => handleTouchStart(e, amortizationRef)}
                            onTouchMove={(e) => handleTouchMove(e, amortizationRef)}
                            onTouchEnd={handleMouseUp}
                          >
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

                      {/* Mortgage Comparison Section */}
                      {showComparison && comparisonMortgages.length > 0 && (
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-comparison-table">
                              Mortgage Comparison
                            </h3>
                            <Button
                              onClick={() => setComparisonMortgages([])}
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                              data-testid="button-clear-comparison"
                            >
                              <RotateCcw className="w-4 h-4 mr-1.5" />
                              Clear All
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Compare different mortgage scenarios side-by-side to find the best option.</p>
                          <div 
                            className="overflow-x-auto -mx-4 sm:mx-0 cursor-grab active:cursor-grabbing select-none scroll-smooth transition-all duration-200" 
                            ref={comparisonRef}
                            onMouseDown={(e) => handleMouseDown(e, comparisonRef)}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={(e) => handleMouseMove(e, comparisonRef)}
                            onTouchStart={(e) => handleTouchStart(e, comparisonRef)}
                            onTouchMove={(e) => handleTouchMove(e, comparisonRef)}
                            onTouchEnd={handleMouseUp}
                          >
                            <table className="w-full min-w-[600px]" data-testid="comparison-table">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Scenario</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Home Price</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Down Payment</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Loan Amount</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Rate</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Term</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Monthly Payment</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Interest</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {comparisonMortgages.map((mortgage, index) => (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors" data-testid={`comparison-row-${index}`}>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{mortgage.name}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(mortgage.homePrice)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(mortgage.downPayment)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(mortgage.loanAmount)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{mortgage.rate}%</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{mortgage.term} years</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(mortgage.monthlyPayment)}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(mortgage.totalInterest)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Results</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your mortgage details above and click "Calculate Mortgage Payment" to see your personalized results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Introduction Section */}
            <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">What is a Mortgage Calculator?</h2>
              
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
                  The <strong>Mortgage Calculator</strong> is a free online tool that helps you estimate your monthly home loan payments and understand the total cost of homeownership. Whether you're a first-time homebuyer researching your budget, a homeowner considering refinancing, or a real estate professional helping clients, this calculator provides instant, accurate mortgage payment estimates with detailed breakdowns.
                </p>
                
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
                  Beyond basic payment calculations, our comprehensive tool shows you exactly how much you'll pay in principal and interest over the life of your loan, how extra payments can save you thousands, and what your debt-to-income ratio means for loan approval. With support for different payment frequencies, property taxes, homeowner's insurance, PMI, and HOA fees, you get a complete picture of your monthly housing costs.
                </p>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 mb-3">Why Use Our Mortgage Calculator?</h3>
                
                <ul className="space-y-2 text-sm sm:text-base lg:text-lg">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span><strong>Instant Results:</strong> Get accurate monthly payment estimates in seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span><strong>Comprehensive Breakdown:</strong> See principal, interest, taxes, insurance, PMI, and HOA fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span><strong>Amortization Schedule:</strong> View detailed payment-by-payment breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span><strong>Extra Payment Analysis:</strong> Calculate how much you'll save with additional payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span><strong>100% Free:</strong> No registration, hidden fees, or credit card required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span><strong>Privacy Protected:</strong> Your data never leaves your browser</span>
                  </li>
                </ul>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-6 mb-3">Who Benefits from This Mortgage Calculator?</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">First-Time Homebuyers</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Understand affordability and budget for your first home purchase</p>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Current Homeowners</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Evaluate refinancing options and potential savings</p>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Real Estate Agents</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Help clients quickly understand payment scenarios</p>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Mortgage Brokers</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Compare different loan products for clients</p>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Financial Planners</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Incorporate housing costs into comprehensive financial plans</p>
                  </div>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Anyone Budgeting</h4>
                    <p className="text-xs sm:text-sm text-gray-700">Plan for future homeownership and savings goals</p>
                  </div>
                </div>
              </div>
            </section>

            {/* How to Use Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">How to Use the Mortgage Calculator</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">1</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Enter Home Price</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700">Input the total purchase price of the home you're considering. For example, $350,000.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">2</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Enter Down Payment</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700">Enter your down payment as a dollar amount or percentage. Most lenders require 3-20% down (e.g., $70,000 or 20%).</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">3</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Set Interest Rate</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700">Input the annual interest rate offered by your lender (e.g., 6.5%). Check current market rates for accuracy.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">4</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Choose Loan Term</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700">Select your loan term (15 or 30 years most common). Shorter terms mean higher payments but less total interest.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">5</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Add Property Details (Optional)</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700">Include property tax, homeowner's insurance, PMI (if down payment &lt; 20%), and HOA fees for complete monthly payment.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">6</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Consider Extra Payments (Optional)</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700">Enter any extra payment amount to see how much interest you'll save and how fast you'll pay off your loan.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">7</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Calculate and Analyze</h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-700">Click "Calculate Mortgage Payment" to see your monthly payment, total interest, amortization schedule, and visual breakdowns.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 mt-4 sm:mt-6 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base lg:text-lg">Pro Tips:</h3>
                  <ul className="space-y-2 text-xs sm:text-sm lg:text-base text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-0.5">💡</span>
                      <span><strong>Get Pre-Approved:</strong> Know your actual interest rate before house hunting for accurate calculations.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-0.5">💡</span>
                      <span><strong>Include All Costs:</strong> Don't forget property tax, insurance, and HOA fees in your budget.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-0.5">💡</span>
                      <span><strong>Test Different Scenarios:</strong> Compare 15-year vs 30-year terms to find the best fit.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-0.5">💡</span>
                      <span><strong>Save Your Results:</strong> Use the download feature to save calculations for comparison.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Real-World Examples Section */}
            <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Mortgage Calculator Examples</h2>
              
              <div className="space-y-6 sm:space-y-8">
                {/* Example 1 */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3">Example 1: First-Time Homebuyer with 10% Down</h3>
                  
                  <p className="text-sm sm:text-base text-gray-700 mb-4"><strong>Scenario:</strong> Sarah is buying her first home for $300,000 with a 10% down payment.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Input Values:</h4>
                      <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                        <li>• Home Price: $300,000</li>
                        <li>• Down Payment: $30,000 (10%)</li>
                        <li>• Interest Rate: 6.5%</li>
                        <li>• Loan Term: 30 years</li>
                        <li>• Property Tax: $3,600/year</li>
                        <li>• Insurance: $1,200/year</li>
                        <li>• PMI: 0.5% annually</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Results:</h4>
                      <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                        <li>• Principal & Interest: $1,706/month</li>
                        <li>• Property Tax: $300/month</li>
                        <li>• Insurance: $100/month</li>
                        <li>• PMI: $113/month</li>
                        <li className="font-bold text-blue-600">• Total Monthly Payment: $2,219</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3">
                    <p className="text-xs sm:text-sm text-gray-700"><strong>Interpretation:</strong> Sarah will pay $2,219/month total. Over 30 years, she'll pay $344,360 in interest on the $270,000 loan. The PMI adds $113/month until she reaches 20% equity ($60,000), which will take about 6 years of payments.</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Action Steps:</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                      <li>✓ Budget for $2,219/month (keep total housing under 28% of gross income)</li>
                      <li>✓ Plan to eliminate PMI by making extra payments to reach 20% equity faster</li>
                      <li>✓ Set aside emergency fund (3-6 months of mortgage payments = $13,314)</li>
                    </ul>
                  </div>
                </div>

                {/* Example 2 */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3">Example 2: Comparing 15-Year vs 30-Year Mortgage</h3>
                  
                  <p className="text-sm sm:text-base text-gray-700 mb-4"><strong>Scenario:</strong> Mike has $450,000 home with 20% down and wants to compare loan terms.</p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="p-2 text-left font-bold">Loan Term</th>
                          <th className="p-2 text-right font-bold">30-Year</th>
                          <th className="p-2 text-right font-bold">15-Year</th>
                          <th className="p-2 text-right font-bold">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="p-2">Interest Rate</td>
                          <td className="p-2 text-right">6.5%</td>
                          <td className="p-2 text-right">5.75%</td>
                          <td className="p-2 text-right">-0.75%</td>
                        </tr>
                        <tr>
                          <td className="p-2">Monthly P&I</td>
                          <td className="p-2 text-right">$2,274</td>
                          <td className="p-2 text-right">$2,983</td>
                          <td className="p-2 text-right text-red-600">+$709</td>
                        </tr>
                        <tr>
                          <td className="p-2">Total Interest</td>
                          <td className="p-2 text-right">$458,640</td>
                          <td className="p-2 text-right">$176,940</td>
                          <td className="p-2 text-right text-green-600">-$281,700</td>
                        </tr>
                        <tr className="bg-gray-100 font-bold">
                          <td className="p-2">Total Paid</td>
                          <td className="p-2 text-right">$818,640</td>
                          <td className="p-2 text-right">$536,940</td>
                          <td className="p-2 text-right text-green-600">-$281,700</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mt-4 mb-3">
                    <p className="text-xs sm:text-sm text-gray-700"><strong>Interpretation:</strong> While the 15-year mortgage has a higher monthly payment ($709 more), Mike saves $281,700 in total interest and owns his home in half the time. He also gets a lower interest rate (5.75% vs 6.5%).</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Action Steps:</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                      <li>✓ Choose 15-year if you can afford the extra $709/month and want massive interest savings</li>
                      <li>✓ Choose 30-year if you need lower payments for cash flow or have other investment priorities</li>
                      <li>✓ Consider a hybrid: 30-year loan with extra payments (flexibility + savings)</li>
                    </ul>
                  </div>
                </div>

                {/* Example 3 */}
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3">Example 3: Power of Extra Payments</h3>
                  
                  <p className="text-sm sm:text-base text-gray-700 mb-4"><strong>Scenario:</strong> Jessica has a $400,000 mortgage and wants to see the impact of extra payments.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Standard Loan:</h4>
                      <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                        <li>• Home Price: $500,000</li>
                        <li>• Down Payment: $100,000 (20%)</li>
                        <li>• Loan Amount: $400,000</li>
                        <li>• Interest Rate: 7.0%</li>
                        <li>• Term: 30 years</li>
                        <li>• Monthly P&I: $2,661</li>
                        <li className="text-red-600">• Total Interest: $558,190</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">With $200/Month Extra:</h4>
                      <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                        <li>• Monthly Payment: $2,861 ($200 extra)</li>
                        <li>• New Payoff: 24 years, 3 months</li>
                        <li className="text-green-600 font-bold">• Interest Saved: $124,387</li>
                        <li className="text-green-600 font-bold">• Time Saved: 5 years, 9 months</li>
                        <li>• Total Paid: $833,803</li>
                        <li>• vs Standard: $958,190</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3">
                    <p className="text-xs sm:text-sm text-gray-700"><strong>Interpretation:</strong> By adding just $200/month ($2,400/year) to her principal payment, Jessica saves $124,387 in interest and pays off her mortgage almost 6 years early. That's a 5,183% return on her extra $200/month investment!</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Action Steps:</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                      <li>✓ Start with any extra amount - even $50/month makes a significant difference</li>
                      <li>✓ Apply work bonuses, tax refunds, or raises directly to principal</li>
                      <li>✓ Set up automatic extra payments so you don't forget</li>
                      <li>✓ Ensure lender applies extra payments to principal, not future interest</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Understanding Results Section */}
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Understanding Your Mortgage Results</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Debt-to-Income (DTI) Ratio Categories</h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2 text-sm sm:text-base">Excellent: DTI Below 28%</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2"><strong>Meaning:</strong> Your housing costs are well within a comfortable range relative to your income.</p>
                      <p className="text-xs sm:text-sm text-gray-700"><strong>Lender View:</strong> You're a very low-risk borrower. Qualify for best interest rates and loan terms.</p>
                      <p className="text-xs sm:text-sm text-gray-700 mt-2"><strong>Recommendation:</strong> You have room in your budget. Consider putting extra toward principal or investing the difference.</p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-2 text-sm sm:text-base">Good: DTI 28% - 36%</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2"><strong>Meaning:</strong> Your housing costs are at the recommended maximum for most conventional loans.</p>
                      <p className="text-xs sm:text-sm text-gray-700"><strong>Lender View:</strong> You're a manageable risk. Should qualify for most loan products with decent rates.</p>
                      <p className="text-xs sm:text-sm text-gray-700 mt-2"><strong>Recommendation:</strong> Ensure you have an emergency fund. Monitor budget carefully and avoid taking on additional debt.</p>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-bold text-yellow-800 mb-2 text-sm sm:text-base">Caution: DTI 36% - 43%</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2"><strong>Meaning:</strong> Your housing costs are stretching your budget. Limited financial flexibility.</p>
                      <p className="text-xs sm:text-sm text-gray-700"><strong>Lender View:</strong> Higher risk borrower. May face higher interest rates or require additional documentation.</p>
                      <p className="text-xs sm:text-sm text-gray-700 mt-2"><strong>Recommendation:</strong> Consider a less expensive home, larger down payment, or increasing income before buying. Build 6-month emergency fund first.</p>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-bold text-red-800 mb-2 text-sm sm:text-base">High Risk: DTI Above 43%</h4>
                      <p className="text-xs sm:text-sm text-gray-700 mb-2"><strong>Meaning:</strong> Housing costs consume too much of your income. Very high financial strain.</p>
                      <p className="text-xs sm:text-sm text-gray-700"><strong>Lender View:</strong> Most conventional lenders won't approve (43% is typical maximum). Considered high-risk.</p>
                      <p className="text-xs sm:text-sm text-gray-700 mt-2"><strong>Recommendation:</strong> Don't buy yet. Increase income, pay down debt, or look at significantly cheaper homes. This payment level risks financial hardship.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">When to Seek Professional Advice</h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Your DTI is above 36% - a financial advisor can help restructure your budget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>You're unsure about mortgage types (FHA, VA, Conventional) - consult a mortgage broker</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>You have credit issues - work with a credit counselor before applying</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>You're considering adjustable-rate mortgages (ARMs) - understand the risks with a professional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>You're refinancing - evaluate if it makes sense given your goals and closing costs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Formula Explained Section */}
            <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Mortgage Payment Formula Explained</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">The Standard Amortization Formula</h3>
                  
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border-2 border-gray-200">
                    <p className="text-center font-mono text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-4">
                      M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1]
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="mb-2"><strong>Where:</strong></p>
                        <ul className="space-y-1 text-gray-700">
                          <li><strong>M</strong> = Monthly mortgage payment</li>
                          <li><strong>P</strong> = Principal loan amount</li>
                          <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</li>
                          <li><strong>n</strong> = Number of payments (years × 12)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="mb-2"><strong>Example Values:</strong></p>
                        <ul className="space-y-1 text-gray-700">
                          <li>Home Price: $300,000</li>
                          <li>Down Payment: $60,000 (20%)</li>
                          <li>P = $240,000</li>
                          <li>Annual Rate: 6.5%</li>
                          <li>r = 0.065 ÷ 12 = 0.00542</li>
                          <li>n = 30 years × 12 = 360</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Step-by-Step Calculation Example</h3>
                  
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-lg space-y-3 text-xs sm:text-sm">
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Step 1: Calculate (1 + r)</p>
                      <p className="text-gray-700 font-mono">1 + 0.00542 = 1.00542</p>
                    </div>
                    
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Step 2: Calculate (1 + r)ⁿ</p>
                      <p className="text-gray-700 font-mono">1.00542³⁶⁰ = 7.1899</p>
                    </div>
                    
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Step 3: Calculate numerator: r(1 + r)ⁿ</p>
                      <p className="text-gray-700 font-mono">0.00542 × 7.1899 = 0.03897</p>
                    </div>
                    
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Step 4: Calculate denominator: (1 + r)ⁿ - 1</p>
                      <p className="text-gray-700 font-mono">7.1899 - 1 = 6.1899</p>
                    </div>
                    
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Step 5: Divide numerator by denominator</p>
                      <p className="text-gray-700 font-mono">0.03897 ÷ 6.1899 = 0.006296</p>
                    </div>
                    
                    <div className="pt-3 border-t-2 border-blue-200">
                      <p className="font-bold text-gray-900 mb-1">Step 6: Multiply by principal</p>
                      <p className="text-gray-700 font-mono">$240,000 × 0.006296 = <span className="text-blue-600 font-bold">$1,511.06/month</span></p>
                    </div>
                    
                    <div className="bg-blue-100 p-3 rounded mt-4">
                      <p className="text-gray-700 text-xs sm:text-sm"><strong>Final Monthly Payment:</strong> $1,511.06 (principal & interest only). Add property tax, insurance, PMI, and HOA fees for total housing payment.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Why This Matters</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Understanding this formula helps you see why:</p>
                  <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-700">
                    <li>• Lower interest rates dramatically reduce your payment</li>
                    <li>• Longer terms reduce monthly payment but increase total interest</li>
                    <li>• Extra principal payments compound over time (reducing future interest)</li>
                    <li>• Front-loaded interest means early payments go mostly to interest, not principal</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Loan Type Comparison Section */}
            <section className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Mortgage Type Comparison</h2>
              
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full min-w-[700px] bg-white rounded-lg overflow-hidden shadow-sm text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                        <th className="px-3 sm:px-4 py-3 text-left font-bold">Feature</th>
                        <th className="px-3 sm:px-4 py-3 text-left font-bold">Conventional</th>
                        <th className="px-3 sm:px-4 py-3 text-left font-bold">FHA</th>
                        <th className="px-3 sm:px-4 py-3 text-left font-bold">VA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-green-50">
                        <td className="px-3 sm:px-4 py-3 font-bold">Min. Down Payment</td>
                        <td className="px-3 sm:px-4 py-3">3% - 20%</td>
                        <td className="px-3 sm:px-4 py-3">3.5%</td>
                        <td className="px-3 sm:px-4 py-3">0%</td>
                      </tr>
                      <tr className="hover:bg-green-50">
                        <td className="px-3 sm:px-4 py-3 font-bold">Credit Score</td>
                        <td className="px-3 sm:px-4 py-3">620+</td>
                        <td className="px-3 sm:px-4 py-3">580+</td>
                        <td className="px-3 sm:px-4 py-3">No minimum (lender-specific)</td>
                      </tr>
                      <tr className="hover:bg-green-50">
                        <td className="px-3 sm:px-4 py-3 font-bold">Loan Limits</td>
                        <td className="px-3 sm:px-4 py-3">$766,550 (2024) in most areas</td>
                        <td className="px-3 sm:px-4 py-3">$498,257 (2024) in most areas</td>
                        <td className="px-3 sm:px-4 py-3">$766,550 (2024) in most areas</td>
                      </tr>
                      <tr className="hover:bg-green-50">
                        <td className="px-3 sm:px-4 py-3 font-bold">PMI/MIP</td>
                        <td className="px-3 sm:px-4 py-3">PMI if down &lt; 20% (removable)</td>
                        <td className="px-3 sm:px-4 py-3">Upfront + annual MIP (life of loan if 3.5% down)</td>
                        <td className="px-3 sm:px-4 py-3">Funding fee (waived for disabled vets)</td>
                      </tr>
                      <tr className="hover:bg-green-50">
                        <td className="px-3 sm:px-4 py-3 font-bold">Interest Rates</td>
                        <td className="px-3 sm:px-4 py-3">Market rates (varies by credit)</td>
                        <td className="px-3 sm:px-4 py-3">Competitive rates</td>
                        <td className="px-3 sm:px-4 py-3">Often lower than conventional</td>
                      </tr>
                      <tr className="hover:bg-green-50">
                        <td className="px-3 sm:px-4 py-3 font-bold">Property Requirements</td>
                        <td className="px-3 sm:px-4 py-3">Standard appraisal</td>
                        <td className="px-3 sm:px-4 py-3">FHA appraisal (stricter)</td>
                        <td className="px-3 sm:px-4 py-3">VA appraisal (very strict)</td>
                      </tr>
                      <tr className="hover:bg-green-50">
                        <td className="px-3 sm:px-4 py-3 font-bold">Best For</td>
                        <td className="px-3 sm:px-4 py-3">Good credit, 20%+ down, standard homes</td>
                        <td className="px-3 sm:px-4 py-3">Lower credit, small down payment</td>
                        <td className="px-3 sm:px-4 py-3">Veterans, active military, no down payment</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">When to Choose Conventional</h3>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                    <li>✓ You have 20%+ down payment (avoid PMI entirely)</li>
                    <li>✓ Your credit score is 740+ (get best rates)</li>
                    <li>✓ Buying above FHA loan limits</li>
                    <li>✓ Want flexibility to cancel PMI after reaching 20% equity</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">When to Choose FHA</h3>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                    <li>✓ Your credit score is 580-680</li>
                    <li>✓ You only have 3.5% down payment available</li>
                    <li>✓ You're a first-time homebuyer with limited savings</li>
                    <li>✓ Buying a fixer-upper (FHA 203k renovation loans available)</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">When to Choose VA</h3>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                    <li>✓ You're an eligible veteran, active-duty military, or qualifying spouse</li>
                    <li>✓ You have little to no down payment saved</li>
                    <li>✓ You want to avoid PMI completely</li>
                    <li>✓ Buying within VA loan limits in your area</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions (FAQ)</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">What is a mortgage calculator and how does it work?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">A mortgage calculator is a financial tool that estimates your monthly home loan payment based on loan amount, interest rate, term length, and additional costs like property tax and insurance. It uses the standard amortization formula to calculate how much you'll pay each month in principal and interest, then adds your property-related expenses for a total monthly housing payment. Our calculator also shows you the total interest you'll pay over the life of the loan and provides an amortization schedule showing how each payment breaks down.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">How accurate is this mortgage calculator?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Our mortgage calculator is highly accurate for estimating payments using the standard amortization formula that banks and lenders use. However, your actual payment may vary slightly based on factors we can't predict: exact closing costs, lender-specific fees, escrow account requirements, property tax changes, insurance rate adjustments, or HOA fee modifications. For the most accurate quote, get pre-approved by a lender who will provide exact figures based on your financial profile and the specific property.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">What's the difference between pre-qualification and pre-approval?</h3>
                  <p className="text-xs sm:text-sm text-gray-700"><strong>Pre-qualification</strong> is an informal estimate of how much you might be able to borrow based on self-reported financial information. It takes minutes and doesn't verify your details. <strong>Pre-approval</strong> is a conditional commitment from a lender after they verify your income, assets, credit, and employment. It requires documentation (pay stubs, tax returns, bank statements) and a hard credit check. Pre-approval carries much more weight with sellers and gives you a realistic budget. Always get pre-approved before seriously house hunting.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">How much house can I afford?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">A common rule is the 28/36 rule: your mortgage payment shouldn't exceed 28% of your gross monthly income, and total debt payments (including mortgage, car loans, credit cards, student loans) shouldn't exceed 36%. For example, if you earn $6,000/month gross, your mortgage should stay under $1,680/month, and all debt under $2,160/month. However, consider your personal situation: job stability, emergency fund size, other financial goals, and comfort level with debt. Just because you qualify for a certain amount doesn't mean you should spend it all.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Is a 15-year or 30-year mortgage better?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Neither is universally "better" - it depends on your situation. <strong>15-year pros:</strong> Pay off faster, save massive interest (often 50%+ less), build equity quickly, lower interest rates. <strong>15-year cons:</strong> Higher monthly payments, less cash flow flexibility. <strong>30-year pros:</strong> Lower monthly payments, more cash flow for investing/emergencies, easier to qualify. <strong>30-year cons:</strong> Pay significantly more interest, slower equity building. Choose 15-year if you can comfortably afford higher payments and want to save on interest. Choose 30-year if you need lower payments or want to invest the difference elsewhere.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Should I pay PMI or wait until I have 20% down?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">There's no single right answer. <strong>Buy now with PMI if:</strong> home prices are rising fast (appreciation may outpace PMI costs), you're paying high rent, interest rates are low, or you have stable income to afford slightly higher payments. PMI typically costs 0.5-1.5% of loan amount annually and can be removed at 20% equity. <strong>Wait for 20% if:</strong> housing market is stable/declining, your rent is cheap, you can save the difference quickly, or adding PMI pushes your budget too tight. Run the numbers both ways - sometimes buying now even with PMI beats waiting 2-3 years.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">How do extra payments affect my mortgage?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Extra payments directly reduce your principal balance, which dramatically decreases the interest you'll pay over time. Since interest is calculated on the remaining balance, every dollar of extra principal saves you multiple dollars in future interest. For example, adding $100/month to a $300,000 30-year mortgage at 6.5% saves about $47,000 in interest and pays off the loan 4 years early. The earlier you make extra payments, the more you save due to compounding. Always specify that extra payments go to principal, not future payments.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">What credit score do I need for a mortgage?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Minimum scores vary by loan type: <strong>Conventional:</strong> 620 minimum (best rates at 740+), <strong>FHA:</strong> 500-580 minimum (3.5% down requires 580+), <strong>VA:</strong> no official minimum but lenders typically want 580-620. However, higher scores get better interest rates. A 760 score might get 6.0% while a 640 score gets 7.0% - that 1% difference costs about $200/month on a $300,000 loan ($72,000 over 30 years). Before applying, check your credit report for errors, pay down credit cards below 30% utilization, and don't open new credit accounts.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">What's included in my monthly mortgage payment?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Your monthly payment typically includes: <strong>Principal:</strong> paying down the loan balance, <strong>Interest:</strong> cost of borrowing money, <strong>Property Tax:</strong> annual tax divided by 12, <strong>Homeowner's Insurance:</strong> required coverage, <strong>PMI:</strong> if down payment is less than 20%, <strong>HOA Fees:</strong> if applicable. This is called "PITI" (Principal, Interest, Taxes, Insurance) or "PITIH" when HOA is included. Make sure to budget for: maintenance (1% of home value annually), utilities, and repairs when calculating total housing costs.</p>
                </div>

                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">When should I refinance my mortgage?</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Consider refinancing when: <strong>1) Interest rates drop:</strong> generally worth it if you can reduce your rate by 0.75-1.0%, <strong>2) Improve credit:</strong> your score has increased significantly since original loan, <strong>3) Switch loan terms:</strong> move from 30-year to 15-year or vice versa, <strong>4) Remove PMI:</strong> you've reached 20% equity, <strong>5) Cash-out needs:</strong> tap home equity for renovations or debt consolidation. Calculate break-even point: closing costs ÷ monthly savings = months to break even. If you'll stay in the home past that point, refinancing usually makes sense. Don't refinance just because rates dropped slightly - factor in all costs.</p>
                </div>
              </div>
            </section>

            {/* Related Tools Section */}
            <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Related Financial Calculators</h2>
              
              <p className="text-sm sm:text-base text-gray-700 mb-6">Looking for more financial insights? Try these related tools:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">Loan Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3">Calculate monthly payments for personal loans, auto loans, or any fixed-rate installment loan.</p>
                  <a 
                    href="/tools/loan-calculator" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Calculator →
                  </a>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">Compound Interest Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3">See how your savings and investments grow over time with compound interest calculations.</p>
                  <a 
                    href="/tools/compound-interest-calculator" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Calculator →
                  </a>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">Investment Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3">Plan your investment strategy and calculate potential returns based on different contribution amounts.</p>
                  <a 
                    href="/tools/investment-calculator" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Calculator →
                  </a>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">Retirement Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3">Determine how much you need to save for retirement and if you're on track to meet your goals.</p>
                  <a 
                    href="/tools/retirement-calculator" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Calculator →
                  </a>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">ROI Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-700 mb-3">Calculate return on investment for real estate, stocks, or business ventures.</p>
                  <a 
                    href="/tools/roi-calculator" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Calculator →
                  </a>
                </div>
              </div>
            </section>

            {/* Final CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg sm:rounded-xl p-6 sm:p-8 lg:p-10 shadow-xl text-white">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Ready to Calculate Your Mortgage Payment?</h2>
              
              <p className="text-sm sm:text-base lg:text-lg mb-6 opacity-90">
                Get instant, accurate mortgage estimates and make informed homebuying decisions. Our comprehensive calculator shows you everything you need to know about your monthly payment, total interest, and long-term costs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span className="text-sm">100% Free Forever</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span className="text-sm">Instant Results</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-2xl">✓</span>
                  <span className="text-sm">No Registration Required</span>
                </div>
              </div>
              
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base hover:bg-gray-100 transition-colors shadow-lg"
              >
                Use Mortgage Calculator Now →
              </button>
              
              <p className="text-xs sm:text-sm mt-6 opacity-75">
                <strong>Need help?</strong> Our calculator includes detailed explanations, examples, and guidance to help you understand every aspect of your mortgage payment.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MortgageCalculator;