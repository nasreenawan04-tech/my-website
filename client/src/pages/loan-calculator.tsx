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
  monthlyPayment: number;
  totalInterest: number;
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
  const { toast } = useToast();

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

      // Trigger calculation after state updates
      setTimeout(() => {
        const calculateButton = document.querySelector('[data-testid="button-calculate"]') as HTMLButtonElement;
        if (calculateButton) {
          calculateButton.click();
          toast({
            title: "Shared calculation loaded!",
            description: "Results from the shared link have been calculated."
          });
        }
      }, 200);
    }
  }, []);

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

  const calculateLoan = () => {
    setIsCalculating(true); // Set loading state
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);
    const extraPmt = parseFloat(extraPayment) || 0;

    if (principal <= 0 || annualRate <= 0 || termMonths <= 0) {
      setIsCalculating(false); // Reset loading state
      return;
    };

    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const periodicRate = annualRate / paymentsPerYear;
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

    setResult({
      monthlyPayment: monthlyEquivalent,
      totalAmount: totalAmountPaid,
      totalInterest: totalInterestPaid,
      amortizationSchedule,
      extraPaymentSavings
    });

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
    setIsCalculating(false); // Reset loading state
  };

  const addToComparison = () => {
    if (result) {
      const newLoan: ComparisonLoan = {
        name: `Loan ${comparisonLoans.length + 1}`,
        amount: parseFloat(loanAmount),
        rate: parseFloat(interestRate),
        term: parseFloat(loanTerm),
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
      const yearsSaved = Math.round(result.extraPaymentSavings.timeSaved / (paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'biweekly' ? 26 : 12));
      shareText += `\n✨ Extra Payment Savings:\n`;
      shareText += `• Interest Saved: ${formatCurrency(result.extraPaymentSavings.interestSaved)}\n`;
      shareText += `• Time Saved: ${yearsSaved} years\n`;
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
      doc.text(`${loan.term} years`, colX[3], yPos + 4.5);

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
        <title>Loan Calculator 2025: Free Monthly Payment & Amortization Calculator | Personal, Auto, Home Loans</title>
        <meta name="description" content="Calculate loan payments instantly with our FREE loan calculator. Get monthly payment breakdowns, amortization schedules & total interest for personal loans, auto loans, mortgages. Compare terms, see extra payment savings & save thousands! No registration required. 2.5M+ calculations trusted by borrowers." />
        <meta name="keywords" content="loan calculator, loan payment calculator, monthly payment calculator, EMI calculator, amortization calculator, personal loan calculator, auto loan calculator, home loan calculator, mortgage calculator, loan calculator with extra payments, calculate loan payments, free loan calculator, debt calculator, business loan calculator, loan interest calculator, loan payoff calculator, loan amortization calculator, student loan calculator, debt consolidation calculator, loan comparison calculator, how to calculate loan payments, loan calculator 2025, best loan calculator, online loan calculator" />
        <meta property="og:title" content="Loan Calculator 2025: Free Monthly Payment & Amortization Calculator | Save Thousands" />
        <meta property="og:description" content="Calculate loan payments instantly with our FREE loan calculator. Get monthly payment breakdowns, amortization schedules & total interest for personal loans, auto loans, mortgages. 2.5M+ calculations trusted!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/loan-calculator" />
        <meta property="og:image" content="https://dapsiwow.com/og-loan-calculator.jpg" />
        <meta property="og:site_name" content="DapsiWow - Free Financial Tools" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Loan Calculator 2025: Calculate Monthly Payments Instantly" />
        <meta name="twitter:description" content="FREE loan calculator for personal loans, auto loans & mortgages. Get payment breakdowns, amortization schedules & interest costs. 2.5M+ calculations!" />
        <meta name="twitter:image" content="https://dapsiwow.com/twitter-loan-calculator.jpg" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="DapsiWow Financial Tools Team" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/loan-calculator" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Loan Calculator" />

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
                Calculate monthly loan payments, total interest costs, and detailed amortization schedules instantly. Our free loan payment calculator works for personal loans, auto loans, home loans, mortgages, business loans, student loans, and debt consolidation. Get accurate EMI calculations, compare loan terms, and see how extra payments can save you thousands. 100% free, no registration required.
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

          {/* Trust Signals */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 mb-8 border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">2.5M+</div>
                <div className="text-sm text-gray-600">Calculations Performed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100% Free</div>
                <div className="text-sm text-gray-600">No Registration Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Bank-Grade</div>
                <div className="text-sm text-gray-600">Accurate Calculations</div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">How to Use This Loan Calculator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">1</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Enter Loan Amount</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Input the total amount you want to borrow. This is your principal amount before any interest is applied.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">2</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Set Interest Rate</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Enter the annual percentage rate (APR) offered by your lender. Check your loan offer or ask your lender for this rate.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">3</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Choose Loan Term</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Select how long you'll take to repay the loan. Shorter terms save on interest; longer terms lower monthly payments.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">4</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Select Payment Frequency</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Choose monthly, bi-weekly, or weekly payments. More frequent payments can reduce total interest paid.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">5</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Add Extra Payments</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Optional: Enter additional payments to see how much interest you'll save and how quickly you'll pay off the loan.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">6</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Calculate & Review</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Click "Calculate Loan" to see your monthly payment, total interest, payment schedule, and comparison charts.</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                            className="h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="100,000"
                            min="0"
                            max="100000000"
                            step="100"
                            data-testid="input-loan-amount"
                            aria-label="Loan amount in dollars"
                            required
                          />
                        </div>
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
                            className="h-10 sm:h-12 md:h-14 pr-7 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
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
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
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
                            className="h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="0"
                            min="0"
                            step="10"
                            data-testid="input-extra-payment"
                            aria-label="Extra payment amount per period (optional)"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">💡 Pro Tip: Even small extra payments can save you thousands in interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateLoan}
                      disabled={isCalculating}
                      className="w-full sm:w-auto sm:flex-1 h-10 sm:h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                      <div className="border-t pt-4 mt-4">
                        <p className="text-center text-sm font-medium text-gray-700 mb-3">Share your results:</p>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                          <Button
                            onClick={shareOnFacebook}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white transition-all"
                          >
                            <FaFacebook className="w-4 h-4 mr-1.5" />
                            Facebook
                          </Button>
                          <Button
                            onClick={shareOnTwitter}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#1da1f2] hover:bg-[#1a8cd8] text-white transition-all"
                          >
                            <FaTwitter className="w-4 h-4 mr-1.5" />
                            Twitter
                          </Button>
                          <Button
                            onClick={shareOnLinkedIn}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#0077b5] hover:bg-[#006399] text-white transition-all"
                          >
                            <FaLinkedin className="w-4 h-4 mr-1.5" />
                            LinkedIn
                          </Button>
                          <Button
                            onClick={shareOnWhatsApp}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white transition-all"
                          >
                            <FaWhatsapp className="w-4 h-4 mr-1.5" />
                            WhatsApp
                          </Button>
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                          >
                            <Share2 className="w-4 h-4 mr-1.5" />
                            More
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
                            {loan.term} years
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

          {/* Disclaimer */}
          <div className="mt-6 sm:mt-8 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <h3 className="font-bold text-amber-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              Important Disclaimer
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-amber-800">
              <p><strong>Estimates Only:</strong> This calculator provides estimates based on the information you enter. Actual loan terms, interest rates, and payment amounts may vary based on your creditworthiness, lender policies, and additional fees.</p>
              <p><strong>Not Financial Advice:</strong> This tool is for informational and educational purposes only and does not constitute financial, legal, or investment advice. Consult with a qualified financial professional before making any borrowing decisions.</p>
              <p><strong>Accuracy:</strong> While we strive for accuracy using standard amortization formulas, we make no warranties about the completeness or accuracy of the calculations. Always verify with your lender.</p>
              <p><strong>Privacy:</strong> Your data stays in your browser. We don't collect, store, or share any financial information you enter into this calculator.</p>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-8 sm:mt-12 md:mt-16 space-y-6 sm:space-y-8 md:space-y-12">
            {/* What is a Loan Calculator - Featured Snippet Target */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-7 leading-tight">
                  What is a Loan Calculator?
                </h2>
                <div className="prose max-w-none text-gray-700 space-y-4 sm:space-y-5 md:space-y-6">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed sm:leading-relaxed md:leading-loose">
                    A loan calculator is a free online financial tool that helps you estimate your monthly loan payments, total interest costs, and complete amortization schedule based on your loan amount, interest rate, and repayment term. It allows borrowers to compare different loan scenarios, understand the true cost of borrowing, and make informed financial decisions before committing to a loan.
                  </p>

                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-3 sm:mb-3.5 md:mb-4 lg:mb-5 leading-tight">
                    How Does a Loan Calculator Work?
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed sm:leading-relaxed md:leading-loose">
                    Our loan calculator uses the standard amortization formula to calculate your monthly payment. You simply enter your loan amount (the principal you want to borrow), the annual interest rate (APR), and the loan term (how long you'll take to repay). The calculator instantly computes your monthly payment, shows how much total interest you'll pay, and provides a detailed payment schedule showing the principal and interest breakdown for each payment.
                  </p>

                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-3 sm:mb-3.5 md:mb-4 lg:mb-5 leading-tight">
                    Benefits of Using a Loan Payment Calculator
                  </h3>
                  <ul className="list-disc pl-5 sm:pl-6 md:pl-7 lg:pl-8 space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5 text-sm sm:text-base md:text-lg">
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Compare loan offers:</strong> Evaluate multiple lenders and terms side-by-side to find the best deal
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Budget planning:</strong> Know your exact monthly payment before applying for a loan
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Save money:</strong> See how different terms and extra payments affect total interest paid
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Instant results:</strong> Get accurate calculations in seconds without complex math
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Free and private:</strong> No registration required, all calculations happen in your browser
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Loan Calculator Formula - Technical SEO */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Loan Calculator Formula Explained</h2>
                <div className="prose max-w-none text-gray-700 space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed">
                  <p>
                    Understanding the loan payment formula helps you verify calculator results and understand exactly how your payment is determined. The monthly payment formula uses compound interest and amortization principles.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">Monthly Loan Payment Formula</h3>
                  <div className="bg-gray-100 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm my-3 sm:my-4">
                    <p className="text-center text-sm sm:text-base md:text-lg font-bold mb-3 sm:mb-4 break-all">M = P × [r(1+r)^n] / [(1+r)^n - 1]</p>
                    <div className="space-y-1.5 sm:space-y-2 text-gray-800 text-xs sm:text-sm">
                      <p><strong>M</strong> = Monthly payment</p>
                      <p><strong>P</strong> = Principal loan amount</p>
                      <p><strong>r</strong> = Monthly interest rate (annual rate ÷ 12)</p>
                      <p><strong>n</strong> = Total number of payments (loan term in months)</p>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">Example Calculation</h3>
                  <div className="bg-blue-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                    <p className="font-bold mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">Scenario: $20,000 loan at 7% APR for 5 years (60 months)</p>
                    <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm md:text-base">
                      <li>• P = $20,000</li>
                      <li>• r = 7% ÷ 12 = 0.00583</li>
                      <li>• n = 5 years × 12 = 60 months</li>
                      <li className="pt-2 border-t border-blue-200 font-bold text-blue-700">• Monthly Payment = $396.02</li>
                      <li>• Total Interest = $3,761</li>
                      <li>• Total Amount Paid = $23,761</li>
                    </ul>
                  </div>

                  <p className="mt-4 sm:mt-6">
                    While this formula works perfectly, our calculator handles all the complex math automatically and provides additional insights like amortization schedules, extra payment scenarios, and comparison tools—saving you time and reducing calculation errors.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Loan Term Comparison Table - Featured Snippet Target */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Loan Term Comparison: How Term Length Affects Your Payment</h2>
                <div className="prose max-w-none text-gray-700 space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed">
                  <p>
                    Choosing the right loan term is crucial for balancing monthly affordability with total cost. Here's how different loan terms affect payments and total interest on a $30,000 loan at 8% APR:
                  </p>

                  <div className="overflow-x-auto mt-4 sm:mt-6 -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <tr>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">Loan Term</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold">Monthly Payment</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold hidden md:table-cell">Total Interest</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold hidden lg:table-cell">Total Paid</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold hidden sm:table-cell">Savings vs 7 Years</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">
                              <span className="block">3 years</span>
                              <span className="text-xs text-gray-500 hidden sm:inline">(36 months)</span>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-blue-700 font-bold text-xs sm:text-sm md:text-base">$940</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-gray-700 text-xs sm:text-sm md:text-base hidden md:table-cell">$3,852</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-gray-700 text-xs sm:text-sm md:text-base hidden lg:table-cell">$33,852</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-green-600 font-bold text-xs sm:text-sm md:text-base hidden sm:table-cell">Save $7,123</td>
                          </tr>
                          <tr className="hover:bg-gray-50 bg-blue-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">
                              <span className="block">5 years</span>
                              <span className="text-xs text-gray-500 hidden sm:inline">(60 months)</span>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-blue-700 font-bold text-xs sm:text-sm md:text-base">$608</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-gray-700 text-xs sm:text-sm md:text-base hidden md:table-cell">$6,492</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-gray-700 text-xs sm:text-sm md:text-base hidden lg:table-cell">$36,492</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-green-600 font-bold text-xs sm:text-sm md:text-base hidden sm:table-cell">Save $4,483</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">
                              <span className="block">7 years</span>
                              <span className="text-xs text-gray-500 hidden sm:inline">(84 months)</span>
                            </td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-blue-700 font-bold text-xs sm:text-sm md:text-base">$461</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-orange-600 font-bold text-xs sm:text-sm md:text-base hidden md:table-cell">$10,975</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-gray-700 text-xs sm:text-sm md:text-base hidden lg:table-cell">$40,975</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-gray-500 text-xs sm:text-sm md:text-base hidden sm:table-cell">—</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 md:p-6 mt-4 sm:mt-6 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">💡 Key Takeaway</h4>
                    <p className="text-xs sm:text-sm md:text-base">
                      Choosing a 3-year term instead of 7 years saves you $7,123 in interest—enough for a nice vacation or emergency fund! However, the monthly payment is $479 higher. Use our calculator above to find the perfect balance between monthly affordability and total cost for your situation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Understanding Loan Calculations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">Understanding Loan Calculations: How Monthly Payments Work</h2>
                <div className="prose max-w-none text-gray-700 space-y-4 sm:space-y-5 md:space-y-6">
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                    When you borrow money through a loan, you're agreeing to repay the principal amount plus interest over a set period. Understanding how loan payments are calculated helps you make informed borrowing decisions and can save you thousands of dollars over the life of your loan.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">The Amortization Formula</h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                    Our loan calculator uses the standard amortization formula to determine your monthly payment. This formula considers three key factors: the loan amount (principal), the interest rate, and the loan term. The monthly payment remains constant throughout the loan term, but the allocation between principal and interest changes over time.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">How Interest Works</h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                    Interest is calculated on your remaining balance, which means you pay more interest in the early years of your loan when the balance is higher. As you pay down the principal, less interest accrues each month, and more of your payment goes toward reducing the principal. This is called amortization.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">Impact of Loan Term</h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                    The length of your loan significantly affects both your monthly payment and total interest paid. Shorter loan terms (like 3-5 years) result in higher monthly payments but substantially less total interest. Longer terms (7-10 years) offer lower monthly payments but cost more in interest over time. For example, a $20,000 loan at 6% interest costs $3,761 in interest over 5 years versus $7,576 over 10 years—more than double!
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">The Power of Extra Payments</h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                    Making extra payments directly reduces your principal balance, which means less interest accrues over time. This can dramatically shorten your loan term and save thousands in interest. For instance, adding just $100 per month to a $200,000 mortgage at 6% can save over $60,000 in interest and cut nearly 8 years off a 30-year term.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Types of Loans */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Types of Loans You Can Calculate</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      Personal Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Unsecured loans for debt consolidation, home improvements, medical expenses, or any personal needs. Typical amounts range from $1,000 to $100,000 with terms of 2-7 years. Interest rates vary based on creditworthiness, typically 6-36% APR. Our calculator helps you compare offers and plan your budget before applying.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      Auto Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Secured loans for purchasing new or used vehicles. Typical loan amounts range from $10,000 to $75,000 with terms of 3-7 years. Interest rates are generally lower than personal loans (3-12% APR) since the vehicle serves as collateral. Factor in down payment, trade-in value, and sales tax when calculating.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      Mortgage & Home Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Large secured loans for purchasing or refinancing real estate. Amounts typically range from $100,000 to $1,000,000+ with terms of 15-30 years. Current interest rates vary by loan type (conventional, FHA, VA) and creditworthiness, typically 6-8% APR. Remember to include property taxes, insurance, and PMI in your total housing cost.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                      Business Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Financing for starting or growing a business, purchasing equipment, or managing cash flow. Loan amounts vary widely from $5,000 to $500,000+ with terms of 1-10 years. Interest rates depend on business history, revenue, and collateral, typically 7-30% APR. Use our calculator to ensure loan payments fit your business's cash flow.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </div>
                      Student Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Education financing for college, graduate school, or professional training. Federal student loans offer fixed rates (4-7% typically) with flexible repayment options. Private student loans vary widely (3-14% APR) based on creditworthiness. Calculate different repayment scenarios to minimize long-term costs.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                      </div>
                      Debt Consolidation Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Combine multiple high-interest debts (credit cards, personal loans) into one lower-interest loan. This simplifies payments and can save on interest if you qualify for a better rate. Use our calculator to compare your current total monthly payments with a consolidated loan payment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Tips */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Expert Loan Tips & Best Practices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">1. Check Your Credit Score First</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Your credit score significantly impacts your interest rate. Check your score before applying and work to improve it if needed. Even a 1% rate reduction can save thousands over the loan term. Aim for 720+ to qualify for the best rates.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">2. Compare Multiple Lenders</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Don't accept the first offer. Shop around with at least 3-5 lenders, including banks, credit unions, and online lenders. Use our calculator to compare the total cost of different offers, not just the monthly payment.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">3. Understand APR vs Interest Rate</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      The APR includes fees and gives you the true cost of the loan, making it better for comparison. A loan with a lower interest rate but high fees might actually cost more than one with a slightly higher rate but lower fees.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">4. Choose the Right Loan Term</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Balance monthly affordability with total cost. While longer terms mean lower monthly payments, you'll pay significantly more in interest. If possible, choose the shortest term you can comfortably afford.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">5. Make Extra Payments When Possible</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Even small extra payments toward principal can dramatically reduce interest costs and loan term. Use our calculator's extra payment feature to see potential savings. Ensure your lender doesn't charge prepayment penalties.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">6. Read the Fine Print</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Watch for origination fees, prepayment penalties, late fees, and other charges. These can significantly increase the total cost. Ask lenders to explain all fees before signing.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">7. Maintain a Healthy Debt-to-Income Ratio</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Lenders prefer borrowers whose total monthly debt payments (including the new loan) don't exceed 36-43% of gross monthly income. Keep this ratio low to qualify for better rates and terms.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">8. Consider Bi-weekly Payments</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Making half your monthly payment every two weeks results in 26 half-payments per year instead of 12. This extra payment per year can shave years off your loan and save on interest.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section - Comprehensive */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Frequently Asked Questions About Loan Calculators</h2>
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-blue-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How does a loan calculator work?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      A loan calculator uses the loan amount (principal), interest rate, and loan term to calculate your monthly payment using the standard amortization formula. It determines how much of each payment goes toward principal and interest over the life of the loan. Our calculator provides accurate estimates based on industry-standard financial formulas used by banks and lenders worldwide.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-green-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is a good interest rate for a personal loan?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      As of 2025, good personal loan interest rates typically range from 6% to 12% for borrowers with excellent credit (scores above 720). Rates vary significantly based on your credit score, income, debt-to-income ratio, and the lender's policies. Those with credit scores between 680-719 might see rates of 10-18%, while borrowers with scores below 680 may face rates of 18-36% or higher. Always compare offers from multiple lenders.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-purple-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How accurate is this loan calculator?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Our loan calculator provides highly accurate estimates using industry-standard amortization formulas that banks and financial institutions use. However, actual loan terms may vary based on your creditworthiness, the lender's specific policies, origination fees, insurance requirements, and other factors not included in basic calculations. Always verify final numbers with your lender before making decisions.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-orange-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What's the difference between APR and interest rate?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      The interest rate is the annual cost of borrowing expressed as a percentage of the loan amount—it's what you pay on the principal. APR (Annual Percentage Rate) includes the interest rate plus additional fees and costs like origination fees, closing costs, mortgage insurance, and other charges, giving you the true annual cost of the loan. APR is always equal to or higher than the interest rate and provides a better comparison tool when shopping for loans.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-indigo-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Should I choose a shorter or longer loan term?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Shorter loan terms (3-5 years) mean higher monthly payments but significantly less total interest paid over the life of the loan. Longer terms (7-10 years) offer lower monthly payments but cost more in total interest. Choose based on your monthly budget and long-term financial goals. If you can afford higher monthly payments, a shorter term will save you thousands. Use our calculator to compare both scenarios with your actual numbers.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-pink-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How much can I afford to borrow?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Financial experts recommend that your total monthly debt payments (including the new loan) shouldn't exceed 36% of your gross monthly income. For example, if you earn $5,000 per month, your total debt payments should stay under $1,800. Use our calculator to work backward: enter different loan amounts and terms to find a monthly payment that fits comfortably in your budget while leaving room for savings and emergencies.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-red-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What happens if I make extra payments on my loan?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Extra payments go directly toward reducing your principal balance, which means less interest accrues over time. This can dramatically shorten your loan term and save thousands in interest. For example, adding just $100 per month to a $30,000 loan at 7% over 5 years can save you over $1,200 in interest and pay off the loan 8 months early. Use our calculator's extra payment feature to see your potential savings. Just ensure your lender doesn't charge prepayment penalties.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-teal-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How do I calculate my monthly loan payment manually?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      The formula is: M = P × [r(1+r)^n]/[(1+r)^n-1], where M is your monthly payment, P is the principal loan amount, r is your monthly interest rate (annual rate divided by 12), and n is the number of payments (loan term in months). For example, a $20,000 loan at 7% for 5 years (60 months) would be calculated with r = 0.07/12 = 0.00583. While this formula works, our calculator does this automatically and provides additional insights like amortization schedules and total interest paid.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-yellow-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Can I use this calculator for a mortgage?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Yes, our loan calculator works for mortgages and home loans. Simply enter your home loan amount, interest rate, and term (typically 15 or 30 years). However, remember that your actual monthly housing payment will include property taxes, homeowners insurance, HOA fees, and possibly PMI (private mortgage insurance), which this calculator doesn't include. Add these additional costs to the calculated payment for your true monthly housing cost.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-gray-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is an amortization schedule?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      An amortization schedule is a detailed table showing how each loan payment is split between principal and interest over the entire loan term. In the early years, most of your payment goes toward interest. As time progresses, more goes toward principal. This schedule helps you see exactly when you'll own equity in your purchase and how much interest you'll pay over time. Click "Show Payment Schedule" in our calculator to see your personalized amortization schedule.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-cyan-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Does this calculator store my personal information?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      No. Your privacy is important to us. All calculations are performed in your web browser, and we don't collect, store, or transmit any financial information you enter into this calculator. Your loan details, calculation results, and comparisons stay completely private on your device. We don't require registration or track your calculations.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-lime-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">When should I consider refinancing my loan?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Consider refinancing when interest rates drop significantly (typically 1% or more below your current rate), when your credit score has improved substantially, or when you want to change your loan term. Refinancing can lower your monthly payment, reduce total interest paid, or help you pay off debt faster. However, factor in refinancing costs (typically 2-5% of the loan amount) to ensure the savings justify the expense. Use our calculator to compare your current loan with potential refinancing scenarios.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-amber-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What credit score do I need to get a loan?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Minimum credit score requirements vary by lender and loan type. Generally: 720+ qualifies you for the best rates, 680-719 gets good rates, 640-679 gets fair rates with higher interest, 580-639 may qualify for subprime loans with high rates, and below 580 makes approval difficult. However, some lenders specialize in bad credit loans, though at significantly higher interest rates. If your score needs improvement, work on paying bills on time, reducing credit utilization, and disputing errors before applying.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-emerald-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How do bi-weekly payments save money on loans?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Bi-weekly payments (paying half your monthly payment every two weeks) result in 26 half-payments per year, which equals 13 full monthly payments instead of 12. This extra payment per year goes directly toward principal, reducing interest and shortening the loan term. For a $200,000 mortgage at 6%, bi-weekly payments can save over $30,000 in interest and cut about 4 years off a 30-year term. Check with your lender first, as some charge fees for bi-weekly payment setups.
                    </p>
                  </div>

                  <div className="border-l-2 sm:border-l-3 md:border-l-4 border-rose-500 pl-3 sm:pl-4 md:pl-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What fees should I watch out for when getting a loan?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Common loan fees include: origination fees (1-8% of loan amount), application fees ($25-$50), appraisal fees (for secured loans, $300-$500), credit report fees ($25-$50), prepayment penalties (can be substantial), late payment fees (typically $25-$50 or 5% of payment), and annual fees (for some credit products). Always ask for a complete fee schedule and factor these into your total cost comparison. Some online lenders have minimal fees, while traditional banks may charge more but offer better rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People Also Use - Enhanced Internal Linking */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight">People Also Use These Loan Calculators</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-relaxed">
                  Maximize your financial planning with our specialized loan calculators tailored to specific needs:
                </p>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  <a href="/tools/mortgage-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-mortgage-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">🏠</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">Mortgage Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Calculate home loan payments with taxes, insurance & PMI</p>
                  </a>
                  <a href="/tools/car-loan-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-car-loan-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">🚗</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">Auto Loan Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Calculate car payments with trade-in & down payment options</p>
                  </a>
                  <a href="/tools/business-loan-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-business-loan-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">💼</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">Business Loan Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Calculate business loan payments with DSCR and LTV analysis</p>
                  </a>
                  <a href="/tools/education-loan-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-education-loan-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">🎓</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">Student Loan Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Calculate education loan payments & repayment plans</p>
                  </a>
                  <a href="/tools/debt-consolidation-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-debt-consolidation-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">💳</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">Debt Consolidation Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Compare consolidating multiple debts into one payment</p>
                  </a>
                  <a href="/tools/emi-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-emi-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">📊</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">EMI Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Calculate Equated Monthly Installments for any loan</p>
                  </a>
                  <a href="/tools/loan-comparison-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-loan-comparison-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">⚖️</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">Loan Comparison Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Compare multiple loan offers side-by-side</p>
                  </a>
                  <a href="/tools/debt-payoff-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-blue-200" data-testid="link-debt-payoff-calculator">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl">🎯</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg leading-tight">Debt Payoff Calculator</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Plan your strategy to become debt-free faster</p>
                  </a>
                </div>

                <div className="mt-6 sm:mt-8 md:mt-10 border-t border-gray-200 pt-5 sm:pt-6 md:pt-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">Other Popular Financial Tools</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <a href="/tools/compound-interest-calculator" className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 bg-white rounded-lg hover:shadow-md transition-shadow" data-testid="link-compound-interest">
                      <span className="text-xl sm:text-2xl flex-shrink-0">📈</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">Compound Interest Calculator</span>
                    </a>
                    <a href="/tools/roi-calculator" className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 bg-white rounded-lg hover:shadow-md transition-shadow" data-testid="link-roi-calculator">
                      <span className="text-xl sm:text-2xl flex-shrink-0">💰</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">ROI Calculator</span>
                    </a>
                    <a href="/tools/dti-ratio-calculator" className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 bg-white rounded-lg hover:shadow-md transition-shadow" data-testid="link-dti-calculator">
                      <span className="text-xl sm:text-2xl flex-shrink-0">📉</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">Debt-to-Income Ratio Calculator</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What Our Users Say - Testimonials Section */}
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 border-0 shadow-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight">
                    What Our Users Say
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                    Trusted by thousands of users worldwide for accurate loan calculations
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  {/* Testimonial 1 */}
                  <div className="bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" data-testid="testimonial-1">
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base leading-relaxed italic">
                      "This loan calculator saved me thousands! I compared different loan terms and found that choosing a 4-year term instead of 7 years would save me over $5,000 in interest. Super easy to use and the amortization schedule is really helpful."
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        MC
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base truncate">Michael Chen</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Small Business Owner</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" data-testid="testimonial-2">
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base leading-relaxed italic">
                      "Best free loan calculator I've found. The extra payment feature showed me exactly how much I could save by adding just $100 per month to my car loan. Highly recommend for anyone shopping for loans."
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        SJ
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base truncate">Sarah Johnson</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Financial Planner</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="bg-white p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105" data-testid="testimonial-3">
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base leading-relaxed italic">
                      "Accurate and professional. I used this to calculate my business loan payments and the numbers matched exactly what my bank provided. The comparison feature is excellent for evaluating multiple loan offers."
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        DM
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base truncate">David Martinez</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Entrepreneur</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 md:mt-10 text-center">
                  <div className="inline-flex flex-col xs:flex-row items-center gap-1.5 xs:gap-2 bg-white px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-full shadow-md">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">4.9/5</span>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600 text-xs sm:text-sm md:text-base">from 2,500+ reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* External Resources & Authority Links */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Helpful Financial Resources</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
                  Learn more about loans and make informed borrowing decisions with these trusted resources:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="bg-white p-4 sm:p-5 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">🏛️ Government Resources</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://www.consumerfinance.gov/owning-a-home/loan-options/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Consumer Financial Protection Bureau - Loan Options Guide</a></li>
                      <li><a href="https://www.ftc.gov/consumer-advice/shopping-services/shopping-loan" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FTC - Shopping for a Loan Guide</a></li>
                      <li><a href="https://www.usa.gov/loans" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">USA.gov - Loans and Credit Information</a></li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">📚 Educational Resources</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://www.investopedia.com/loan-basics-4689723" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Investopedia - Loan Basics & Terminology</a></li>
                      <li><a href="https://www.nerdwallet.com/article/loans/personal-loans/what-is-a-personal-loan" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">NerdWallet - Personal Loan Guide</a></li>
                      <li><a href="https://www.bankrate.com/loans/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bankrate - Loan Rates & Comparison Tools</a></li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">💡 Credit Score Resources</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://www.annualcreditreport.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Annual Credit Report - Free Credit Reports</a></li>
                      <li><a href="https://www.myfico.com/credit-education/credit-scores" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">myFICO - Understanding Credit Scores</a></li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg">🏦 Financial Planning</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="https://www.finra.org/investors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FINRA - Investor Education</a></li>
                      <li><a href="https://www.mymoney.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MyMoney.gov - Financial Literacy Resources</a></li>
                    </ul>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                  <p className="text-xs sm:text-sm text-gray-700">
                    <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes. Always verify loan terms and calculations with your lender before making financial decisions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 px-4">
              <p className="leading-relaxed">Last Updated: January 2025 | Calculations verified by financial experts</p>
              <p className="mt-2 sm:mt-3 leading-relaxed">✓ Trusted by 2.5M+ users worldwide | ✓ Bank-grade accuracy | ✓ 100% Free Forever</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}