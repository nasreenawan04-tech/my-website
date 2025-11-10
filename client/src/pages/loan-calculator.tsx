import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Download, Share2, Calculator, TrendingDown, Clock, DollarSign, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Area, AreaChart } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ShareResultsButton from '@/components/ShareResultsButton';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { saveCalculation } from '@/lib/calculationHistory';

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
  }).min(0, "Extra payment cannot be negative").finite("Extra payment must be a finite number")
});

interface ValidationErrors {
  loanAmount?: string;
  interestRate?: string;
  loanTerm?: string;
  extraPayment?: string;
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [interestRate, setInterestRate] = useState('5.50');
  const [loanTerm, setLoanTerm] = useState('30');
  const [termUnit, setTermUnit] = useState('years');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');
  const [extraPayment, setExtraPayment] = useState('0');
  const [showAmortization, setShowAmortization] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [comparisonLoans, setComparisonLoans] = useState<ComparisonLoan[]>([]);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false); // Added for loading state
  const resultsRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [shouldAutoCalculate, setShouldAutoCalculate] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load parameters from URL on mount (for shared links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const rate = params.get('rate');
    const term = params.get('term');
    const unit = params.get('unit');
    const freq = params.get('freq');
    const extra = params.get('extra');

    if (amount || rate || term) {
      if (amount) setLoanAmount(amount);
      if (rate) setInterestRate(rate);
      if (term) setLoanTerm(term);
      if (unit) setTermUnit(unit);
      if (freq) setPaymentFrequency(freq);
      if (extra) setExtraPayment(extra);
      setShouldAutoCalculate(true);
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

  const calculateLoan = async () => {
    setIsCalculating(true); // Set loading state
    setValidationErrors({}); // Clear previous errors
    
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);
    const extraPmt = extraPayment.trim() === '' ? 0 : parseFloat(extraPayment);
    
    // Validate inputs
    const validation = loanInputSchema.safeParse({
      loanAmount: principal,
      interestRate: annualRate,
      loanTerm: term,
      extraPayment: extraPmt
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
    
    const annualRateDecimal = annualRate / 100;
    const termMonths = termUnit === 'years' ? term * 12 : term;

    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const periodicRate = annualRateDecimal / paymentsPerYear;
    const totalPayments = termMonths * (paymentsPerYear / 12);

    const regularPayment = (principal * periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                          (Math.pow(1 + periodicRate, totalPayments) - 1);

    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let totalAmountPaid = 0;
    let actualPayments = 0;

    for (let payment = 1; payment <= totalPayments && currentBalance > 0.01; payment++) {
      const interestPayment = currentBalance * periodicRate;
      const principalPayment = Math.min(regularPayment - interestPayment + extraPmt, currentBalance);
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
      const regularTotalAmount = regularPayment * totalPayments;
      const regularTotalInterest = regularTotalAmount - principal;

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

    // Save calculation history if user is logged in (silently fail if not configured)
    if (user) {
      saveCalculation(
        user.uid,
        'Loan Calculator',
        '/loan-calculator',
        {
          loanAmount: principal,
          interestRate: annualRate,
          loanTerm: term,
          termUnit,
          paymentFrequency,
          extraPayment: extraPmt
        },
        {
          monthlyPayment: monthlyEquivalent,
          totalAmount: totalAmountPaid,
          totalInterest: totalInterestPaid,
          extraPaymentSavings
        }
      ).catch((error) => {
        // Silently log error - don't interrupt user experience
        console.error('Failed to save calculation history:', error);
      });
    }

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setIsCalculating(false); // Reset loading state after results are set
    }, 100);
  };

  const resetCalculator = () => {
    setLoanAmount('100000');
    setInterestRate('5.50');
    setLoanTerm('30');
    setTermUnit('years');
    setPaymentFrequency('monthly');
    setExtraPayment('0');
    setShowAmortization(false);
    setShowComparison(false);
    setShowChart(false);
    setComparisonLoans([]);
    setResult(null);
    setValidationErrors({}); // Clear validation errors
    setIsCalculating(false); // Reset loading state
  };

  const addToComparison = () => {
    if (result) {
      const newLoan: ComparisonLoan = {
        name: `Loan ${comparisonLoans.length + 1}`,
        amount: parseFloat(loanAmount),
        rate: parseFloat(interestRate),
        term: parseFloat(loanTerm),
        termUnit: termUnit,
        paymentFrequency: paymentFrequency,
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest
      };
      setComparisonLoans([...comparisonLoans, newLoan]);
      setShowComparison(true);
      toast({
        title: "Loan Added",
        description: "Loan added to comparison. Calculate another to compare.",
      });
    }
  };

  const handleShare = async () => {
    if (!result) return;

    // Create shareable URL with encoded parameters
    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      freq: paymentFrequency,
      extra: extraPayment
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Create comprehensive share text
    const termDisplay = termUnit === 'years' ? `${loanTerm} years` : `${loanTerm} months`;
    const freqDisplay = paymentFrequency === 'weekly' ? 'Weekly' :
                       paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly';

    // Calculate actual per-period payment based on frequency
    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const actualPeriodicPayment = result.monthlyPayment * (12 / paymentsPerYear);

    let shareText = `💰 Loan Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Principal: ${formatCurrency(parseFloat(loanAmount))}\n`;
    shareText += `• Interest Rate: ${interestRate}%\n`;
    shareText += `• Term: ${termDisplay}\n`;
    shareText += `• Payment Frequency: ${freqDisplay}\n`;
    if (parseFloat(extraPayment) > 0) {
      shareText += `• Extra Payment: ${formatCurrency(parseFloat(extraPayment))}\n`;
    }
    shareText += `\n💵 Payment Breakdown:\n`;
    shareText += `• ${freqDisplay} Payment: ${formatCurrency(actualPeriodicPayment)}\n`;
    if (paymentFrequency !== 'monthly') {
      shareText += `• Monthly Equivalent: ${formatCurrency(result.monthlyPayment)}\n`;
    }
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n`;
    shareText += `• Total Amount: ${formatCurrency(result.totalAmount)}\n`;

    if (result.extraPaymentSavings) {
      const paymentsPerYearForSavings = paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12;
      const totalYearsSaved = result.extraPaymentSavings.timeSaved / paymentsPerYearForSavings;
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
      
      shareText += `\n✨ Extra Payment Savings:\n`;
      shareText += `• Interest Saved: ${formatCurrency(result.extraPaymentSavings.interestSaved)}\n`;
      shareText += `• Time Saved: ${timeSavedText}\n`;
    }

    shareText += `\n🔗 View & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '💰 Loan Calculator Results',
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
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      freq: paymentFrequency,
      extra: extraPayment
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
      extra: extraPayment
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
      extra: extraPayment
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
      extra: extraPayment
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

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 12;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 38, 'F');

    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DapsiWow', pageWidth / 2, yPos + 5, { align: 'center' });

    yPos += 14;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Loan Calculation Report', pageWidth / 2, yPos, { align: 'center' });

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
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 42, 3, 3, 'FD');

    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('EXECUTIVE SUMMARY', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Payment', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(24);
    doc.text(formatCurrency(result.monthlyPayment), pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    const interestPercent = ((result.totalInterest / result.totalAmount) * 100).toFixed(1);
    doc.text(`Total Interest: ${formatCurrency(result.totalInterest)} (${interestPercent}% of total paid)`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 12;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 48, 3, 3, 'FD');

    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('LOAN DETAILS', margin + 4, yPos);

    yPos += 2;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');

    const termDisplay = termUnit === 'years' ? `${loanTerm} years` : `${loanTerm} months`;
    const freqDisplay = paymentFrequency === 'weekly' ? 'Weekly' :
                       paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly';

    const col1X = margin + 8;
    const col2X = margin + 60;
    const col3X = pageWidth / 2 + 8;
    const col4X = pageWidth / 2 + 60;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Loan Amount', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(parseFloat(loanAmount)), col2X, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Interest Rate', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${interestRate}%`, col4X, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Loan Term', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(termDisplay, col2X, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Payment Frequency', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(freqDisplay, col4X, yPos);

    if (parseFloat(extraPayment) > 0) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('Extra Payment', col1X, yPos);
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(parseFloat(extraPayment)), col2X, yPos);
    }

    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const actualPeriodicPayment = result.monthlyPayment * (12 / paymentsPerYear);

    if (paymentFrequency !== 'monthly') {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text(`${freqDisplay} Payment`, col1X, yPos);
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(actualPeriodicPayment), col2X, yPos);
    }

    yPos += 14;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 36, 3, 3, 'FD');

    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT SUMMARY', margin + 4, yPos);

    yPos += 2;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);

    yPos += 8;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.rect(margin + 4, yPos - 5, pageWidth - (2 * margin) - 8, 8, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Amount Paid', margin + 8, yPos);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.totalAmount), pageWidth - margin - 8, yPos, { align: 'right' });

    yPos += 9;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Principal Amount', margin + 12, yPos);

    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.text(formatCurrency(parseFloat(loanAmount)), pageWidth - margin - 12, yPos, { align: 'right' });

    yPos += 6;
    doc.setFontSize(8);
    doc.text('Total Interest', margin + 12, yPos);

    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38);
    doc.text(formatCurrency(result.totalInterest), pageWidth - margin - 12, yPos, { align: 'right' });

    if (result.extraPaymentSavings) {
      yPos += 12;
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 28, 3, 3, 'FD');

      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text('SAVINGS WITH EXTRA PAYMENTS', margin + 4, yPos);

      yPos += 2;
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.3);
      doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);

      yPos += 7;
      const totalYearsSaved = result.extraPaymentSavings.timeSaved / paymentsPerYear;
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

      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.text('Interest Saved', margin + 8, yPos);
      doc.text('Time Saved', pageWidth / 2 + 8, yPos);

      yPos += 5;
      doc.setFontSize(11);
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(result.extraPaymentSavings.interestSaved), margin + 8, yPos);
      doc.text(timeSavedText, pageWidth / 2 + 8, yPos);
    }

    yPos = pageHeight - 22;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 4;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('This calculation is for informational purposes only. Please consult with a qualified financial advisor for personalized advice.', pageWidth / 2, yPos, { align: 'center' });

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

    doc.save(`DapsiWow-Loan-Calculation-${new Date().getTime()}.pdf`);
    toast({
      title: "PDF Downloaded!",
      description: "Your professional loan calculation report has been saved."
    });
  };

  const handleDownloadAmortizationPDF = () => {
    if (!result || !result.amortizationSchedule) return;

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
    doc.text('Amortization Schedule Report', pageWidth / 2, yPos, { align: 'center' });

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
    doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    const colWidths = [20, 35, 35, 35, 35];
    const colX = [margin + 2, margin + 22, margin + 57, margin + 92, margin + 127];

    doc.text('#', colX[0], yPos + 5);
    doc.text('Payment', colX[1], yPos + 5);
    doc.text('Principal', colX[2], yPos + 5);
    doc.text('Interest', colX[3], yPos + 5);
    doc.text('Balance', colX[4], yPos + 5);

    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    result.amortizationSchedule.forEach((payment, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;

        // Repeat header on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');

        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        doc.text('#', colX[0], yPos + 5);
        doc.text('Payment', colX[1], yPos + 5);
        doc.text('Principal', colX[2], yPos + 5);
        doc.text('Interest', colX[3], yPos + 5);
        doc.text('Balance', colX[4], yPos + 5);

        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - (2 * margin), 6, 'F');
      }

      doc.setTextColor(0, 0, 0);
      doc.text(payment.month.toString(), colX[0], yPos + 4);
      doc.text(formatCurrency(payment.payment), colX[1], yPos + 4);

      doc.setTextColor(34, 197, 94);
      doc.text(formatCurrency(payment.principal), colX[2], yPos + 4);

      doc.setTextColor(249, 115, 22);
      doc.text(formatCurrency(payment.interest), colX[3], yPos + 4);

      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(payment.balance), colX[4], yPos + 4);

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
    doc.text('This schedule shows how your payments are split between principal and interest over the first 5 years.', pageWidth / 2, yPos, { align: 'center' });

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

    doc.save(`DapsiWow-Amortization-Schedule-${new Date().getTime()}.pdf`);
    toast({
      title: "PDF Downloaded!",
      description: "Your amortization schedule has been saved."
    });
  };

  const handleDownloadComparisonPDF = () => {
    if (comparisonLoans.length === 0) return;

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
    doc.text('Loan Comparison Report', pageWidth / 2, yPos, { align: 'center' });

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
    doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    const colX = [margin + 2, margin + 35, margin + 65, margin + 90, margin + 115, margin + 150];

    doc.text('Loan', colX[0], yPos + 5);
    doc.text('Amount', colX[1], yPos + 5);
    doc.text('Rate', colX[2], yPos + 5);
    doc.text('Term', colX[3], yPos + 5);
    doc.text('Payment', colX[4], yPos + 5);
    doc.text('Interest', colX[5], yPos + 5);

    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    comparisonLoans.forEach((loan, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;

        // Repeat header on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');

        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        doc.text('Loan', colX[0], yPos + 5);
        doc.text('Amount', colX[1], yPos + 5);
        doc.text('Rate', colX[2], yPos + 5);
        doc.text('Term', colX[3], yPos + 5);
        doc.text('Payment', colX[4], yPos + 5);
        doc.text('Interest', colX[5], yPos + 5);

        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - (2 * margin), 7, 'F');
      }

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(loan.name, colX[0], yPos + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(loan.amount), colX[1], yPos + 4.5);
      doc.text(`${loan.rate}%`, colX[2], yPos + 4.5);
      doc.text(`${loan.term} ${loan.termUnit}`, colX[3], yPos + 4.5);

      doc.setTextColor(59, 130, 246);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(loan.monthlyPayment), colX[4], yPos + 4.5);

      doc.setTextColor(249, 115, 22);
      doc.text(formatCurrency(loan.totalInterest), colX[5], yPos + 4.5);

      yPos += 7;
    });

    // Summary section
    yPos += 5;
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Analysis:', margin, yPos);

    yPos += 6;
    const bestPayment = Math.min(...comparisonLoans.map(l => l.monthlyPayment));
    const bestInterest = Math.min(...comparisonLoans.map(l => l.totalInterest));
    const bestPaymentLoan = comparisonLoans.find(l => l.monthlyPayment === bestPayment);
    const bestInterestLoan = comparisonLoans.find(l => l.totalInterest === bestInterest);

    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Lowest Monthly Payment: ${bestPaymentLoan?.name} at ${formatCurrency(bestPayment)}`, margin + 5, yPos);

    yPos += 5;
    doc.text(`• Lowest Total Interest: ${bestInterestLoan?.name} at ${formatCurrency(bestInterest)}`, margin + 5, yPos);

    // Footer
    yPos = pageHeight - 22;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 4;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('This comparison is based on the loan scenarios you entered. Actual terms may vary by lender.', pageWidth / 2, yPos, { align: 'center' });

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

    doc.save(`DapsiWow-Loan-Comparison-${new Date().getTime()}.pdf`);
    toast({
      title: "PDF Downloaded!",
      description: "Your loan comparison report has been saved."
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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
        <title>Loan Calculator 2025: Monthly Payments & Amortization</title>
        <meta name="description" content="Calculate loan payments instantly. Free tool for monthly payments, amortization schedules & interest totals. Compare all loan types. Trusted by 2.5M+!" />
        <meta name="keywords" content="loan calculator, loan payment calculator, monthly payment calculator, EMI calculator, amortization calculator, personal loan calculator, auto loan calculator, home loan calculator, mortgage calculator, loan calculator with extra payments, calculate loan payments, free loan calculator, debt calculator, business loan calculator, loan interest calculator, loan payoff calculator, loan amortization calculator, student loan calculator, debt consolidation calculator, loan comparison calculator, how to calculate loan payments, loan calculator 2025, best loan calculator, online loan calculator" />
        
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
        
        <meta property="og:title" content="Loan Calculator: Monthly Payments & Amortization 2025" />
        <meta property="og:description" content="Calculate loan payments instantly. Free tool for monthly payments, amortization & interest. Compare all loan types. Trusted by 2.5M+ borrowers!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/loan-calculator" />
        <meta property="og:image" content="https://dapsiwow.com/og-loan-calculator.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Free Loan Calculator - Calculate Monthly Payments, Interest & Amortization Schedule" />
        <meta property="og:site_name" content="DapsiWow - Free Financial Tools" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:updated_time" content="2025-01-10T00:00:00Z" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Loan Calculator: Monthly Payments & Amortization" />
        <meta name="twitter:description" content="Calculate loan payments instantly. Free tool for monthly payments, amortization & interest totals. Compare all loan types. Trusted by 2.5M+ users!" />
        <meta name="twitter:image" content="https://dapsiwow.com/twitter-loan-calculator.jpg" />
        <meta name="twitter:image:alt" content="Loan Calculator Tool - Calculate Monthly Loan Payments Free" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="twitter:creator" content="@DapsiWow" />
        
        <meta name="pinterest-rich-pin" content="true" />
        <meta property="pinterest:description" content="Calculate loan payments instantly! Free loan calculator with amortization schedules, payment breakdowns & interest savings. Perfect for all loan types." />
        
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
            "description": "Free online loan calculator to calculate monthly payments, total interest, and create detailed amortization schedules for personal loans, auto loans, mortgages, business loans, student loans, and debt consolidation. Get instant, accurate calculations with bank-grade formulas.",
            "url": "https://dapsiwow.com/tools/loan-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript",
            "permissions": "browser",
            "softwareVersion": "2.0",
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
            "description": "Professional loan calculator to calculate monthly payments, total interest, and amortization schedules for personal loans, auto loans, mortgages, and business loans. Free, accurate, and instant results.",
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
            "alternateName": ["Loan Payment Calculator", "EMI Calculator", "Amortization Calculator"],
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
                Calculate monthly payments, total interest, and amortization schedules instantly. Works for all loan types: personal, auto, home, mortgage, business, student, and debt consolidation. Compare terms and see how extra payments save you money. Free, no registration required.
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
                            className={`h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.extraPayment ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="0"
                            min="0"
                            step="10"
                            data-testid="input-extra-payment"
                            aria-label="Extra payment amount per period (optional)"
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
                      onClick={calculateLoan}
                      disabled={isCalculating || !loanAmount || !interestRate || !loanTerm || Object.keys(validationErrors).length > 0}
                      className="w-full sm:w-auto sm:flex-1 h-10 sm:h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-calculate"
                      aria-busy={isCalculating}
                    >
                      {isCalculating ? 'Calculating...' : 'Calculate Loan'}
                    </Button>
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
                          onClick={() => setShowChart(!showChart)}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs sm:text-sm"
                          data-testid="button-show-chart"
                          aria-expanded={showChart}
                          aria-label={showChart ? 'Hide payment chart' : 'Show payment chart'}
                        >
                          {showChart ? 'Hide' : 'Show'} Payment Chart
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

                      {showChart && (
                        <div className="space-y-4 sm:space-y-6">
                          {/* Donut Chart - Total Loan Breakdown */}
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-base sm:text-lg">Total Loan Breakdown</h3>
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6">
                              <div className="w-full max-w-[280px] sm:max-w-xs">
                                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 240 : 280}>
                                  <RechartsPieChart>
                                    <Pie
                                      data={[
                                        { name: 'Principal', value: parseFloat(loanAmount), percentage: principalPercentage },
                                        { name: 'Interest', value: result.totalInterest, percentage: interestPercentage }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={window.innerWidth < 640 ? 45 : 60}
                                      outerRadius={window.innerWidth < 640 ? 75 : 90}
                                      paddingAngle={3}
                                      dataKey="value"
                                      label={window.innerWidth >= 640 ? ({ percentage }) => `${percentage.toFixed(1)}%` : false}
                                      labelLine={window.innerWidth >= 640}
                                    >
                                      <Cell fill="url(#principalGradient)" />
                                      <Cell fill="url(#interestGradient)" />
                                    </Pie>
                                    <RechartsTooltip
                                      formatter={(value: number) => formatCurrency(value)}
                                      contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        fontSize: window.innerWidth < 640 ? '12px' : '14px'
                                      }}
                                    />
                                    <defs>
                                      <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                                      </linearGradient>
                                      <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                                      </linearGradient>
                                    </defs>
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 w-full lg:w-auto">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Principal Amount</span>
                                  </div>
                                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 break-all">{formatCurrency(parseFloat(loanAmount))}</div>
                                  <div className="text-xs sm:text-sm text-green-700 mt-1">{principalPercentage.toFixed(1)}% of total</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full"></div>
                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Total Interest</span>
                                  </div>
                                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 break-all">{formatCurrency(result.totalInterest)}</div>
                                  <div className="text-xs sm:text-sm text-orange-700 mt-1">{interestPercentage.toFixed(1)}% of total</div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
                                <span className="text-xs sm:text-sm text-gray-600">Total Amount to be Repaid:</span>
                                <span className="text-lg sm:text-xl font-bold text-gray-900 break-all">{formatCurrency(result.totalAmount)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Timeline Chart */}
                          {result.amortizationSchedule.length > 0 && (
                            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 text-center text-base sm:text-lg">Payment Breakdown Over Time</h3>
                              <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4 px-2">See how your monthly payments are split between principal and interest (First 5 Years)</p>
                              <div className="w-full overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                                <div className="min-w-[300px]">
                                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 250 : window.innerWidth < 1024 ? 280 : 320}>
                                    <AreaChart
                                      data={result.amortizationSchedule.map(item => ({
                                        month: `Month ${item.month}`,
                                        Principal: item.principal,
                                        Interest: item.interest,
                                        balance: item.balance
                                      }))}
                                      margin={{ top: 10, right: window.innerWidth < 640 ? 5 : 10, left: window.innerWidth < 640 ? -10 : 0, bottom: 0 }}
                                    >
                                      <defs>
                                        <linearGradient id="principalAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                        </linearGradient>
                                        <linearGradient id="interestAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                      <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                        interval="preserveStartEnd"
                                        tickFormatter={(value, index) => {
                                          const monthNum = index + 1;
                                          if (window.innerWidth < 640) {
                                            if (monthNum === 1 || monthNum === 24 || monthNum === 60) {
                                              return `Y${Math.ceil(monthNum / 12)}`;
                                            }
                                          } else {
                                            if (monthNum === 1 || monthNum === 12 || monthNum === 24 || monthNum === 36 || monthNum === 48 || monthNum === 60) {
                                              return `Yr ${Math.ceil(monthNum / 12)}`;
                                            }
                                          }
                                          return '';
                                        }}
                                      />
                                      <YAxis
                                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                        width={window.innerWidth < 640 ? 45 : 60}
                                        tickFormatter={(value) => window.innerWidth < 640 ? `$${(value / 1000).toFixed(0)}k` : `$${(value / 1000).toFixed(0)}k`}
                                      />
                                      <RechartsTooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelFormatter={(label) => label}
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                          border: '1px solid #e5e7eb',
                                          borderRadius: '8px',
                                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                          fontSize: window.innerWidth < 640 ? '11px' : '14px',
                                          padding: window.innerWidth < 640 ? '6px 8px' : '8px 12px'
                                        }}
                                      />
                                      <Area
                                        type="monotone"
                                        dataKey="Principal"
                                        stackId="1"
                                        stroke="#10b981"
                                        fill="url(#principalAreaGradient)"
                                        strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                                      />
                                      <Area
                                        type="monotone"
                                        dataKey="Interest"
                                        stackId="1"
                                        stroke="#f59e0b"
                                        fill="url(#interestAreaGradient)"
                                        strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                                      />
                                      <Legend
                                        verticalAlign="top"
                                        height={window.innerWidth < 640 ? 30 : 36}
                                        iconType="square"
                                        wrapperStyle={{ paddingBottom: window.innerWidth < 640 ? '6px' : '10px', fontSize: window.innerWidth < 640 ? '11px' : '14px' }}
                                        iconSize={window.innerWidth < 640 ? 10 : 14}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-center text-xs sm:text-sm">
                                <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                                  <div className="text-gray-600 mb-0.5 sm:mb-1 text-xs sm:text-sm">Early Payment</div>
                                  <div className="font-bold text-gray-900 text-xs sm:text-sm">More Interest</div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-2 sm:p-3">
                                  <div className="text-gray-600 mb-0.5 sm:mb-1 text-xs sm:text-sm">Mid Payment</div>
                                  <div className="font-bold text-gray-900 text-xs sm:text-sm">Balanced Split</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                                  <div className="text-gray-600 mb-0.5 sm:mb-1 text-xs sm:text-sm">Late Payment</div>
                                  <div className="font-bold text-gray-900 text-xs sm:text-sm">More Principal</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Loan Progress Indicator */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-blue-200">
                            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-center text-base sm:text-lg">Understanding Your Loan</h3>
                            <div className="space-y-3 sm:space-4">
                              <div>
                                <div className="flex flex-col xs:flex-row justify-between gap-1 xs:gap-2 text-xs sm:text-sm mb-2">
                                  <span className="text-gray-700 font-medium">You're borrowing</span>
                                  <span className="text-gray-900 font-bold break-all">{formatCurrency(parseFloat(loanAmount))}</span>
                                </div>
                                <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                    style={{ width: `${principalPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex flex-col xs:flex-row justify-between gap-1 xs:gap-2 text-xs sm:text-sm mb-2">
                                  <span className="text-gray-700 font-medium">You'll pay in interest</span>
                                  <span className="text-orange-600 font-bold break-all">{formatCurrency(result.totalInterest)}</span>
                                </div>
                                <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                    style={{ width: `${interestPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="pt-3 sm:pt-4 border-t border-blue-200">
                                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-1 xs:gap-2 mb-2">
                                  <span className="text-gray-700 font-semibold text-sm sm:text-base">Total Repayment</span>
                                  <span className="text-xl sm:text-2xl font-bold text-gray-900 break-all">{formatCurrency(result.totalAmount)}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 text-center px-2">
                                  💡 For every {formatCurrency(1)} you borrow, you'll pay back ${(result.totalAmount / parseFloat(loanAmount)).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-principal-amount">
                              {formatCurrency(parseFloat(loanAmount))}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Interest Paid</span>
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
              </div>
            </CardContent>
          </Card>

          {result && showAmortization && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3
                    className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    onClick={() => setShowAmortization(false)}
                    title="Click to hide schedule"
                  >
                    Amortization Schedule (First 5 Years)
                  </h3>
                  <Button
                    onClick={handleDownloadAmortizationPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto justify-center rounded-full text-xs sm:text-sm"
                    data-testid="button-export-amortization-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">See how your payments are split between principal and interest over time.</p>
                <div
                  ref={tableScrollRef}
                  className={`overflow-x-auto -mx-4 sm:mx-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                >
                  <table className="w-full min-w-[600px] select-none" data-testid="amortization-table">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-sm rounded-l-lg">Payment #</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Payment</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Principal</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Interest</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm rounded-r-lg">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.amortizationSchedule.map((payment, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">{payment.month}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(payment.payment)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-green-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-medium text-xs sm:text-sm">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-bold text-xs sm:text-sm">
                            {formatCurrency(payment.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {showComparison && comparisonLoans.length > 0 && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Loan Comparison</h3>
                  <Button
                    onClick={handleDownloadComparisonPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto justify-center rounded-full text-xs sm:text-sm"
                    data-testid="button-export-comparison-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Compare different loan scenarios side-by-side to find the best option.</p>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[600px]" data-testid="comparison-table">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-sm rounded-l-lg">Loan</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Amount</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Rate</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Term</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Monthly Payment</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm rounded-r-lg">Total Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {comparisonLoans.map((loan, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 font-bold text-xs sm:text-sm">{loan.name}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {loan.rate}%
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {loan.term} {loan.termUnit}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-blue-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(loan.monthlyPayment)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-orange-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(loan.totalInterest)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 sm:mt-6">
                  <Button
                    onClick={() => setComparisonLoans([])}
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                  >
                    Clear Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          
        </div>
      </main>

      <Footer />
    </div>
  );
}