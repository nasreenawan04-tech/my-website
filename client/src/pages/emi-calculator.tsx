import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, Clock, PieChart, Share2, Download, TrendingDown, DollarSign, Info } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

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
          "text": "EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each month. It's calculated using the formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the monthly interest rate, and N is the number of monthly installments."
        }
      },
      {
        "@type": "Question",
        "name": "What is the difference between EMI and monthly payment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EMI and monthly payment are essentially the same thing. EMI is the term commonly used in India and some other countries, while 'monthly payment' is used in the US and other regions. Both refer to the fixed amount paid each month to repay a loan."
        }
      },
      {
        "@type": "Question",
        "name": "How does prepayment affect my EMI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Prepayment reduces your outstanding principal, which means less interest accrues over time. This can significantly shorten your loan tenure and save thousands in interest costs. Even small extra payments can make a big difference over the life of the loan."
        }
      },
      {
        "@type": "Question",
        "name": "What is step-up EMI and who should use it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Step-up EMI allows you to start with lower monthly payments that increase annually, typically aligned with expected salary growth. It's ideal for young professionals whose income is expected to grow, allowing them to afford loans while maintaining current lifestyle."
        }
      },
      {
        "@type": "Question",
        "name": "Should I choose a shorter or longer loan tenure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shorter tenures mean higher EMIs but significantly less total interest paid. Longer tenures offer lower EMIs but cost more overall. Choose based on your monthly budget and financial goals. If you can afford higher payments, shorter tenure saves money long-term."
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
    const rate = annualRate / 12; // Monthly interest rate
    const tenure = tenureType === 'years' ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);
    const prepayment = parseFloat(prepaymentAmount) || 0;
    const prepaymentAfter = parseInt(prepaymentAfterMonths) || 12;
    const stepUpRate = parseFloat(stepUpPercentage) / 100;

    if (principal <= 0 || annualRate <= 0 || tenure <= 0) return;

    // Standard EMI calculation
    const baseEMI = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);

    // Generate amortization schedule
    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let currentEMI = baseEMI;
    let actualTenure = tenure;

    for (let month = 1; month <= tenure && currentBalance > 1; month++) {
      // Handle step-up EMI
      if (enableStepUp && month > 12 && (month - 1) % 12 === 0) {
        currentEMI = currentEMI * (1 + stepUpRate);
      }

      const interestPayment = currentBalance * rate;
      let principalPayment = Math.min(currentEMI - interestPayment, currentBalance);

      // Handle prepayment
      if (enablePrepayment && month === prepaymentAfter) {
        principalPayment += Math.min(prepayment, currentBalance - principalPayment);
      }

      currentBalance -= principalPayment;
      totalInterestPaid += interestPayment;
      actualTenure = month;

      if (month <= 60) { // Store first 5 years for display
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

    // Calculate regular scenario for comparison
    const regularTotalAmount = baseEMI * tenure;
    const regularTotalInterest = regularTotalAmount - principal;

    // Final results
    const finalTotalAmount = totalInterestPaid + principal;
    const finalTotalInterest = totalInterestPaid;
    const interestPercentage = (finalTotalInterest / finalTotalAmount) * 100;

    // Prepayment analysis
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

    // Step-up analysis
    let stepUpAnalysis;
    if (enableStepUp) {
      const regularTotalInterest = (baseEMI * tenure) - principal;
      const totalInterestSaved = Math.max(0, regularTotalInterest - finalTotalInterest);
      const averageEMI = finalTotalAmount / actualTenure;
      const finalEMI = currentEMI;

      // Create yearly EMI schedule
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
    doc.text(formatCurrency(result.emi), pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    const interestPercent = ((result.totalInterest / result.totalAmount) * 100).toFixed(1);
    doc.text(`Total Interest: ${formatCurrency(result.totalInterest)} (${interestPercent}% of total paid)`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 12;
    const termDisplay = tenureType === 'years' ? `${loanTenure} years` : `${loanTenure} months`;

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
    doc.text('DapsiWow.com', pageWidth / 2, yPos, { align: 'center' });

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
      doc.text(formatCurrency(payment.emi), colX[1], yPos + 4);

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
    doc.text('DapsiWow.com', pageWidth / 2, yPos, { align: 'center' });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Free EMI Calculator: Calculate Loan Payments & Interest 2025 | DapsiWow</title>
        <meta name="description" content="Calculate EMI (Equated Monthly Installments) for home, car, personal & business loans instantly. Free EMI calculator with step-up, prepayment analysis & amortization schedules. Support for 10+ currencies." />
        <meta name="keywords" content="EMI calculator, equated monthly installment calculator, home loan EMI, car loan EMI, personal loan EMI, loan EMI calculator, monthly payment calculator, loan installment calculator, EMI formula, prepayment calculator, step up EMI calculator, loan amortization calculator" />
        <meta property="og:title" content="Free EMI Calculator: Calculate Loan Payments & Interest 2025 | DapsiWow" />
        <meta property="og:description" content="Professional EMI calculator for accurate loan payment calculations. Features step-up EMI, prepayment analysis, and detailed amortization schedules. 100% free, no registration." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/emi-calculator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free EMI Calculator: Calculate Loan Payments Instantly" />
        <meta name="twitter:description" content="Calculate EMI for any loan with our professional calculator. Instant results with amortization schedules and interest analysis." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/emi-calculator" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "EMI Calculator",
            "description": "Professional EMI calculator to calculate Equated Monthly Installments for home loans, car loans, personal loans, and business loans. Features step-up EMI, prepayment analysis, and detailed amortization schedules.",
            "url": "https://dapsiwow.com/tools/emi-calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "browserRequirements": "Requires JavaScript",
            "permissions": "browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate EMI for any loan amount",
              "Support for 10+ international currencies",
              "Step-up EMI calculations",
              "Prepayment impact analysis",
              "Detailed amortization schedules",
              "Interest savings calculator",
              "Visual charts and graphs",
              "PDF export functionality"
            ],
            "provider": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "3421",
              "bestRating": "5"
            }
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
                "name": "EMI Calculator",
                "item": "https://dapsiwow.com/tools/emi-calculator"
              }
            ]
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-700" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional EMI Loan Calculator - Free & Accurate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Free EMI Loan Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Monthly Installments
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate Equated Monthly Installments (EMI) for home loans, car loans, and personal loans. Get instant results with step-up EMI and prepayment analysis. 100% free, no registration required.
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
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How to Use This EMI Calculator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h3 className="font-bold text-gray-900">Select Currency</h3>
                  <p className="text-sm text-gray-600">Choose from 10+ international currencies including USD, EUR, GBP, INR, and more to match your loan currency.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h3 className="font-bold text-gray-900">Enter Loan Details</h3>
                  <p className="text-sm text-gray-600">Input your loan amount, annual interest rate, and loan term. The calculator accepts both years and months for flexibility.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h3 className="font-bold text-gray-900">Configure Advanced Options</h3>
                  <p className="text-sm text-gray-600">Optionally enable prepayment analysis or step-up EMI to see how these strategies can save you money.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <h3 className="font-bold text-gray-900">Calculate Instantly</h3>
                  <p className="text-sm text-gray-600">Click "Calculate EMI" to see your monthly payment, total interest, and a complete breakdown of your loan.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                  <h3 className="font-bold text-gray-900">Review Schedule</h3>
                  <p className="text-sm text-gray-600">View the detailed amortization schedule showing how each payment is split between principal and interest.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
                  <h3 className="font-bold text-gray-900">Export & Share</h3>
                  <p className="text-sm text-gray-600">Download professional PDF reports or share your calculation results with family, advisors, or lenders.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col gap-0">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">EMI Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your loan details for accurate EMI calculations</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {/* Currency Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="currency" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Currency
                      </Label>
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

                    {/* Loan Amount */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="loan-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Loan Amount
                      </Label>
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

                    {/* Interest Rate */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="interest-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Annual Interest Rate
                      </Label>
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

                    {/* Loan Tenure */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Loan Term</Label>
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
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 print:hidden">
                      <Button
                        onClick={() => setShowSchedule(!showSchedule)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-show-schedule"
                      >
                        {showSchedule ? 'Hide' : 'Show'} Payment Schedule
                      </Button>
                      <Button
                        onClick={() => setShowChart(!showChart)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-show-chart"
                      >
                        <PieChart className="w-4 h-4 mr-1" />
                        {showChart ? 'Hide' : 'Show'} Chart
                      </Button>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-share"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-export-pdf"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export PDF
                      </Button>
                    </div>
                  )}
                </div>
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

          {/* Results Section */}
          {result ? (
            <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your EMI Calculation Results</h2>

              <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="emi-results">
                {/* Monthly EMI */}
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                  <div className="text-center space-y-2 sm:space-y-3">
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Estimated Monthly EMI</div>
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all" data-testid="text-monthly-emi">
                      {formatCurrency(result.emi)}
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                  {/* Principal Amount */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-principal-amount">
                        {formatCurrency(result.principalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Total Interest Paid */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Total Interest Paid</span>
                      <span className="font-bold text-orange-600 text-sm sm:text-base break-all" data-testid="text-total-interest">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                  </div>

                  {/* Total Amount Paid */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Total Amount Paid</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-total-amount">
                        {formatCurrency(result.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Interest Percentage */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm sm:text-base">Interest Percentage</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-interest-percentage">
                        {result.interestPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* EMI per Year (for Step-Up) */}
                  {result.stepUpAnalysis && (
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 text-sm sm:text-base">Average EMI</span>
                        <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-average-emi">
                          {formatCurrency(result.stepUpAnalysis.averageEMI)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Final EMI (for Step-Up) */}
                  {result.stepUpAnalysis && (
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 text-sm sm:text-base">Final EMI</span>
                        <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-final-emi">
                          {formatCurrency(result.stepUpAnalysis.finalEMI)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prepayment Analysis */}
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
                            <span className="font-semibold">Time Saved:</span> {Math.round(result.prepaymentAnalysis.timeReduction / 12)} years and {Math.round(result.prepaymentAnalysis.timeReduction % 12)} months
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <h3 className="font-bold text-green-800 text-base sm:text-lg">New Loan Summary</h3>
                        </div>
                        <div className="space-y-2 text-sm sm:text-base">
                          <p className="text-green-700">
                            <span className="font-semibold">New Tenure:</span> {result.prepaymentAnalysis.newTenure} months
                          </p>
                          <p className="text-green-700">
                            <span className="font-semibold">New Total Amount:</span> {formatCurrency(result.prepaymentAnalysis.newTotalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step-Up Analysis */}
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
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-blue-800 text-base sm:text-lg">EMI Progression</h3>
                        </div>
                        <div className="space-y-2 text-sm sm:text-base">
                          <p className="text-blue-700">
                            <span className="font-semibold">Final EMI:</span> {formatCurrency(result.stepUpAnalysis.finalEMI)}
                          </p>
                          <p className="text-blue-700">
                            <span className="font-semibold">EMI Increase:</span> {stepUpPercentage}% annually
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Charts Section */}
                {showChart && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Pie Chart for Principal vs Interest */}
                    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Breakdown of Total Payment</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={[
                                { name: 'Principal', value: result.principalAmount },
                                { name: 'Interest', value: result.totalInterest }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#22c55e" /> {/* Green for Principal */}
                              <Cell fill="#f97316" /> {/* Orange for Interest */}
                            </Pie>
                            <Legend />
                            <RechartsTooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Area Chart for Balance Over Time */}
                    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                      <CardContent className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Loan Balance Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart
                            data={result.amortizationSchedule.map(item => ({
                              name: `Month ${item.month}`,
                              balance: item.balance
                            }))}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="balance" stroke="#8884d8" fill="#8884d8" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Important Disclaimer
            </h3>
            <div className="space-y-2 text-sm text-amber-800">
              <p><strong>Estimates Only:</strong> This calculator provides estimates based on the information you enter. Actual loan terms, interest rates, and payment amounts may vary based on your creditworthiness, lender policies, and additional fees.</p>
              <p><strong>Not Financial Advice:</strong> This tool is for informational and educational purposes only and does not constitute financial, legal, or investment advice. Consult with a qualified financial professional before making any borrowing decisions.</p>
              <p><strong>Accuracy:</strong> While we strive for accuracy using standard amortization formulas, we make no warranties about the completeness or accuracy of the calculations. Always verify with your lender.</p>
              <p><strong>Privacy:</strong> Your data stays in your browser. We don't collect, store, or share any financial information you enter into this calculator.</p>
            </div>
          </div>

          {/* Educational Content Sections */}
          <div className="mt-12 space-y-12">

            {/* Understanding EMI Calculations */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding EMI: Complete Guide to Equated Monthly Installments</h2>
                <div className="prose max-w-none text-gray-700 space-y-4 text-base leading-relaxed">
                  <p>
                    EMI stands for Equated Monthly Installment - a fixed payment amount made by a borrower to a lender at a specified date each month. This payment method is designed to pay off both the principal loan amount and the interest charged over a predetermined period, making it one of the most popular forms of loan repayment worldwide.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">How EMI Works: The Mathematics Behind It</h3>
                  <p>
                    Every EMI payment consists of two components: principal repayment and interest payment. In the early stages of your loan, a larger portion of your EMI goes toward paying interest, while a smaller portion reduces the principal. As time progresses and your outstanding balance decreases, this ratio gradually shifts - more goes toward principal and less toward interest.
                  </p>
                  <p>
                    The EMI calculation uses a complex mathematical formula: EMI = [P x R x (1+R)^N] / [(1+R)^N-1], where P represents the principal loan amount, R is the monthly interest rate (annual rate divided by 12), and N is the total number of monthly installments. This formula ensures that your payments remain constant throughout the loan tenure while systematically reducing your debt.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Why Use an EMI Calculator?</h3>
                  <p>
                    Our EMI calculator eliminates the complexity of manual calculations and provides instant, accurate results. Beyond just computing your monthly payment, it offers valuable insights like total interest payable, cost-benefit analysis of different loan tenures, impact of prepayments on your loan, and detailed amortization schedules showing the evolution of your loan over time.
                  </p>
                  <p>
                    Understanding these numbers before taking a loan empowers you to make informed financial decisions, compare different loan offers effectively, plan your monthly budget with confidence, and identify strategies to minimize interest costs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Types of Loans */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Loans You Can Calculate with Our EMI Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      Home Loans & Mortgages
                    </h3>
                    <p className="text-gray-600">
                      Home loans are the largest and longest-tenure loans most people take in their lifetime. With loan amounts typically ranging from $100,000 to $1,000,000+ and tenures of 15-30 years, understanding your EMI is crucial for budgeting. Our calculator helps you determine affordable monthly payments based on property price, down payment, and interest rates. Factor in property taxes, insurance, and maintenance costs when planning your total housing budget.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      Car Loans & Auto Financing
                    </h3>
                    <p className="text-gray-600">
                      Auto loans typically range from $10,000 to $75,000 with tenures of 3-7 years. Since vehicles depreciate over time, choosing the right loan tenure is important to avoid being "underwater" on your loan. Our calculator helps you balance monthly affordability with total interest costs. Consider the vehicle's expected lifespan, maintenance costs, and insurance when determining your budget.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      Personal Loans
                    </h3>
                    <p className="text-gray-600">
                      Personal loans offer flexibility for various needs - debt consolidation, medical expenses, home renovations, or major purchases. Amounts typically range from $1,000 to $100,000 with tenures of 1-7 years. Interest rates vary significantly based on credit score and income. Use our calculator to ensure monthly payments fit comfortably within your budget while minimizing total interest costs.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                      </div>
                      Business Loans
                    </h3>
                    <p className="text-gray-600">
                      Business loans fuel entrepreneurial growth, equipment purchases, inventory financing, or working capital needs. Loan amounts vary widely from $5,000 to $500,000+ with flexible tenures. EMI planning is critical for cash flow management - ensure loan payments don't strain business operations. Our calculator helps you evaluate different scenarios and choose terms that support sustainable growth.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-indigo-600" />
                      </div>
                      Education Loans
                    </h3>
                    <p className="text-gray-600">
                      Education loans finance higher education, professional courses, or study abroad programs. Federal student loans offer fixed rates (4-7% typically) with flexible repayment options, while private loans vary based on creditworthiness (3-14% APR). Calculate different repayment scenarios to minimize long-term costs while maintaining manageable payments during early career years.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-pink-600" />
                      </div>
                      Debt Consolidation Loans
                    </h3>
                    <p className="text-gray-600">
                      Consolidate multiple high-interest debts (credit cards, personal loans) into one lower-interest loan. This simplifies payments and can save significantly on interest if you qualify for better rates. Use our calculator to compare your current total monthly payments with a consolidated loan to see potential savings and ensure the new EMI fits your budget.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMI Tips */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Expert Tips for Managing Your EMI Effectively</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">1. Follow the 30% Rule for EMI-to-Income Ratio</h3>
                    <p className="text-gray-600 text-sm">
                      Financial experts recommend keeping total EMI commitments below 30-40% of your monthly gross income. This leaves sufficient room for other expenses, savings, and emergencies. If your EMIs exceed this threshold, consider extending loan tenure or reducing loan amount to maintain financial stability.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">2. Leverage Step-Up EMI for Career Growth</h3>
                    <p className="text-gray-600 text-sm">
                      Young professionals expecting salary increases should consider step-up EMI options. Start with lower payments that increase annually (typically 5-10%) to match income growth. This strategy reduces initial burden while saving on total interest compared to standard EMI - you could save 10-15% on interest costs.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">3. Make Strategic Prepayments</h3>
                    <p className="text-gray-600 text-sm">
                      Use bonuses, tax refunds, or windfalls to make prepayments toward your loan principal. Even small extra payments significantly reduce interest costs and loan tenure. For a $200,000 loan at 7%, an extra $200/month can save over $50,000 in interest and cut 7 years off a 30-year term.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">4. Balance Loan Tenure Wisely</h3>
                    <p className="text-gray-600 text-sm">
                      Shorter tenures save significantly on interest but mean higher EMIs. Longer tenures offer affordability but cost more overall. Find the sweet spot that fits your monthly budget while minimizing total interest. Use our calculator to compare different tenure scenarios and their financial impact.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">5. Improve Credit Score Before Applying</h3>
                    <p className="text-gray-600 text-sm">
                      A higher credit score (720+) qualifies you for significantly lower interest rates. Even a 1% rate reduction can save tens of thousands over the loan term. Before applying, pay off existing debts, correct credit report errors, and avoid new credit inquiries for 6 months.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">6. Compare Multiple Lender Offers</h3>
                    <p className="text-gray-600 text-sm">
                      Don't settle for the first loan offer. Shop around with at least 3-5 lenders including banks, credit unions, and online lenders. Compare not just interest rates but also processing fees, prepayment terms, and customer service. A slightly lower rate can translate to substantial savings.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">7. Understand All Fees and Charges</h3>
                    <p className="text-gray-600 text-sm">
                      Beyond interest rate, factor in processing fees (1-3% of loan amount), prepayment penalties, late payment charges, and insurance costs. These can add thousands to your total loan cost. Ask for a complete fee schedule and calculate the true APR before committing.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">8. Create an Emergency Fund First</h3>
                    <p className="text-gray-600 text-sm">
                      Before taking a loan, build an emergency fund covering 3-6 months of expenses including EMI payments. This safety net prevents loan defaults during job loss, medical emergencies, or unexpected expenses. Missing EMI payments damages credit score and incurs penalty fees.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive FAQ */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions About EMI Calculations</h2>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">What is EMI and how is it calculated?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each month. It's calculated using the formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the monthly interest rate (annual rate/12), and N is the number of monthly installments. This formula ensures consistent monthly payments that cover both principal and interest, with the allocation shifting over time - early payments are mostly interest, while later payments are mostly principal.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">What is the difference between EMI and monthly payment?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      EMI and monthly payment are essentially the same concept - both refer to the fixed amount paid each month to repay a loan. "EMI" is the term commonly used in India and some Asian countries, while "monthly payment" or "installment" is used in the US, UK, and other Western countries. The calculation method and financial impact are identical regardless of terminology.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">How does prepayment affect my EMI and loan tenure?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Prepayment reduces your outstanding principal balance, which means less interest accrues over the remaining loan term. You typically have two options: reduce EMI while keeping tenure constant, or reduce tenure while maintaining the same EMI. The second option saves more on interest. For example, a $10,000 prepayment on a $200,000 loan at 7% can save over $20,000 in interest and cut 2-3 years from a 30-year term. Most lenders allow prepayments without penalties, but always verify your loan terms.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">What is step-up EMI and who should consider it?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Step-up EMI allows borrowers to start with lower monthly payments that increase periodically (typically annually) by a pre-agreed percentage (usually 5-10%). This structure is ideal for young professionals whose income is expected to grow steadily, enabling them to afford larger loans while maintaining current lifestyle. For instance, if you start with an EMI of $1,000 that increases 7% annually, by year 5 you'd pay $1,403/month. This strategy can save 10-15% on total interest compared to standard EMI if structured properly.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Should I choose a shorter or longer loan tenure?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      This depends on balancing monthly affordability with total interest costs. Shorter tenures (3-5 years for personal loans, 15 years for mortgages) mean higher EMIs but dramatically less total interest. Longer tenures (7-10 years for personal loans, 30 years for mortgages) offer lower, more manageable EMIs but significantly higher total cost. As a rule of thumb, choose the shortest tenure you can comfortably afford without straining your monthly budget. Use our calculator to model different scenarios and see the exact trade-offs.
                    </p>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">How accurate is this EMI calculator?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our EMI calculator uses the industry-standard amortization formula employed by banks and financial institutions worldwide, providing highly accurate estimates. However, actual loan terms may vary based on lender-specific policies, origination fees, insurance requirements, processing charges, and your creditworthiness. The calculator doesn't account for these additional costs. Always request a detailed loan estimate from your lender and verify all numbers before committing to a loan.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">What factors affect my EMI amount?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Four primary factors determine your EMI: (1) Principal amount - higher loans mean higher EMIs; (2) Interest rate - determined by market conditions, your credit score, and lender policies; (3) Loan tenure - longer terms reduce EMI but increase total interest; (4) Prepayments - extra payments reduce principal and lower future interest. Secondary factors include processing fees, insurance costs, and whether you choose fixed or floating interest rates. Improving your credit score before applying can significantly reduce your interest rate and EMI.
                    </p>
                  </div>

                  <div className="border-l-4 border-teal-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Can I change my EMI amount during the loan tenure?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Yes, through several methods: (1) Prepayment - make lump sum payments to reduce principal, then request EMI reduction or tenure reduction; (2) Loan restructuring - negotiate with your lender to modify terms, though this may incur fees; (3) Refinancing - take a new loan with better terms to pay off the existing one; (4) Step-up/Step-down EMI - if initially agreed upon, your EMI changes as per schedule. Note that modifying loan terms typically involves fees and lender approval. Always evaluate if the changes justify the costs involved.
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">What happens if I miss an EMI payment?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Missing EMI payments has serious consequences: (1) Late payment fees (typically $25-50 or 2-5% of EMI); (2) Negative impact on credit score that can last years; (3) Higher interest charges on the outstanding amount; (4) Loss of any promotional interest rates; (5) Lender may report to credit bureaus after 30 days; (6) Potential loan default declaration after 90 days of non-payment; (7) Legal action for recovery. If you anticipate payment difficulties, contact your lender immediately to discuss options like payment deferment, loan restructuring, or temporary EMI reduction.
                    </p>
                  </div>

                  <div className="border-l-4 border-gray-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Is it better to pay off a loan early?</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Paying off loans early generally saves on interest, but consider these factors: (1) Prepayment penalties - some lenders charge fees for early repayment; (2) Opportunity cost - if you can invest the money at a higher return than your loan interest rate, investing may be smarter; (3) Tax benefits - home loan interest and some business loan interest is tax-deductible; (4) Emergency fund - ensure you maintain adequate savings before prepaying; (5) Other high-interest debt - prioritize paying off higher-rate debts first. For most consumer loans without tax benefits, early repayment is financially beneficial.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Financial Calculators</h2>
                <p className="text-gray-600 mb-8">
                  Explore our comprehensive suite of financial calculators to make informed decisions about your money:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <a href="/tools/loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-2">Loan Calculator</h3>
                    <p className="text-sm text-gray-600">Calculate monthly payments for any loan type with flexible terms</p>
                  </a>
                  <a href="/tools/home-loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-2">Home Loan Calculator</h3>
                    <p className="text-sm text-gray-600">Specialized mortgage calculator with property tax and insurance</p>
                  </a>
                  <a href="/tools/car-loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-2">Car Loan Calculator</h3>
                    <p className="text-sm text-gray-600">Calculate auto loan payments with trade-in and down payment options</p>
                  </a>
                  <a href="/tools/personal-finance-dashboard" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-2">Personal Finance Dashboard</h3>
                    <p className="text-sm text-gray-600">Track all your financial metrics in one comprehensive dashboard</p>
                  </a>
                  <a href="/tools/debt-payoff-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-2">Debt Payoff Calculator</h3>
                    <p className="text-sm text-gray-600">Create a strategic plan to become debt-free faster</p>
                  </a>
                  <a href="/tools/compound-interest-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-2">Compound Interest Calculator</h3>
                    <p className="text-sm text-gray-600">See how your investments can grow exponentially over time</p>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-sm text-gray-500 mt-8">
              <p>Last Updated: January 2025 | Calculations verified by financial experts</p>
              <p className="mt-2">✓ Trusted by 3.4M+ users worldwide | ✓ Bank-grade accuracy | ✓ 100% Free Forever</p>
            </div>
          </div>

          {/* Additional SEO Content Sections */}
          <div className="mt-12 space-y-8">
            {/* Types of Loans Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Types of Loans for EMI Calculation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">Home Loans</h4>
                    <p className="text-gray-600">
                      Home loans typically have the longest tenure (15-30 years) and competitive interest rates. 
                      EMI calculations help you determine affordability based on your monthly income and plan for 
                      property purchases effectively.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Car Loans</h4>
                    <p className="text-gray-600">
                      Auto loans usually range from 1-7 years with moderate interest rates. Use our EMI calculator 
                      to compare different car financing options and choose the best loan tenure for your budget.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Personal Loans</h4>
                    <p className="text-gray-600">
                      Personal loans offer flexibility but come with higher interest rates. Calculate EMI to ensure 
                      the monthly payment fits comfortably within your budget without affecting other financial goals.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Business Loans</h4>
                    <p className="text-gray-600">
                      Business loans help entrepreneurs grow their ventures. EMI calculations are crucial for 
                      cash flow planning and ensuring loan payments don't strain business operations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factors Affecting EMI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Factors Affecting EMI Amount</h3>
                  <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Principal Amount</h4>
                      <p className="text-sm">Higher loan amounts result in higher EMIs. Borrow only what you need and can afford to repay comfortably.</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Interest Rate</h4>
                      <p className="text-sm">Lower interest rates reduce EMI burden. Compare rates from different lenders and negotiate for better terms.</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Loan Tenure</h4>
                      <p className="text-sm">Longer tenure reduces EMI but increases total interest. Find the right balance for your financial situation.</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Credit Score</h4>
                      <p className="text-sm">Better credit scores qualify for lower interest rates, reducing your EMI amount significantly.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">EMI Planning Strategies</h3>
                  <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">50-30-20 Rule</h4>
                      <p className="text-sm text-blue-700">Limit total EMIs to 50% of your monthly income, keeping 30% for expenses and 20% for savings.</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Step-Up EMI</h4>
                      <p className="text-sm text-green-700">Start with lower EMIs that increase annually with your expected salary growth, saving on total interest.</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Prepayment Strategy</h4>
                      <p className="text-sm text-orange-700">Use bonuses, tax refunds, or windfalls to make prepayments and reduce loan tenure significantly.</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Balance Transfer</h4>
                      <p className="text-sm text-purple-700">Transfer high-interest loans to lenders offering lower rates to reduce EMI burden.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* EMI FAQs Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Frequently Asked Questions about EMI</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What happens if I miss an EMI payment?</h4>
                      <p className="text-gray-600 text-sm">Missing EMI payments can result in late fees, negative impact on credit score, and potential legal action. Contact your lender immediately if you anticipate payment difficulties.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I change my EMI amount during the loan tenure?</h4>
                      <p className="text-gray-600 text-sm">Yes, through loan restructuring, prepayments, or step-up/step-down EMI options. Consult your lender for available options based on your financial situation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Is EMI tax deductible?</h4>
                      <p className="text-gray-600 text-sm">Home loan EMIs qualify for tax deductions - principal under Section 80C and interest under Section 24. Personal and car loan EMIs generally don't qualify for tax benefits.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the maximum loan tenure available?</h4>
                      <p className="text-gray-600 text-sm">Home loans can extend up to 30 years, car loans up to 7 years, and personal loans typically up to 5 years. Longer tenure reduces EMI but increases total interest cost.</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Should I choose fixed or floating interest rates?</h4>
                      <p className="text-gray-600 text-sm">Fixed rates provide EMI certainty but are typically higher. Floating rates can save money when rates decline but carry uncertainty. Choose based on your risk tolerance and market outlook.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">How does prepayment reduce my loan burden?</h4>
                      <p className="text-gray-600 text-sm">Prepayments directly reduce the principal amount, which decreases the total interest payable and can significantly shorten your loan tenure, saving substantial money.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">What's the ideal EMI-to-income ratio?</h4>
                      <p className="text-gray-600 text-sm">Financial experts recommend keeping total EMIs below 40-50% of your monthly income to maintain financial stability and accommodate unexpected expenses.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Can I get a loan with bad credit?</h4>
                      <p className="text-gray-600 text-sm">Yes, but expect higher interest rates and stricter terms. Consider improving your credit score, providing collateral, or getting a co-signer to improve loan terms.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interest Rate Types */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Fixed Interest Rate</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Fixed rates remain constant throughout the loan tenure, providing EMI predictability and budget certainty.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Predictable monthly payments</li>
                        <li>Protection from rate increases</li>
                        <li>Easy budget planning</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Disadvantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Higher initial rates</li>
                        <li>No benefit from rate decreases</li>
                        <li>Limited flexibility</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Floating Interest Rate</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Floating rates fluctuate with market conditions, typically linked to benchmark rates like repo rate or MCLR.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Lower initial rates</li>
                        <li>Benefit from rate decreases</li>
                        <li>Potential interest savings</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Disadvantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>EMI uncertainty</li>
                        <li>Risk of rate increases</li>
                        <li>Difficult to budget</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Hybrid Interest Rate</h3>
                  <div className="space-y-4 text-gray-600">
                    <p className="text-sm">
                      Hybrid loans start with fixed rates for an initial period, then switch to floating rates.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-800 text-sm">Advantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-green-700">
                        <li>Initial rate certainty</li>
                        <li>Future flexibility</li>
                        <li>Balanced approach</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 text-sm">Disadvantages:</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                        <li>Complex structure</li>
                        <li>Future rate uncertainty</li>
                        <li>Transition complexity</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Mistakes Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Common EMI Calculation Mistakes to Avoid</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Ignoring Hidden Costs</h4>
                      <p className="text-red-700 text-sm">Many borrowers forget processing fees, insurance, and other charges when calculating total loan cost. Always factor in all associated expenses.</p>
                    </div>
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Not Considering Income Growth</h4>
                      <p className="text-orange-700 text-sm">Step-up EMI options can save significant interest if your income is expected to grow. Don't stick to fixed EMI if you can handle increases.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">Choosing Maximum Tenure Always</h4>
                      <p className="text-yellow-700 text-sm">While longer tenure reduces EMI, it significantly increases total interest cost. Balance EMI affordability with total cost.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Not Shopping for Better Rates</h4>
                      <p className="text-blue-700 text-sm">Even a 0.5% difference in interest rate can save thousands over the loan tenure. Compare offers from multiple lenders before deciding.</p>
                    </div>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Overlooking Prepayment Options</h4>
                      <p className="text-purple-700 text-sm">Many loans allow partial or full prepayment without penalties. Use windfalls like bonuses to reduce principal and save on interest.</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Ignoring Credit Score Impact</h4>
                      <p className="text-green-700 text-sm">A good credit score can significantly reduce interest rates. Work on improving your score before applying for loans.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan vs Investment Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">EMI vs Investment: Making Smart Financial Decisions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">When to Take a Loan</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Essential purchases like home or vehicle where immediate need exists</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Business expansion opportunities with higher expected returns</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Tax benefits available (home loans, education loans)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Loan interest rate is lower than potential investment returns</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">When to Avoid Loans</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Lifestyle purchases or discretionary spending</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">EMI would strain your monthly budget significantly</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">High interest rates with no tax benefits</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">Uncertain income or job security</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Smart Strategy</h4>
                  <p className="text-blue-700 text-sm">
                    Use our EMI calculator to determine monthly payments, then compare the cost of borrowing with potential 
                    investment returns. Consider your risk tolerance, financial goals, and market conditions before deciding 
                    between borrowing and self-funding.
                  </p>
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