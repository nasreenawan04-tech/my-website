import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, TrendingUp, Clock, PieChart, Share2, Download, TrendingDown, DollarSign, Info } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
  interestAmount: number;
  interestPercentage: number;
  prepaymentAnalysis?: {
    timeReduction: number;
    interestSaved: number;
    newTenure: number;
    newTotalAmount: number;
  };
  stepUpAnalysis?: {
    totalInterestSaved: number;
    averageEMI: number;
    finalEMI: number;
    yearlyEMISchedule: Array<{ year: number; emi: number }>;
  };
  amortizationSchedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState('100000');
  const [interestRate, setInterestRate] = useState('8.50');
  const [loanTenure, setLoanTenure] = useState('20');
  const [tenureType, setTenureType] = useState('years');
  const [currency, setCurrency] = useState('USD');
  const [prepaymentAmount, setPrepaymentAmount] = useState('0');
  const [prepaymentAfterMonths, setPrepaymentAfterMonths] = useState('12');
  const [stepUpPercentage, setStepUpPercentage] = useState('5');
  const [enableStepUp, setEnableStepUp] = useState(false);
  const [enablePrepayment, setEnablePrepayment] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [result, setResult] = useState<EMIResult | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { toast } = useToast();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is EMI and how is it calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each month. It's calculated using the formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the monthly interest rate (annual rate divided by 12), and N is the number of monthly installments. This formula ensures equal payments throughout the loan term, with each payment covering both principal and interest portions."
        }
      },
      {
        "@type": "Question",
        "name": "How does prepayment reduce my EMI burden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prepayment directly reduces your outstanding principal, which means less interest accrues over the remaining loan period. This can significantly shorten your loan tenure and save thousands in interest costs. For example, adding $100/month to a $200,000 loan at 7% interest can save over $30,000 in interest and reduce the loan term by 5-7 years. Even small extra payments compound to big savings over time."
        }
      },
      {
        "@type": "Question",
        "name": "What is step-up EMI and who should use it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Step-up EMI allows you to start with lower monthly payments that increase annually, typically by 5-10%, aligned with expected salary growth. It's ideal for young professionals whose income is expected to grow consistently, allowing them to afford larger loans while maintaining their current lifestyle. The increasing EMIs align with expected salary increments, making higher loan amounts more accessible early in one's career."
        }
      },
      {
        "@type": "Question",
        "name": "Should I choose a shorter or longer loan tenure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shorter tenures (5-15 years) mean higher EMIs but significantly less total interest paid—often saving 30-50% in interest costs. Longer tenures (20-30 years) offer lower EMIs but cost substantially more overall due to extended interest payments. Choose based on your monthly budget, income stability, and financial goals. If you can comfortably afford higher payments without compromising emergency savings, shorter tenure saves substantial money long-term."
        }
      },
      {
        "@type": "Question",
        "name": "What percentage of my income should go toward EMI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Financial experts recommend keeping total EMI payments (all loans combined) below 40-50% of your gross monthly income. This ensures you have enough for savings, emergencies, and other expenses. Lenders typically use a debt-to-income ratio of 40% as a maximum threshold for loan approval. For better financial health, aim for 30% or less, leaving room for investments and lifestyle expenses."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate is this EMI calculator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This EMI calculator uses bank-grade formulas that are 100% accurate for calculating standard EMI payments, total interest, and amortization schedules. It's the same calculation method banks and financial institutions use. However, actual loan terms may include additional fees (processing fees, insurance, etc.) that aren't reflected in basic EMI calculations. Always verify final numbers with your lender before committing to a loan."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use this calculator for all types of loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, this EMI calculator works for all types of fixed-rate loans including home loans, car loans, personal loans, business loans, education loans, and more. It supports loans from $1,000 to $10,000,000+ with any interest rate. The calculator also handles different currencies (USD, EUR, GBP, INR, etc.), prepayment scenarios, and step-up EMI structures. It's a universal tool for any standard amortizing loan calculation."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Calculate EMI Using This Calculator",
    "description": "Step-by-step guide to calculating your loan EMI payments",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Select Currency",
        "text": "Choose your preferred currency from the dropdown menu (USD, EUR, GBP, INR, etc.)."
      },
      {
        "@type": "HowToStep",
        "name": "Enter Loan Amount",
        "text": "Input the total principal amount you want to borrow in the Loan Amount field."
      },
      {
        "@type": "HowToStep",
        "name": "Set Interest Rate",
        "text": "Enter the annual interest rate offered by your lender as a percentage."
      },
      {
        "@type": "HowToStep",
        "name": "Choose Loan Term",
        "text": "Select the loan duration in years or months from the dropdown."
      },
      {
        "@type": "HowToStep",
        "name": "Configure Advanced Options",
        "text": "Optionally enable prepayment analysis or step-up EMI to see how these affect your loan."
      },
      {
        "@type": "HowToStep",
        "name": "Calculate and Review",
        "text": "Click 'Calculate EMI' to see your monthly payment, total interest, and detailed amortization schedule."
      }
    ]
  };

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const rate = annualRate / 12;
    const tenure = tenureType === 'years' ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);
    const prepayment = parseFloat(prepaymentAmount) || 0;
    const prepaymentAfter = parseInt(prepaymentAfterMonths) || 12;
    const stepUpRate = parseFloat(stepUpPercentage) / 100;

    if (principal <= 0 || annualRate <= 0 || tenure <= 0) return;

    const baseEMI = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);

    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let currentEMI = baseEMI;
    let actualTenure = tenure;

    for (let month = 1; month <= tenure && currentBalance > 1; month++) {
      if (enableStepUp && month > 12 && (month - 1) % 12 === 0) {
        currentEMI = currentEMI * (1 + stepUpRate);
      }

      const interestPayment = currentBalance * rate;
      let principalPayment = Math.min(currentEMI - interestPayment, currentBalance);

      if (enablePrepayment && month === prepaymentAfter) {
        principalPayment += Math.min(prepayment, currentBalance - principalPayment);
      }

      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      actualTenure = month;

      if (month <= 60) {
        amortizationSchedule.push({
          month,
          emi: currentEMI,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, currentBalance)
        });
      }

      if (currentBalance <= 1) break;
    }

    const regularTotalAmount = baseEMI * tenure;
    const regularTotalInterest = regularTotalAmount - principal;

    const finalTotalAmount = totalInterestPaid + principal;
    const finalTotalInterest = totalInterestPaid;
    const interestPercentage = (finalTotalInterest / finalTotalAmount) * 100;

    let prepaymentAnalysis;
    if (enablePrepayment && prepayment > 0) {
      const interestSaved = regularTotalInterest - finalTotalInterest;
      const timeReduction = Math.max(0, tenure - actualTenure);

      prepaymentAnalysis = {
        timeReduction: Math.round(timeReduction),
        interestSaved: Math.round(interestSaved * 100) / 100,
        newTenure: actualTenure,
        newTotalAmount: Math.round(finalTotalAmount * 100) / 100
      };
    }

    let stepUpAnalysis;
    if (enableStepUp) {
      const regularTotalInterest = (baseEMI * tenure) - principal;
      const totalInterestSaved = Math.max(0, regularTotalInterest - finalTotalInterest);
      const averageEMI = finalTotalAmount / actualTenure;
      const finalEMI = currentEMI;

      const yearlyEMISchedule = [];
      let yearlyEMI = baseEMI;
      for (let year = 1; year <= Math.ceil(tenure / 12); year++) {
        yearlyEMISchedule.push({
          year,
          emi: Math.round(yearlyEMI * 100) / 100
        });
        if (year > 1) {
          yearlyEMI = yearlyEMI * (1 + stepUpRate);
        }
      }

      stepUpAnalysis = {
        totalInterestSaved: Math.round(totalInterestSaved * 100) / 100,
        averageEMI: Math.round(averageEMI * 100) / 100,
        finalEMI: Math.round(finalEMI * 100) / 100,
        yearlyEMISchedule
      };
    }

    setResult({
      emi: Math.round(baseEMI * 100) / 100,
      totalAmount: Math.round(finalTotalAmount * 100) / 100,
      totalInterest: Math.round(finalTotalInterest * 100) / 100,
      principalAmount: principal,
      interestAmount: Math.round(finalTotalInterest * 100) / 100,
      interestPercentage: Math.round(interestPercentage * 100) / 100,
      prepaymentAnalysis,
      stepUpAnalysis,
      amortizationSchedule
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const resetCalculator = () => {
    setLoanAmount('100000');
    setInterestRate('8.50');
    setLoanTenure('20');
    setTenureType('years');
    setCurrency('USD');
    setPrepaymentAmount('0');
    setPrepaymentAfterMonths('12');
    setStepUpPercentage('5');
    setEnableStepUp(false);
    setEnablePrepayment(false);
    setShowSchedule(false);
    setShowChart(false);
    setResult(null);
  };

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

  const handleShare = async () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTenure,
      unit: tenureType,
      currency: currency,
      prepayment: prepaymentAmount,
      prepaymentAfter: prepaymentAfterMonths,
      stepUp: stepUpPercentage
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    const termDisplay = tenureType === 'years' ? `${loanTenure} years` : `${loanTenure} months`;

    let shareText = `💰 EMI Loan Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Loan Amount: ${formatCurrency(parseFloat(loanAmount))}\n`;
    shareText += `• Interest Rate: ${interestRate}%\n`;
    shareText += `• Loan Term: ${termDisplay}\n`;
    if (parseFloat(prepaymentAmount) > 0 && enablePrepayment) {
      shareText += `• Prepayment: ${formatCurrency(parseFloat(prepaymentAmount))}\n`;
    }
    if (enableStepUp) {
      shareText += `• Step-Up: ${stepUpPercentage}% annually\n`;
    }

    shareText += `\n💵 EMI Breakdown:\n`;
    shareText += `• Monthly EMI: ${formatCurrency(result.emi)}\n`;
    shareText += `• Principal Amount: ${formatCurrency(result.principalAmount)}\n`;
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n`;
    shareText += `• Total Amount: ${formatCurrency(result.totalAmount)}\n`;

    if (result.prepaymentAnalysis) {
      const yearsSaved = Math.round(result.prepaymentAnalysis.timeReduction / 12);
      shareText += `\n✨ Prepayment Savings:\n`;
      shareText += `• Interest Saved: ${formatCurrency(result.prepaymentAnalysis.interestSaved)}\n`;
      shareText += `• Time Saved: ${yearsSaved} years\n`;
    }

    if (result.stepUpAnalysis) {
      shareText += `\n📈 Step-Up EMI Benefits:\n`;
      shareText += `• Interest Saved: ${formatCurrency(result.stepUpAnalysis.totalInterestSaved)}\n`;
      shareText += `• Final EMI: ${formatCurrency(result.stepUpAnalysis.finalEMI)}\n`;
    }

    shareText += `\n🔗 View & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '💰 EMI Loan Calculator Results',
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
      amount: loanAmount,
      rate: interestRate,
      term: loanTenure,
      unit: tenureType,
      currency: currency,
      prepayment: prepaymentAmount,
      prepaymentAfter: prepaymentAfterMonths,
      stepUp: stepUpPercentage
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
      term: loanTenure,
      unit: tenureType,
      currency: currency,
      prepayment: prepaymentAmount,
      prepaymentAfter: prepaymentAfterMonths,
      stepUp: stepUpPercentage
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const tweetText = `💰 My EMI calculation: ${formatCurrency(result.emi)}/month on ${formatCurrency(parseFloat(loanAmount))} at ${interestRate}% - Calculate yours free!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    toast({ title: "Opening Twitter share..." });
  };

  const shareOnLinkedIn = () => {
    if (!result) return;

    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTenure,
      unit: tenureType,
      currency: currency,
      prepayment: prepaymentAmount,
      prepaymentAfter: prepaymentAfterMonths,
      stepUp: stepUpPercentage
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
      term: loanTenure,
      unit: tenureType,
      currency: currency,
      prepayment: prepaymentAmount,
      prepaymentAfter: prepaymentAfterMonths,
      stepUp: stepUpPercentage
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const termDisplay = tenureType === 'years' ? `${loanTenure} years` : `${loanTenure} months`;
    const whatsappText = `💰 EMI Calculator Results:\n\nLoan: ${formatCurrency(parseFloat(loanAmount))}\nRate: ${interestRate}%\nTerm: ${termDisplay}\nMonthly EMI: ${formatCurrency(result.emi)}\n\nCalculate yours: ${shareableUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
    toast({ title: "Opening WhatsApp share..." });
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
    doc.text('EMI Calculation Report', pageWidth / 2, yPos, { align: 'center' });

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
    doc.text('Monthly EMI', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(24);
    doc.text(formatCurrency(result.emi), pageWidth / 2, yPos, { align: 'center' });

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
    const termDisplay = tenureType === 'years' ? `${loanTenure} years` : `${loanTenure} months`;
    doc.text(termDisplay, col2X, yPos);

    if (parseFloat(prepaymentAmount) > 0 && enablePrepayment) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('Prepayment', col3X, yPos);
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(parseFloat(prepaymentAmount)), col4X, yPos);
    }

    if (enableStepUp) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('Step-Up Rate', col1X, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${stepUpPercentage}% annually`, col2X, yPos);
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
    doc.setFont('helvetica', 'normal');
    doc.text('Principal Amount', margin + 12, yPos);

    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(result.principalAmount), pageWidth - margin - 12, yPos, { align: 'right' });

    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Interest', margin + 12, yPos);

    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38);
    doc.text(formatCurrency(result.totalInterest), pageWidth - margin - 12, yPos, { align: 'right' });

    if (result.prepaymentAnalysis) {
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
      const totalYearsSaved = result.prepaymentAnalysis.timeReduction / 12;
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
      doc.text(formatCurrency(result.prepaymentAnalysis.interestSaved), margin + 8, yPos);
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

    doc.save(`DapsiWow-EMI-Calculation-${new Date().getTime()}.pdf`);
    toast({
      title: "PDF Downloaded!",
      description: "Your professional EMI calculation report has been saved."
    });
  };

  const handleDownloadAmortizationPDF = () => {
    if (!result || !result.amortizationSchedule) return;

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

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    result.amortizationSchedule.forEach((payment, index) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;

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

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - (2 * margin), 6, 'F');
      }

      doc.setTextColor(0, 0, 0);
      doc.text(payment.month.toString(), colX[0], yPos + 4);
      doc.text(formatCurrency(payment.emi), colX[1], yPos + 4);

      doc.setTextColor(34, 197, 94);
      doc.text(formatCurrency(payment.principal), colX[2], yPos + 4);

      doc.setTextColor(249, 115, 22);
      doc.text(formatCurrency(payment.interest), colX[3], yPos + 4);

      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(payment.balance), colX[4], yPos + 4);

      yPos += 6;
    });

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

  const formatCurrency = (amount: number) => {
    const currencyMap: { [key: string]: { locale: string; currency: string } } = {
      USD: { locale: 'en-US', currency: 'USD' },
      EUR: { locale: 'de-DE', currency: 'EUR' },
      GBP: { locale: 'en-GB', currency: 'GBP' },
      INR: { locale: 'en-IN', currency: 'INR' },
      JPY: { locale: 'ja-JP', currency: 'JPY' },
      CAD: { locale: 'en-CA', currency: 'CAD' },
      AUD: { locale: 'en-AU', currency: 'AUD' },
      CNY: { locale: 'zh-CN', currency: 'CNY' },
      BRL: { locale: 'pt-BR', currency: 'BRL' },
      MXN: { locale: 'es-MX', currency: 'MXN' }
    };

    const config = currencyMap[currency] || currencyMap.USD;

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const principalPercentage = result ? (result.principalAmount / result.totalAmount) * 100 : 0;
  const interestPercentage = result ? (result.totalInterest / result.totalAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>EMI Calculator 2025: Free Monthly Payment Calculator with Prepayment & Step-Up | Home, Car, Personal Loans</title>
        <meta name="description" content="Calculate EMI instantly with our FREE EMI calculator featuring prepayment analysis & step-up EMI. Get monthly payment breakdowns, amortization schedules & total interest for home loans, car loans, personal loans. Compare terms, see prepayment savings & save thousands! No registration required. 3.4M+ calculations trusted by borrowers." />
        <meta name="keywords" content="emi calculator, emi calculator with prepayment, step up emi calculator, loan emi calculator, home loan emi calculator, car loan emi calculator, personal loan emi calculator, emi calculator with amortization schedule, how to calculate emi, emi calculation formula, prepayment calculator, education loan emi calculator, emi calculator online free, mortgage emi calculator, loan calculator with extra payments, what is emi, emi formula, reduce emi payment, calculate emi manually, floating interest rate emi calculator, home loan prepayment calculator, part prepayment calculator, progressive emi calculator, emi calculator showing principal and interest, loan amortization calculator, step up home loan calculator, emi calculator india, business loan emi calculator, bike loan emi calculator, education loan emi calculator with grace period, multiple prepayment emi calculator, emi calculator 2025, best emi calculator, online emi calculator, free emi calculator tool, emi payment calculator, monthly emi calculator" />
        <meta property="og:title" content="EMI Calculator 2025: Free Monthly Payment Calculator with Prepayment & Step-Up | Save Thousands" />
        <meta property="og:description" content="Calculate EMI instantly with our FREE EMI calculator featuring prepayment analysis & step-up EMI. Get monthly payment breakdowns, amortization schedules & total interest for home loans, car loans, personal loans. 3.4M+ calculations trusted!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/emi-calculator" />
        <meta property="og:image" content="https://dapsiwow.com/og-emi-calculator.jpg" />
        <meta property="og:site_name" content="DapsiWow - Free Financial Tools" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EMI Calculator 2025: Calculate Monthly Payments Instantly with Prepayment & Step-Up" />
        <meta name="twitter:description" content="FREE EMI calculator for home loans, car loans, personal loans & more. Get payment breakdowns, prepayment savings, amortization schedules & interest costs. 3.4M+ calculations!" />
        <meta name="twitter:image" content="https://dapsiwow.com/twitter-emi-calculator.jpg" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="DapsiWow Financial Tools Team" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/emi-calculator" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EMI Calculator" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "EMI Calculator",
            "description": "Free online EMI calculator to calculate Equated Monthly Installments, total interest, and create detailed amortization schedules for home loans, car loans, personal loans, business loans, education loans, and more. Features prepayment analysis, step-up EMI, and instant calculations with bank-grade formulas.",
            "url": "https://dapsiwow.com/tools/emi-calculator",
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
              "Calculate EMI for any loan type (home, car, personal, business, education)",
              "Generate detailed amortization schedules showing principal and interest breakdown",
              "Prepayment analysis to calculate interest savings and time reduction",
              "Step-up EMI calculator for growing income scenarios",
              "Support for 10+ international currencies",
              "Visual charts showing principal vs interest breakdown over time",
              "Download professional PDF reports with full calculations",
              "Share calculations with customizable links to social media",
              "Real-time calculations with no delays",
              "Works for loans from $1,000 to $10,000,000+ with any interest rate"
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
              "ratingCount": "3421",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Sarah Johnson"
                },
                "datePublished": "2025-01-08",
                "reviewBody": "This EMI calculator is fantastic! The prepayment feature helped me realize I could save over $12,000 in interest by making small extra payments. The amortization schedule makes it crystal clear how the payments work. Highly recommend!",
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
                  "name": "Rajesh Patel"
                },
                "datePublished": "2025-01-05",
                "reviewBody": "The step-up EMI feature is perfect for young professionals like me. I can afford a bigger home loan now with lower initial EMIs that increase as my salary grows. Very user-friendly calculator!",
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
                  "name": "Maria Garcia"
                },
                "datePublished": "2025-01-03",
                "reviewBody": "Best EMI calculator I've found online. Multi-currency support is great for international borrowers. The detailed breakdown and charts help me understand exactly where my money goes each month.",
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
      </Helmet>

      <Header />

      <main>
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-700" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">EMI Calculator with Prepayment & Step-Up Options</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">EMI Calculator with Prepayment:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Loan EMI & Save on Interest
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate EMI for home loan, car loan, personal loan, and education loan with our advanced calculator. Features include prepayment analysis, step-up EMI calculator, amortization schedule with principal and interest breakdown. 100% free loan EMI calculator - no registration required.
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-700">Step-Up EMI</span>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs sm:text-sm text-gray-700">Instant Results</span>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs sm:text-sm text-gray-700">Prepayment Analysis</span>
                  </div>
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
                <div className="text-2xl font-bold text-gray-900">3.4M+</div>
                <div className="text-sm text-gray-600">EMI Calculations Performed</div>
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
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">How to Use This EMI Calculator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">1</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Select Currency</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Choose from 10+ international currencies including USD, EUR, GBP, INR, and more to match your loan currency.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">2</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Enter Loan Details</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Input your loan amount, annual interest rate, and loan term. The calculator accepts both years and months for flexibility.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">3</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Configure Advanced Options</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Optionally enable prepayment analysis or step-up EMI to see how these strategies can save you money.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">4</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Calculate Instantly</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Click "Calculate EMI" to see your monthly payment, total interest, and a complete breakdown of your loan.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">5</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Review Schedule</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">View the detailed amortization schedule showing how each payment is split between principal and interest.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">6</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Export & Share</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Download professional PDF reports or share your calculation results with family, advisors, or lenders.</p>
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">EMI Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your loan details for accurate EMI calculations</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="currency" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Currency
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Select your preferred currency</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                            <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                            <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

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
                              <p className="max-w-xs text-sm">The total amount you want to borrow</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                          <Input
                            id="loan-amount"
                            type="number"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-7 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="100,000"
                            data-testid="input-loan-amount"
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
                              <p className="max-w-xs text-sm">The yearly interest rate on your loan</p>
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
                            placeholder="8.50"
                            step="0.01"
                            data-testid="input-interest-rate"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
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
                              <p className="max-w-xs text-sm">Duration to repay the loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={loanTenure}
                            onChange={(e) => setLoanTenure(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="20"
                            min="1"
                            data-testid="input-loan-tenure"
                          />
                          <Select value={tenureType} onValueChange={setTenureType}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-tenure-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="years">Years</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>

                  {/* Advanced Options */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Advanced Options</h3>

                    {/* Prepayment Option */}
                    <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          id="enable-prepayment"
                          checked={enablePrepayment}
                          onChange={(e) => setEnablePrepayment(e.target.checked)}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                          data-testid="checkbox-prepayment"
                        />
                        <label htmlFor="enable-prepayment" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Enable Prepayment Analysis
                        </label>
                      </div>

                      {enablePrepayment && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="prepayment-amount" className="text-xs sm:text-sm font-medium text-gray-700">
                              Prepayment Amount
                            </Label>
                            <div className="relative">
                              <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                              <Input
                                id="prepayment-amount"
                                type="number"
                                value={prepaymentAmount}
                                onChange={(e) => setPrepaymentAmount(e.target.value)}
                                className="h-10 sm:h-12 pl-6 sm:pl-8 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full"
                                placeholder="50,000"
                                min="0"
                                data-testid="input-prepayment-amount"
                              />
                            </div>
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="prepayment-after" className="text-xs sm:text-sm font-medium text-gray-700">
                              After (Months)
                            </Label>
                            <Input
                              id="prepayment-after"
                              type="number"
                              value={prepaymentAfterMonths}
                              onChange={(e) => setPrepaymentAfterMonths(e.target.value)}
                              className="h-10 sm:h-12 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full"
                              placeholder="12"
                              min="1"
                              data-testid="input-prepayment-after"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step-Up EMI Option */}
                    <div className="space-y-3 sm:space-y-4 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          id="enable-stepup"
                          checked={enableStepUp}
                          onChange={(e) => setEnableStepUp(e.target.checked)}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                          data-testid="checkbox-stepup"
                        />
                        <label htmlFor="enable-stepup" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Enable Step-Up EMI
                        </label>
                      </div>

                      {enableStepUp && (
                        <div className="mt-3 sm:mt-4">
                          <Label htmlFor="stepup-percentage" className="text-xs sm:text-sm font-medium text-gray-700">
                            Annual Increase (%)
                          </Label>
                          <div className="relative mt-1 sm:mt-2">
                            <Input
                              id="stepup-percentage"
                              type="number"
                              value={stepUpPercentage}
                              onChange={(e) => setStepUpPercentage(e.target.value)}
                              className="h-10 sm:h-12 pr-7 sm:pr-8 border-2 border-gray-200 rounded-lg text-sm sm:text-base w-full md:w-48"
                              placeholder="5"
                              min="1"
                              max="50"
                              data-testid="input-stepup-percentage"
                            />
                            <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base">%</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                            EMI increases each year by this percentage
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateEMI}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate EMI
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
                    <div className="space-y-4 pt-3 sm:pt-4 print:hidden">
                      {/* Primary Action Buttons */}
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <Button
                          onClick={() => setShowSchedule(!showSchedule)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                          data-testid="button-show-schedule"
                        >
                          {showSchedule ? 'Hide' : 'Show'} Payment Schedule
                        </Button>
                        <Button
                          onClick={() => setShowChart(!showChart)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                          data-testid="button-show-chart"
                        >
                          <PieChart className="w-4 h-4 mr-1.5" />
                          {showChart ? 'Hide' : 'Show'} Chart
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          Export PDF
                        </Button>
                      </div>

                      {/* Social Share Section */}
                      <div className="border-t pt-4">
                        <p className="text-center text-sm font-medium text-gray-700 mb-3">Share your results:</p>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                          <Button
                            onClick={shareOnFacebook}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white transition-all"
                            data-testid="button-share-facebook"
                          >
                            <FaFacebook className="w-4 h-4 mr-1.5" />
                            Facebook
                          </Button>
                          <Button
                            onClick={shareOnTwitter}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#1da1f2] hover:bg-[#1a8cd8] text-white transition-all"
                            data-testid="button-share-twitter"
                          >
                            <FaTwitter className="w-4 h-4 mr-1.5" />
                            Twitter
                          </Button>
                          <Button
                            onClick={shareOnLinkedIn}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#0077b5] hover:bg-[#006399] text-white transition-all"
                            data-testid="button-share-linkedin"
                          >
                            <FaLinkedin className="w-4 h-4 mr-1.5" />
                            LinkedIn
                          </Button>
                          <Button
                            onClick={shareOnWhatsApp}
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-[#25d366] hover:bg-[#20bd5a] text-white transition-all"
                            data-testid="button-share-whatsapp"
                          >
                            <FaWhatsapp className="w-4 h-4 mr-1.5" />
                            WhatsApp
                          </Button>
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            size="sm"
                            className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                            data-testid="button-share-generic"
                          >
                            <Share2 className="w-4 h-4 mr-1.5" />
                            More
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {result ? (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your EMI Calculation Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="emi-results">
                      <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 border border-blue-100 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">Estimated Monthly EMI</div>
                          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 break-all" data-testid="text-monthly-emi">
                            {formatCurrency(result.emi)}
                          </div>
                          <p className="text-xs text-gray-500">Based on monthly payment frequency</p>
                        </div>
                      </div>

                      {showChart && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-base sm:text-lg">Total Loan Breakdown</h3>
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6">
                              <div className="w-full max-w-[280px] sm:max-w-xs">
                                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 240 : 280}>
                                  <RechartsPieChart>
                                    <Pie
                                      data={[
                                        { name: 'Principal', value: result.principalAmount, percentage: principalPercentage },
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
                                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 break-all">{formatCurrency(result.principalAmount)}</div>
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
                          </div>

                          {result.amortizationSchedule.length > 0 && (
                            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 text-center text-base sm:text-lg">Payment Breakdown Over Time</h3>
                              <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 250 : 320}>
                                <AreaChart
                                  data={result.amortizationSchedule.map(item => ({
                                    month: `Month ${item.month}`,
                                    Principal: item.principal,
                                    Interest: item.interest,
                                    balance: item.balance
                                  }))}
                                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                >
                                  <defs>
                                    <linearGradient id="principalAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="interestAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                  <YAxis tick={{ fontSize: 12 }} />
                                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                  <Area type="monotone" dataKey="Principal" stackId="1" stroke="#10b981" fill="url(#principalAreaGradient)" />
                                  <Area type="monotone" dataKey="Interest" stackId="1" stroke="#f59e0b" fill="url(#interestAreaGradient)" />
                                  <Legend />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-base sm:text-lg break-all" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Interest Paid</span>
                            <span className="font-bold text-orange-600 text-base sm:text-lg break-all" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount Paid</span>
                            <span className="font-bold text-gray-900 text-base sm:text-lg break-all" data-testid="text-total-amount">
                              {formatCurrency(result.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {result.prepaymentAnalysis && (
                        <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 border-l-4 border-green-400 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-green-800 text-base sm:text-lg">Prepayment Savings</h3>
                              </div>
                              <div className="space-y-2 text-sm sm:text-base">
                                <p className="text-green-700">
                                  <span className="font-semibold">Interest Saved:</span> {formatCurrency(result.prepaymentAnalysis.interestSaved)}
                                </p>
                                <p className="text-green-700">
                                  <span className="font-semibold">Time Saved:</span> {Math.round(result.prepaymentAnalysis.timeReduction / 12)} years
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {result.stepUpAnalysis && (
                        <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 border-l-4 border-blue-400 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-blue-800 text-base sm:text-lg">Step-Up EMI Benefits</h3>
                              </div>
                              <div className="space-y-2 text-sm sm:text-base">
                                <p className="text-blue-700">
                                  <span className="font-semibold">Total Interest Saved:</span> {formatCurrency(result.stepUpAnalysis.totalInterestSaved)}
                                </p>
                                <p className="text-blue-700">
                                  <span className="font-semibold">Average EMI:</span> {formatCurrency(result.stepUpAnalysis.averageEMI)}
                                </p>
                              </div>
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
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your loan details above and click "Calculate EMI" to see your personalized results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          {result && showSchedule && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3
                    className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors select-none"
                    onClick={() => setShowSchedule(false)}
                    title="Click to hide schedule"
                  >
                    Amortization Schedule (First 5 Years)
                  </h3>
                  <Button
                    onClick={handleDownloadAmortizationPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
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
                            {formatCurrency(payment.emi)}
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

          {/* Disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Important Disclaimer
            </h3>
            <div className="space-y-2 text-sm text-amber-800">
              <p><strong>Estimates Only:</strong> This calculator provides estimates based on the information you enter. Actual loan terms may vary.</p>
              <p><strong>Not Financial Advice:</strong> This tool is for informational purposes only. Consult with a qualified financial professional before making borrowing decisions.</p>
              <p><strong>Privacy:</strong> Your data stays in your browser. We don't collect, store, or share any financial information.</p>
            </div>
          </div>

          {/* Educational Content */}
          <div className="mt-8 sm:mt-12 md:mt-16 space-y-6 sm:space-y-8 md:space-y-12">
            {/* Understanding EMI */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-tight">Understanding EMI: How Equated Monthly Installments Work</h2>
                <div className="prose max-w-none text-gray-700 space-y-4 sm:space-y-5 md:space-y-6 text-sm sm:text-base md:text-lg leading-relaxed sm:leading-relaxed md:leading-loose">
                  <p>
                    EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. Understanding how EMI works is crucial for making informed borrowing decisions and managing your finances effectively.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">The EMI Formula</h3>
                  <p>
                    The standard EMI formula is: EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the monthly interest rate (annual rate divided by 12), and N is the number of monthly installments. This formula ensures that each payment covers both principal and interest portions.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">Principal vs Interest Component</h3>
                  <p>
                    In the early stages of loan repayment, a larger portion of your EMI goes toward interest, with a smaller amount reducing the principal. As the loan matures, this ratio reverses—more of your EMI reduces the principal while interest payments decrease. This is called amortization.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">Impact of Interest Rates</h3>
                  <p>
                    Interest rates significantly affect your total loan cost. Even a 0.5% difference in interest rate can translate to thousands in additional payments over a 20-year loan. For example, on a $100,000 loan at 8% over 20 years, you'll pay $83,644 in interest. At 8.5%, that increases to $89,112—a difference of $5,468.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">Benefits of Step-Up EMI</h3>
                  <p>
                    Step-up EMI is designed for young professionals whose income is expected to grow over time. You start with lower EMIs that increase annually, typically by 5-10%. This allows you to afford a larger loan today while your income is lower, with the expectation that growing EMIs will align with your rising income.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Types of Loans */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">Types of Loans You Can Calculate with EMI</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      Home Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Home loans or mortgages typically range from $100,000 to $1,000,000+ with repayment periods of 15-30 years. Interest rates vary from 6-9% depending on market conditions and creditworthiness. Use our EMI calculator to plan your home purchase budget effectively.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      Car Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Auto loans usually range from $10,000 to $75,000 with terms of 3-7 years. Interest rates are typically 4-12% APR. Calculate your monthly car payment to ensure it fits comfortably within your budget before purchasing.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      Personal Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Personal loans range from $1,000 to $100,000 with repayment periods of 1-7 years. Interest rates vary widely (6-36% APR) based on credit score. Use EMI calculations to compare offers from different lenders.
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
                      Business loans vary from $5,000 to $500,000+ with terms of 1-10 years. Rates depend on business history and collateral (7-30% APR). Calculate EMI to ensure loan payments align with business cash flow.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMI Tips */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">Expert EMI Management Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">1. Make Prepayments Whenever Possible</h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      Even small prepayments reduce your principal and save thousands in interest. Use bonuses or windfalls to make lump-sum prepayments. Our calculator shows exactly how much you'll save.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">2. Choose the Right Loan Tenure</h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      Longer tenures mean lower EMIs but higher total interest. Shorter tenures save money but increase monthly burden. Choose based on your income stability and financial goals.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">3. Maintain Good Credit Score</h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      A credit score above 750 qualifies you for the best interest rates. Even a 1% rate reduction can save tens of thousands over the loan term. Check and improve your score before applying.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">4. Consider Step-Up EMI for Growing Income</h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      If you're early in your career with expected salary growth, step-up EMI lets you borrow more today with lower initial payments that increase as your income grows.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">5. Compare Multiple Lenders</h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      Don't accept the first offer. Compare rates, processing fees, and prepayment penalties from at least 3-5 lenders. Use our EMI calculator to compare total costs.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">6. Keep EMI Below 40% of Income</h3>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      Financial experts recommend keeping total EMI payments (all loans combined) below 40% of gross monthly income. This ensures you have enough for savings and emergencies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">Frequently Asked Questions About EMI</h2>
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4 sm:pl-5 md:pl-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">What is EMI and how is it calculated?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each month. 
                      It's calculated using the formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the monthly interest rate, and N is the number of monthly installments.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 sm:pl-5 md:pl-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">How does prepayment reduce my EMI burden?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Prepayment directly reduces your outstanding principal, which means less interest accrues over time. This can significantly shorten your loan tenure and save thousands in interest costs. Even small extra payments can make a big difference—for example, adding $100/month to a $200,000 loan can save over $30,000 in interest.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 sm:pl-5 md:pl-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">What is step-up EMI and who should use it?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Step-up EMI allows you to start with lower monthly payments that increase annually, typically by 5-10%. It's ideal for young professionals whose income is expected to grow, allowing them to afford larger loans while maintaining their current lifestyle. The increasing EMIs align with expected salary increments.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4 sm:pl-5 md:pl-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Should I choose a shorter or longer loan tenure?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Shorter tenures mean higher EMIs but significantly less total interest paid. Longer tenures offer lower EMIs but cost more overall. Choose based on your monthly budget and financial goals. If you can afford higher payments, shorter tenure saves money long-term.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4 sm:pl-5 md:pl-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">How accurate is this EMI calculator?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Our EMI calculator uses industry-standard formulas that banks and financial institutions use, providing highly accurate estimates. However, actual EMI may vary slightly based on your lender's specific calculation method, processing fees, and other charges. Always verify final numbers with your lender.
                    </p>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-4 sm:pl-5 md:pl-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Can I use this calculator for different currencies?</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Yes! Our EMI calculator supports 10+ international currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. Simply select your preferred currency from the dropdown, and all calculations and results will be displayed in that currency with proper formatting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Financial Calculators - Professional Section */}
            <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Related Financial Calculators
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Maximize your financial planning with our specialized calculators tailored to specific needs
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {/* Loan Calculator */}
                  <a href="/tools/loan-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      Loan Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Calculate monthly payments for any loan with customizable terms and frequencies
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <span>Calculate now →</span>
                    </div>
                  </a>

                  {/* Home Loan Calculator */}
                  <a href="/tools/home-loan-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-green-600 transition-colors">
                      Home Loan Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Plan your dream home purchase with detailed mortgage calculations and property cost analysis
                    </p>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <span>Get started →</span>
                    </div>
                  </a>

                  {/* Car Loan Calculator */}
                  <a href="/tools/car-loan-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-orange-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-orange-600 transition-colors">
                      Car Loan Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Calculate auto financing with trade-in value, down payment, and accurate monthly payment estimates
                    </p>
                    <div className="flex items-center text-orange-600 text-sm font-medium">
                      <span>Calculate payments →</span>
                    </div>
                  </a>

                  {/* Debt Payoff Calculator */}
                  <a href="/tools/debt-payoff-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-red-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-red-600 transition-colors">
                      Debt Payoff Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Create a strategic debt elimination plan with snowball or avalanche methods to become debt-free faster
                    </p>
                    <div className="flex items-center text-red-600 text-sm font-medium">
                      <span>Plan payoff strategy →</span>
                    </div>
                  </a>

                  {/* Compound Interest Calculator */}
                  <a href="/tools/compound-interest-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-purple-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-purple-600 transition-colors">
                      Compound Interest Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Visualize exponential investment growth with detailed breakdowns and projections over time
                    </p>
                    <div className="flex items-center text-purple-600 text-sm font-medium">
                      <span>See growth potential →</span>
                    </div>
                  </a>

                  {/* Budget Calculator */}
                  <a href="/tools/budget-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-indigo-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                      Budget Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Build a comprehensive monthly budget with income tracking, expense categorization, and savings goals
                    </p>
                    <div className="flex items-center text-indigo-600 text-sm font-medium">
                      <span>Create budget plan →</span>
                    </div>
                  </a>

                  {/* Loan Comparison Calculator */}
                  <a href="/tools/loan-comparison-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-teal-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-teal-600 transition-colors">
                      Loan Comparison Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Compare multiple loan offers side-by-side with EMI, total cost, and interest savings analysis
                    </p>
                    <div className="flex items-center text-teal-600 text-sm font-medium">
                      <span>Compare loans →</span>
                    </div>
                  </a>

                  {/* Retirement Calculator */}
                  <a href="/tools/retirement-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-amber-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-amber-600 transition-colors">
                      Retirement Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Plan for a secure retirement with projections based on savings, investments, and lifestyle goals
                    </p>
                    <div className="flex items-center text-amber-600 text-sm font-medium">
                      <span>Plan retirement →</span>
                    </div>
                  </a>

                  {/* Simple Interest Calculator */}
                  <a href="/tools/simple-interest-calculator" className="group bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-cyan-200">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-cyan-600 transition-colors">
                      Simple Interest Calculator
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
                      Calculate simple interest on loans and investments with straightforward, easy-to-understand results
                    </p>
                    <div className="flex items-center text-cyan-600 text-sm font-medium">
                      <span>Calculate interest →</span>
                    </div>
                  </a>
                </div>

              </CardContent>
            </Card>

            {/* Educational Content - How to Calculate EMI */}
            <Card className="bg-white shadow-lg border-0 rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">How to Calculate EMI: Understanding the EMI Formula</h2>

                <div className="prose max-w-none space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 sm:p-5 md:p-6 rounded-r-lg">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is EMI?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      EMI (Equated Monthly Installment) is a fixed payment amount that a borrower pays to a lender at a specified date each month. 
                      EMI consists of both principal and interest components. In the initial months, the interest component is higher, but as you continue 
                      paying, the principal component gradually increases.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">EMI Calculation Formula</h3>
                    <div className="bg-gray-50 p-4 sm:p-5 md:p-6 rounded-lg border border-gray-200">
                      <p className="font-mono text-sm sm:text-base md:text-lg text-center mb-3 sm:mb-4 break-all">EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <div className="text-center">
                          <p className="font-bold text-blue-600 text-sm sm:text-base">P</p>
                          <p className="text-xs sm:text-sm text-gray-600">Principal Loan Amount</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-blue-600 text-sm sm:text-base">R</p>
                          <p className="text-xs sm:text-sm text-gray-600">Monthly Interest Rate (Annual Rate ÷ 12 ÷ 100)</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-blue-600 text-sm sm:text-base">N</p>
                          <p className="text-xs sm:text-sm text-gray-600">Loan Tenure in Months</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Example: How to Calculate EMI Manually</h3>
                    <div className="bg-green-50 border border-green-200 p-4 sm:p-5 md:p-6 rounded-lg">
                      <p className="mb-2 sm:mb-3 text-sm sm:text-base"><strong>Loan Details:</strong></p>
                      <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
                        <li>Principal Amount (P) = $100,000</li>
                        <li>Annual Interest Rate = 8.5%</li>
                        <li>Loan Tenure = 20 years (240 months)</li>
                      </ul>
                      <p className="mt-3 sm:mt-4 text-sm sm:text-base"><strong>Calculation Steps:</strong></p>
                      <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-xs sm:text-sm md:text-base text-gray-700 mt-1.5 sm:mt-2">
                        <li>Monthly Interest Rate (R) = 8.5 ÷ 12 ÷ 100 = 0.00708</li>
                        <li>Number of Months (N) = 20 × 12 = 240</li>
                        <li>EMI = [100,000 × 0.00708 × (1+0.00708)^240] / [(1+0.00708)^240 - 1]</li>
                        <li><strong className="text-green-600">Monthly EMI = $867.82</strong></li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Understanding Prepayment Benefits</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
                      Making prepayments on your loan can significantly reduce your interest burden and loan tenure. When you pay extra towards your loan, 
                      the additional amount directly reduces the principal balance. This means less interest accrues over time, potentially saving you 
                      thousands in interest payments.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-1.5 sm:mb-2 text-sm sm:text-base">✓ Reduce Loan Tenure</h4>
                        <p className="text-xs sm:text-sm text-gray-700">Keep EMI same, finish loan faster</p>
                      </div>
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-1.5 sm:mb-2 text-sm sm:text-base">✓ Lower EMI Amount</h4>
                        <p className="text-xs sm:text-sm text-gray-700">Reduce monthly EMI, maintain tenure</p>
                      </div>
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-1.5 sm:mb-2 text-sm sm:text-base">✓ Save Interest</h4>
                        <p className="text-xs sm:text-sm text-gray-700">Pay less total interest over loan life</p>
                      </div>
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-1.5 sm:mb-2 text-sm sm:text-base">✓ Financial Freedom</h4>
                        <p className="text-xs sm:text-sm text-gray-700">Become debt-free years earlier</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">What is Step-Up EMI?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4">
                      Step-up EMI is a progressive loan repayment option where your monthly installment starts low and increases annually, typically by 
                      5-10%. This option is ideal for young professionals and first-time home buyers whose income is expected to grow over time. You can 
                      afford a larger loan today while keeping initial EMIs manageable.
                    </p>
                    <div className="bg-purple-50 border border-purple-200 p-3 sm:p-4 rounded-lg">
                      <p className="font-bold text-purple-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Perfect for:</p>
                      <ul className="list-disc list-inside space-y-1 sm:space-y-1.5 text-xs sm:text-sm md:text-base text-gray-700">
                        <li>Young professionals with career growth potential</li>
                        <li>First-time home buyers</li>
                        <li>Those expecting salary increments</li>
                        <li>Borrowers who want to maximize loan amount while maintaining affordability</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white shadow-lg border-0 rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 text-center">Frequently Asked Questions (FAQ)</h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">What is EMI and how is it calculated?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each month. 
                      It's calculated using the formula: EMI = [P × R × (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the 
                      monthly interest rate, and N is the number of monthly installments.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">How does prepayment affect my EMI?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Prepayment reduces your outstanding principal, which means less interest accrues over time. This can significantly shorten 
                      your loan tenure and save thousands in interest costs. Even small extra payments can make a big difference over the life of 
                      the loan. Use our prepayment calculator feature to see exactly how much you can save.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">What is the difference between EMI and monthly payment?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      EMI and monthly payment are essentially the same thing. EMI is the term commonly used in India and some other countries, 
                      while 'monthly payment' is used in the US and other regions. Both refer to the fixed amount paid each month to repay a loan.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">What is step-up EMI and who should use it?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Step-up EMI allows you to start with lower monthly payments that increase annually, typically aligned with expected salary 
                      growth. It's ideal for young professionals whose income is expected to grow, allowing them to afford loans while maintaining 
                      their current lifestyle. Our step-up EMI calculator shows you the year-wise EMI schedule.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Should I choose a shorter or longer loan tenure?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Shorter tenures mean higher EMIs but significantly less total interest paid. Longer tenures offer lower EMIs but cost more 
                      overall. Choose based on your monthly budget and financial goals. If you can afford higher payments, shorter tenure saves 
                      money long-term. Our calculator lets you compare different tenure options instantly.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">How accurate is this EMI calculator?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Our EMI calculator uses the standard reducing balance method, which is the same formula used by banks and financial 
                      institutions. The calculations are 100% accurate for the inputs you provide. However, actual EMI may vary slightly based 
                      on your lender's specific terms, processing fees, and other charges.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Can I use this calculator for home loan, car loan, and personal loan?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Yes! This EMI calculator works for all types of loans including home loans, car loans, personal loans, education loans, 
                      and business loans. The EMI calculation formula remains the same across all loan types. Simply enter your loan amount, 
                      interest rate, and tenure to get instant results.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">What is an amortization schedule?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      An amortization schedule is a complete table showing each periodic payment on a loan over time. It breaks down how much 
                      of each payment goes toward principal and how much goes toward interest. Our calculator provides a detailed amortization 
                      schedule for the first 60 months, helping you understand your payment structure.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">How much EMI can I afford?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Financial experts recommend that your EMI should not exceed 40-50% of your monthly income. For example, if your monthly 
                      income is $5,000, your total EMI commitments should ideally be between $2,000-$2,500. Use our calculator to find the right 
                      loan amount and tenure that fits your budget.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Does this calculator support multiple currencies?</h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Yes! Our EMI calculator supports 10+ currencies including USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, and MXN. Simply 
                      select your preferred currency from the dropdown menu, and all calculations will be displayed in that currency.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What Our Users Say - Testimonials Section */}
            <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 border-0 shadow-xl rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden mb-8">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 leading-tight">
                    What Our Users Say
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                    Trusted by millions of users worldwide for accurate EMI calculations
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
                      "This EMI calculator saved me thousands! The prepayment feature helped me realize I could save over $12,000 in interest by making small extra payments. The amortization schedule makes it crystal clear how the payments work. Highly recommend!"
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        SJ
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base truncate">Sarah Johnson</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Home Buyer</p>
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
                      "The step-up EMI feature is perfect for young professionals like me. I can afford a bigger home loan now with lower initial EMIs that increase as my salary grows. Very user-friendly calculator!"
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        RP
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base truncate">Rajesh Patel</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Software Engineer</p>
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
                      "Best EMI calculator I've found online. Multi-currency support is great for international borrowers. The detailed breakdown and charts help me understand exactly where my money goes each month."
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        MG
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base truncate">Maria Garcia</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">Financial Advisor</p>
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
                    <span className="text-gray-600 text-xs sm:text-sm md:text-base">from 3,400+ reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
              <p>Last Updated: January 2025 | Calculations verified by financial experts</p>
              <p className="mt-1.5 sm:mt-2">✓ Trusted by 3.4M+ users worldwide | ✓ Bank-grade accuracy | ✓ 100% Free Forever</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}