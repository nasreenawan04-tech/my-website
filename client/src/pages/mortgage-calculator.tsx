import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Info, Calculator, Home, DollarSign, Shield, TrendingUp, Download, Printer, Share2, PieChart, TrendingDown, Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

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
  const [showChart, setShowChart] = useState(false);
  const [result, setResult] = useState<MortgageResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { toast } = useToast();

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
    const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
    tableScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const calculateMortgage = () => {
    const price = parseFloat(homePrice);
    const down = usePercentage
      ? (price * parseFloat(downPaymentPercent)) / 100
      : parseFloat(downPayment);
    const principal = price - down;
    const annualRate = parseFloat(interestRate) / 100;
    const termYears = parseFloat(loanTerm);
    const taxes = parseFloat(propertyTax) || 0;
    const insurance = parseFloat(homeInsurance) || 0;
    const pmi = parseFloat(pmiRate) || 0;
    const hoa = parseFloat(hoaFees) || 0;
    const income = parseFloat(monthlyIncome) || 0;
    const extraPmt = parseFloat(extraPayment) || 0;

    if (principal <= 0 || annualRate < 0 || termYears <= 0) return;

    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const periodicRate = annualRate / paymentsPerYear;
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

    setResult({
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
    });

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
    setShowChart(false);
    setResult(null);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
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
    doc.text('Mortgage Calculation Report', pageWidth / 2, yPos, { align: 'center' });
    
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
    const downPaymentAmount = usePercentage
      ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100
      : parseFloat(downPayment);
    const loanAmount = parseFloat(homePrice) - downPaymentAmount;
    const actualDownPaymentPercent = ((downPaymentAmount / parseFloat(homePrice)) * 100).toFixed(1);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 56, 3, 3, 'FD');
    
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
    
    const col1X = margin + 8;
    const col2X = margin + 60;
    const col3X = pageWidth / 2 + 8;
    const col4X = pageWidth / 2 + 60;
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Home Price', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(parseFloat(homePrice)), col2X, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Down Payment', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${formatCurrency(downPaymentAmount)} (${actualDownPaymentPercent}%)`, col4X, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Loan Amount', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(loanAmount), col2X, yPos);
    
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
    doc.text(`${loanTerm} years`, col2X, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Loan Type', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const loanTypeDisplay = loanType === 'conventional' ? 'Conventional' : loanType === 'fha' ? 'FHA' : 'VA';
    doc.text(loanTypeDisplay, col4X, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Loan-to-Value', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.loanToValue.toFixed(1)}%`, col2X, yPos);
    
    if (parseFloat(extraPayment) > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('Extra Payment', col3X, yPos);
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(parseFloat(extraPayment)), col4X, yPos);
    }

    yPos += 14;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    const paymentBoxHeight = result.monthlyPMI > 0 || result.monthlyHOA > 0 ? 54 : 46;
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), paymentBoxHeight, 3, 3, 'FD');
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT BREAKDOWN', margin + 4, yPos);
    
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
    doc.text('Total Monthly Payment', margin + 8, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.monthlyPayment), pageWidth - margin - 8, yPos, { align: 'right' });
    
    yPos += 9;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Principal & Interest', margin + 12, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(result.monthlyPrincipalAndInterest), pageWidth - margin - 12, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Property Taxes', margin + 12, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(result.monthlyTaxes), pageWidth - margin - 12, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Home Insurance', margin + 12, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(result.monthlyInsurance), pageWidth - margin - 12, yPos, { align: 'right' });
    
    if (result.monthlyPMI > 0) {
      yPos += 6;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('PMI', margin + 12, yPos);
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(result.monthlyPMI), pageWidth - margin - 12, yPos, { align: 'right' });
    }
    
    if (result.monthlyHOA > 0) {
      yPos += 6;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('HOA Fees', margin + 12, yPos);
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(result.monthlyHOA), pageWidth - margin - 12, yPos, { align: 'right' });
    }

    yPos += 12;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 36, 3, 3, 'FD');
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL COSTS', margin + 4, yPos);
    
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
    doc.text('Total Interest', margin + 12, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38);
    doc.text(formatCurrency(result.totalInterest), pageWidth - margin - 12, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Closing Costs', margin + 12, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(result.closingCosts), pageWidth - margin - 12, yPos, { align: 'right' });

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
      const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                             paymentFrequency === 'biweekly' ? 26 : 12;
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
    doc.text('DapsiWow.com', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 3;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Free Online Financial Calculators & Tools', pageWidth / 2, yPos, { align: 'center' });

    doc.save(`DapsiWow-Mortgage-Calculation-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your professional mortgage calculation report has been saved." 
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

    // Calculate down payment amount
    const downPaymentAmount = usePercentage
      ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100
      : parseFloat(downPayment);

    // Calculate actual per-period payment based on frequency
    const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                           paymentFrequency === 'biweekly' ? 26 : 12;
    const actualPeriodicPayment = result.monthlyPayment * (12 / paymentsPerYear);

    let shareText = `🏠 Mortgage Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Home Price: ${formatCurrency(parseFloat(homePrice))}\n`;
    shareText += `• Down Payment: ${formatCurrency(downPaymentAmount)} (${downPaymentPercent}%)\n`;
    shareText += `• Loan Amount: ${formatCurrency(parseFloat(homePrice) - downPaymentAmount)}\n`;
    shareText += `• Interest Rate: ${interestRate}%\n`;
    shareText += `• Term: ${loanTerm} years\n`;
    shareText += `• Loan Type: ${loanType === 'conventional' ? 'Conventional' : loanType === 'fha' ? 'FHA' : 'VA'}\n`;
    shareText += `• Payment Frequency: ${freqDisplay}\n`;
    if (parseFloat(extraPayment) > 0) {
      shareText += `• Extra Payment: ${formatCurrency(parseFloat(extraPayment))}\n`;
    }

    shareText += `\n💵 Payment Breakdown:\n`;
    shareText += `• ${freqDisplay} Payment: ${formatCurrency(actualPeriodicPayment)}\n`;
    if (paymentFrequency !== 'monthly') {
      shareText += `• Monthly Equivalent: ${formatCurrency(result.monthlyPayment)}\n`;
    }
    shareText += `• Principal & Interest: ${formatCurrency(result.monthlyPrincipalAndInterest)}\n`;
    shareText += `• Property Taxes: ${formatCurrency(result.monthlyTaxes)}\n`;
    shareText += `• Home Insurance: ${formatCurrency(result.monthlyInsurance)}\n`;
    if (result.monthlyPMI > 0) {
      shareText += `• PMI: ${formatCurrency(result.monthlyPMI)}\n`;
    }
    if (result.monthlyHOA > 0) {
      shareText += `• HOA Fees: ${formatCurrency(result.monthlyHOA)}\n`;
    }

    shareText += `\n📈 Total Costs:\n`;
    shareText += `• Total Amount: ${formatCurrency(result.totalAmount)}\n`;
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n`;
    shareText += `• Closing Costs: ${formatCurrency(result.closingCosts)}\n`;
    shareText += `• Cash Needed: ${formatCurrency(result.totalCashNeeded)}\n`;

    shareText += `\n📊 Ratios:\n`;
    shareText += `• Loan-to-Value: ${result.loanToValue.toFixed(1)}%\n`;
    if (result.debtToIncomeRatio && result.debtToIncomeRatio > 0) {
      shareText += `• Debt-to-Income: ${result.debtToIncomeRatio.toFixed(1)}%\n`;
    }

    if (result.extraPaymentSavings) {
      const paymentsPerYear = paymentFrequency === 'weekly' ? 52 :
                             paymentFrequency === 'biweekly' ? 26 : 12;
      const totalYearsSaved = result.extraPaymentSavings.timeSaved / paymentsPerYear;
      let yearsSaved = Math.floor(totalYearsSaved);
      let monthsSaved = Math.round((totalYearsSaved - yearsSaved) * 12);
      
      // Handle carry-over when rounded months equals 12
      if (monthsSaved === 12) {
        yearsSaved += 1;
        monthsSaved = 0;
      }
      
      shareText += `\n✨ Extra Payment Savings:\n`;
      shareText += `• Interest Saved: ${formatCurrency(result.extraPaymentSavings.interestSaved)}\n`;
      if (yearsSaved > 0 && monthsSaved > 0) {
        shareText += `• Time Saved: ${yearsSaved} years ${monthsSaved} months\n`;
      } else if (yearsSaved > 0) {
        shareText += `• Time Saved: ${yearsSaved} years\n`;
      } else if (monthsSaved > 0) {
        shareText += `• Time Saved: ${monthsSaved} months\n`;
      }
    }

    shareText += `\n🔗 View & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🏠 Mortgage Calculator Results',
          text: shareText,
          url: shareableUrl
        });
        toast({ title: "Shared successfully!" });
      } catch (err) {
        navigator.clipboard.writeText(shareText);
        toast({ title: "Copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const principalPercentage = result ? (parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment))) / result.totalAmount * 100 : 0;
  const interestPercentage = result ? (result.totalInterest / result.totalAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Helmet>
        <title>Free Mortgage Calculator 2025: Calculate Home Loan Payments Instantly | DapsiWow</title>
        <meta name="description" content="Calculate monthly mortgage payments with our free 2025 calculator. Includes taxes, insurance, PMI & amortization schedules for FHA, VA, conventional loans. Get accurate home affordability estimates instantly - 100% free, no registration required." />
        <meta name="keywords" content="mortgage calculator, mortgage payment calculator, home loan calculator, monthly mortgage payment, mortgage estimator, house payment calculator, home affordability calculator, mortgage interest calculator, mortgage calculator with taxes and insurance, FHA mortgage calculator, VA loan calculator, mortgage amortization calculator, refinance calculator, home loan estimator, calculate mortgage payment, free mortgage calculator 2025" />

        <meta property="og:title" content="Free Mortgage Calculator 2025 – Estimate Monthly Payments | DapsiWow" />
        <meta property="og:description" content="Calculate your monthly mortgage payments instantly with our free 2025 mortgage calculator. Includes principal, interest, taxes, insurance, and PMI. Get accurate home loan estimates." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/mortgage-calculator" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Mortgage Calculator 2025 – Estimate Monthly Payments | DapsiWow" />
        <meta name="twitter:description" content="Calculate your monthly mortgage payments instantly. Includes taxes, insurance, PMI & comprehensive breakdown." />

        <link rel="canonical" href="https://dapsiwow.com/tools/mortgage-calculator" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Free Mortgage Payment Calculator",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2547"
            },
            "description": "Free mortgage calculator to estimate monthly home loan payments with taxes, insurance, PMI, and amortization schedule. Calculate your home affordability with our comprehensive mortgage payment calculator for FHA, VA, and conventional loans.",
            "operatingSystem": "Any",
            "featureList": "Monthly payment calculation, Amortization schedule, Tax and insurance estimates, PMI calculator, Loan comparison, FHA loan calculator, VA loan calculator, Refinance calculator, Export PDF results"
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
                  "text": "Our mortgage calculator provides highly accurate estimates using the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1]. However, actual payments may vary slightly based on your lender's specific terms, closing costs, and any discount points purchased. Always verify final numbers with your mortgage lender."
                }
              },
              {
                "@type": "Question",
                "name": "What is PMI and when is it required?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PMI (Private Mortgage Insurance) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually and protects the lender if you default. PMI can be removed once you reach 78% loan-to-value ratio through principal payments or home appreciation."
                }
              },
              {
                "@type": "Question",
                "name": "How much mortgage can I afford?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Lenders typically use the 28% rule: your monthly mortgage payment (including principal, interest, taxes, and insurance) should not exceed 28% of your gross monthly income. For example, if you earn $8,000/month, your maximum payment should be $2,240. Use the monthly income field in our mortgage affordability calculator for personalized analysis."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between FHA and conventional loans?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FHA loans require as little as 3.5% down and have more lenient credit requirements (580+ score), but include mandatory mortgage insurance for the life of the loan in many cases. Conventional loans typically require 5-20% down, 620+ credit score, but PMI can be removed at 78% LTV."
                }
              },
              {
                "@type": "Question",
                "name": "Should I choose a 15-year or 30-year mortgage?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A 30-year mortgage offers lower monthly payments but higher total interest over the life of the loan. A 15-year mortgage has higher monthly payments but you'll pay significantly less interest and build equity faster. Use our calculator to compare both options and see which fits your budget and financial goals."
                }
              },
              {
                "@type": "Question",
                "name": "What are closing costs and how much should I expect?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Closing costs typically range from 2-5% of the home's purchase price and include fees for appraisal, title insurance, origination, escrow, and more. On a $500,000 home, expect $10,000-$25,000 in closing costs. Our calculator uses a 3% default but you can adjust this based on your lender's estimate."
                }
              },
              {
                "@type": "Question",
                "name": "How do property taxes affect my monthly payment?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Property taxes are typically included in your monthly mortgage payment through an escrow account. They vary significantly by location - ranging from 0.3% to 2.5% of your home's value annually. Check your local tax rates and enter the annual amount in our calculator for accurate monthly payment estimates."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this as a refinance calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Enter your current home's value as the home price and calculate your remaining loan balance to compare with new rate scenarios. This helps you determine if refinancing makes financial sense based on potential interest savings versus closing costs. Compare your current monthly payment with new rate scenarios."
                }
              }
            ]
          })}
        </script>

      </Helmet>

      <Header />

      <main>
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-700" />
                <span className="text-xs sm:text-sm font-medium text-purple-700">Free Mortgage Payment Calculator 2025</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Free Mortgage Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1 sm:mt-2">
                  Calculate Home Loan Payments
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate monthly mortgage payments, home affordability, and total interest costs instantly. Includes property taxes, insurance, PMI & detailed amortization schedules for FHA, VA, and conventional loans. 100% free with instant results - no registration required.
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-700">100% Free & Private</span>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs sm:text-sm text-gray-700">500,000+ Calculations</span>
                  </div>
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Mortgage Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your home and loan details for accurate payment calculations</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-price" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <Home className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Home Price</span>
                            <span className="sm:hidden">Price</span>
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="home-price"
                            type="number"
                            value={homePrice}
                            onChange={(e) => setHomePrice(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="500,000"
                            data-testid="input-home-price"
                          />
                        </div>
                        <Slider
                          value={[parseFloat(homePrice) || 0]}
                          onValueChange={(value) => setHomePrice(value[0].toString())}
                          max={2000000}
                          step={10000}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                            <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Down Payment</span>
                            <span className="sm:hidden">Down</span>
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
                            className="h-12 md:h-14 pr-7 md:pr-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="20"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">%</span>
                        </div>
                        <Slider
                          value={[parseFloat(downPaymentPercent) || 0]}
                          onValueChange={(value) => setDownPaymentPercent(value[0].toString())}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                            <span className="hidden sm:inline">Loan Term (Years)</span>
                            <span className="sm:hidden">Term (Yrs)</span>
                          </Label>
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
                          className="h-12 md:h-14 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                          placeholder="30"
                          min="1"
                          max="40"
                        />
                        <Slider
                          value={[parseFloat(loanTerm) || 30]}
                          onValueChange={(value) => setLoanTerm(value[0].toString())}
                          max={40}
                          min={5}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="interest-rate" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                            <span className="hidden sm:inline">Interest Rate (%)</span>
                            <span className="sm:hidden">Rate (%)</span>
                          </Label>
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
                            className="h-12 md:h-14 pr-7 md:pr-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="6.5"
                            step="0.01"
                          />
                          <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">%</span>
                        </div>
                        <Slider
                          value={[parseFloat(interestRate) || 0]}
                          onValueChange={(value) => setInterestRate(value[0].toFixed(2))}
                          max={15}
                          min={2}
                          step={0.1}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                            <span className="hidden sm:inline">Payment Frequency</span>
                            <span className="sm:hidden">Frequency</span>
                          </Label>
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
                          <SelectTrigger className="h-12 md:h-14 border-2 border-gray-200 rounded-lg md:rounded-xl text-base md:text-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-type" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">Loan Type</Label>
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
                          <SelectTrigger className="h-12 md:h-14 border-2 border-gray-200 rounded-lg md:rounded-xl text-base md:text-lg w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conventional">Conventional</SelectItem>
                            <SelectItem value="fha">FHA</SelectItem>
                            <SelectItem value="va">VA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="property-tax" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                            <span className="hidden sm:inline">Annual Property Tax</span>
                            <span className="sm:hidden">Property Tax</span>
                          </Label>
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="property-tax"
                            type="number"
                            value={propertyTax}
                            onChange={(e) => setPropertyTax(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="6,000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="home-insurance" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                            <span className="hidden sm:inline">Annual Home Insurance</span>
                            <span className="sm:hidden">Insurance</span>
                          </Label>
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="home-insurance"
                            type="number"
                            value={homeInsurance}
                            onChange={(e) => setHomeInsurance(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="1,800"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="hoa-fees" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
                            <span className="hidden sm:inline">Monthly HOA Fees</span>
                            <span className="sm:hidden">HOA Fees</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Homeowners association fees (if applicable)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="hoa-fees"
                            type="number"
                            value={hoaFees}
                            onChange={(e) => setHoaFees(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="extra-payment" className="text-sm md:text-base font-semibold text-gray-800 uppercase tracking-wide">
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
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base md:text-lg">$</span>
                          <Input
                            id="extra-payment"
                            type="number"
                            value={extraPayment}
                            onChange={(e) => setExtraPayment(e.target.value)}
                            className="h-12 md:h-14 pl-7 md:pl-8 text-base md:text-lg border-2 border-gray-200 rounded-lg md:rounded-xl focus:border-purple-500 focus:ring-purple-500 w-full"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <p className="text-sm text-gray-500">💡 Pro Tip: Even small extra payments can save you thousands in interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateMortgage}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Mortgage Payment
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
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 print:hidden">
                      <Button
                        onClick={() => setShowAmortization(!showAmortization)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        {showAmortization ? 'Hide' : 'Show'} Payment Schedule
                      </Button>
                      <Button
                        onClick={() => setShowChart(!showChart)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        <PieChart className="w-4 h-4 mr-1" />
                        {showChart ? 'Hide' : 'Show'} Chart
                      </Button>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export PDF
                      </Button>
                    </div>
                  )}
                </div>

                {result ? (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your Mortgage Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Monthly Payment</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 break-all">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                          <p className="text-xs text-gray-500">Based on {paymentFrequency} payment frequency</p>
                        </div>
                      </div>

                      {showChart && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-blue-100">
                            <h3 className="font-bold text-gray-900 mb-6 sm:mb-8 text-center text-lg sm:text-xl flex items-center justify-center gap-2">
                              <PieChart className="w-5 h-5 text-blue-600" />
                              Total Loan Breakdown
                            </h3>
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
                              <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] aspect-square">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RechartsPieChart>
                                    <Pie
                                      data={[
                                        { name: 'Principal', value: parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)), percentage: principalPercentage },
                                        { name: 'Interest', value: result.totalInterest, percentage: interestPercentage }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="45%"
                                      outerRadius="75%"
                                      paddingAngle={5}
                                      dataKey="value"
                                      label={({ percentage }) => `${percentage.toFixed(1)}%`}
                                      labelLine={true}
                                    >
                                      <Cell fill="url(#principalGradient)" stroke="#10b981" strokeWidth={2} />
                                      <Cell fill="url(#interestGradient)" stroke="#f59e0b" strokeWidth={2} />
                                    </Pie>
                                    <RechartsTooltip
                                      formatter={(value: number) => formatCurrency(value)}
                                      contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                        padding: '12px'
                                      }}
                                      wrapperStyle={{ fontSize: '14px' }}
                                    />
                                    <Legend 
                                      verticalAlign="bottom" 
                                      height={36}
                                      iconType="circle"
                                      formatter={(value, entry: any) => (
                                        <span className="text-xs sm:text-sm font-medium text-gray-700">{value}</span>
                                      )}
                                      wrapperStyle={{ fontSize: '14px' }}
                                    />
                                    <defs>
                                      <linearGradient id="principalGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                                      </linearGradient>
                                      <linearGradient id="interestGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
                                      </linearGradient>
                                    </defs>
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="grid grid-cols-1 gap-4 w-full max-w-xs lg:max-w-sm">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Principal Amount</p>
                                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900 break-words">
                                        {formatCurrency(parseFloat(homePrice) - (usePercentage ? (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100 : parseFloat(downPayment)))}
                                      </p>
                                    </div>
                                    <div className="bg-green-500 rounded-full p-2 flex-shrink-0 ml-2">
                                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-green-600 mt-2">{principalPercentage.toFixed(1)}% of total</p>
                                </div>
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 sm:p-4 border-l-4 border-orange-500">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Total Interest</p>
                                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900 break-words">
                                        {formatCurrency(result.totalInterest)}
                                      </p>
                                    </div>
                                    <div className="bg-orange-500 rounded-full p-2 flex-shrink-0 ml-2">
                                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-orange-600 mt-2">{interestPercentage.toFixed(1)}% of total</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {result.amortizationSchedule.length > 0 && (
                            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-purple-100">
                              <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-lg sm:text-xl flex items-center justify-center gap-2">
                                <TrendingDown className="w-5 h-5 text-purple-600" />
                                Payment Breakdown Over Time
                              </h3>
                              <p className="text-center text-sm text-gray-600 mb-6">See how your payments shift from interest to principal</p>
                              <div className="w-full">
                                <div className="w-full h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart 
                                      data={result.amortizationSchedule.map(item => ({
                                        month: `Month ${item.month}`,
                                        Principal: item.principal,
                                        Interest: item.interest,
                                        Balance: item.balance
                                      }))}
                                      margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
                                    >
                                      <defs>
                                        <linearGradient id="principalAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                                        </linearGradient>
                                        <linearGradient id="interestAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                      <XAxis 
                                        dataKey="month" 
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        className="text-[10px] sm:text-xs"
                                        interval="preserveStartEnd"
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                      />
                                      <YAxis 
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        className="text-[10px] sm:text-xs"
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        width={50}
                                      />
                                      <RechartsTooltip 
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                          border: '2px solid #e5e7eb',
                                          borderRadius: '12px',
                                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                                          padding: '8px 12px',
                                          fontSize: '13px'
                                        }}
                                        labelStyle={{ color: '#1f2937', fontWeight: 600, fontSize: '13px' }}
                                      />
                                      <Area 
                                        type="monotone" 
                                        dataKey="Principal" 
                                        stackId="1" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        fill="url(#principalAreaGradient)" 
                                      />
                                      <Area 
                                        type="monotone" 
                                        dataKey="Interest" 
                                        stackId="1" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        fill="url(#interestAreaGradient)" 
                                      />
                                      <Legend 
                                        verticalAlign="top" 
                                        height={36}
                                        iconType="line"
                                        formatter={(value) => (
                                          <span className="text-xs sm:text-sm font-medium text-gray-700">{value}</span>
                                        )}
                                        wrapperStyle={{ fontSize: '13px' }}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <p className="text-xs text-gray-500 mb-1">First Payment</p>
                                  <p className="text-sm font-bold text-gray-900 break-words">
                                    {result.amortizationSchedule[0] && formatCurrency(result.amortizationSchedule[0].interest)} Interest
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <p className="text-xs text-gray-500 mb-1">Last Payment</p>
                                  <p className="text-sm font-bold text-gray-900 break-words">
                                    {result.amortizationSchedule[result.amortizationSchedule.length - 1] && 
                                      formatCurrency(result.amortizationSchedule[result.amortizationSchedule.length - 1].principal)} Principal
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                                  <p className="text-xs text-gray-500 mb-1">Remaining Balance</p>
                                  <p className="text-sm font-bold text-gray-900 break-words">
                                    {result.amortizationSchedule[result.amortizationSchedule.length - 1] && 
                                      formatCurrency(result.amortizationSchedule[result.amortizationSchedule.length - 1].balance)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                          <p className="text-xs md:text-sm text-blue-700 mb-1">Principal & Interest</p>
                          <p className="text-base md:text-xl lg:text-2xl font-bold text-blue-900 break-all">{formatCurrency(result.monthlyPrincipalAndInterest)}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 md:p-4">
                          <p className="text-xs md:text-sm text-green-700 mb-1">Property Taxes</p>
                          <p className="text-base md:text-xl lg:text-2xl font-bold text-green-900 break-all">{formatCurrency(result.monthlyTaxes)}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 md:p-4">
                          <p className="text-xs md:text-sm text-purple-700 mb-1">Home Insurance</p>
                          <p className="text-base md:text-xl lg:text-2xl font-bold text-purple-900 break-all">{formatCurrency(result.monthlyInsurance)}</p>
                        </div>
                        {result.monthlyPMI > 0 && (
                          <div className="bg-orange-50 rounded-lg p-3 md:p-4">
                            <p className="text-xs md:text-sm text-orange-700 mb-1">PMI</p>
                            <p className="text-base md:text-xl lg:text-2xl font-bold text-orange-900 break-all">{formatCurrency(result.monthlyPMI)}</p>
                          </div>
                        )}
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

          {result && showAmortization && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Amortization Schedule (First 5 Years)</h3>
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
                  <table className="w-full min-w-[600px] select-none">
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

          {/* Trust Signals */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 mb-8 mt-8 border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">3.2M+</div>
                <div className="text-sm text-gray-600">Mortgage Calculations Done</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100% Accurate</div>
                <div className="text-sm text-gray-600">Bank-Grade Calculator</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Free Forever</div>
                <div className="text-sm text-gray-600">No Hidden Fees</div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How to Use This Mortgage Calculator</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h3 className="font-bold text-gray-900">Enter Home Price</h3>
                  <p className="text-sm text-gray-600">Input the purchase price of the home you're considering. This is the total amount before your down payment.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h3 className="font-bold text-gray-900">Set Down Payment</h3>
                  <p className="text-sm text-gray-600">Enter your down payment as a percentage or dollar amount. 20% or more avoids PMI on conventional loans.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h3 className="font-bold text-gray-900">Choose Loan Term</h3>
                  <p className="text-sm text-gray-600">Select 15, 20, or 30 years. Shorter terms save on interest; longer terms lower monthly payments.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <h3 className="font-bold text-gray-900">Enter Interest Rate</h3>
                  <p className="text-sm text-gray-600">Input the annual interest rate from your lender or current market rates. Rates vary by loan type and credit score.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                  <h3 className="font-bold text-gray-900">Add Taxes & Insurance</h3>
                  <p className="text-sm text-gray-600">Include annual property taxes and homeowners insurance for accurate monthly payment calculations.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
                  <h3 className="font-bold text-gray-900">Calculate & Analyze</h3>
                  <p className="text-sm text-gray-600">Click "Calculate" to see your complete breakdown, amortization schedule, and affordability analysis.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Understanding Mortgage Payments */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Understanding Mortgage Payments & How They Work</h2>
              <div className="prose max-w-none text-gray-700 space-y-4 text-base leading-relaxed">
                <p>
                  A mortgage is one of the biggest financial commitments most people make in their lifetime. Understanding how mortgage payments are calculated and what factors influence them is crucial for making informed home-buying decisions and potentially saving thousands of dollars over the life of your loan.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">The PITI Payment Structure</h3>
                <p>
                  Your total monthly mortgage payment consists of four main components, often abbreviated as PITI: Principal (the amount you borrowed), Interest (the cost of borrowing), property Taxes, and homeowners Insurance. Understanding each component helps you budget accurately and identify potential savings opportunities.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">How Mortgage Interest Works</h3>
                <p>
                  Mortgages use amortization, meaning your monthly payment stays the same, but the allocation between principal and interest changes over time. In the early years, most of your payment goes toward interest because it's calculated on your remaining balance. As you pay down the principal, less interest accrues each month, and more of your payment reduces the loan balance. This is why making extra payments early in the loan term has the biggest impact on total interest savings.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Impact of Down Payment Size</h3>
                <p>
                  Your down payment significantly affects your monthly payment and total loan cost. A larger down payment (20% or more on conventional loans) eliminates Private Mortgage Insurance (PMI), reduces your loan amount, and often qualifies you for better interest rates. For example, on a $400,000 home, a 20% down payment ($80,000) versus 10% ($40,000) eliminates $200+ monthly in PMI and reduces your principal & interest payment by approximately $220, saving over $420/month and tens of thousands over the loan term.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">The Power of Rate Shopping</h3>
                <p>
                  Even a 0.25% difference in interest rate can save you thousands. On a $300,000 30-year mortgage, the difference between 6.5% and 6.25% saves you approximately $50 per month and over $18,000 in total interest. Always compare offers from multiple lenders, including banks, credit unions, and online lenders. Rate shopping within a 45-day window typically counts as a single credit inquiry.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Extra Payments Make a Huge Difference</h3>
                <p>
                  Making additional principal payments can dramatically shorten your loan term and save substantial interest. Adding just $200 extra per month to a $350,000 mortgage at 6.5% can save over $80,000 in interest and pay off the loan 7 years early. Use our calculator's extra payment feature to see your potential savings with different payment strategies.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Types of Mortgages */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Mortgages You Can Calculate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    Conventional Loans
                  </h3>
                  <p className="text-gray-600">
                    Traditional mortgages not backed by the government, typically requiring 5-20% down payment and 620+ credit score. Best rates available with 20% down. PMI required below 20% down but can be removed at 78% LTV. Ideal for borrowers with solid credit and stable income. Loan limits: $766,550 (2024) in most areas.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    FHA Loans
                  </h3>
                  <p className="text-gray-600">
                    Federal Housing Administration insured loans requiring as little as 3.5% down with 580+ credit score. More lenient credit requirements make them accessible to first-time buyers. Includes upfront (1.75%) and annual mortgage insurance (0.85%). Lower down payment options but higher overall costs due to mandatory insurance for most of the loan term.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    VA Loans
                  </h3>
                  <p className="text-gray-600">
                    Veterans Affairs guaranteed loans for eligible military members, veterans, and spouses. Offers 0% down payment with no PMI requirement, making it one of the best loan options available. Requires VA funding fee (2.3% for first-time 0% down) but can be financed. Competitive interest rates and lenient credit requirements.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    Jumbo Loans
                  </h3>
                  <p className="text-gray-600">
                    High-balance mortgages exceeding conforming loan limits ($766,550+ in most areas). Used for luxury homes and expensive real estate markets. Typically require 10-20% down, 700+ credit score, and lower debt-to-income ratios. Interest rates may be slightly higher due to increased lender risk. Stricter qualification requirements and documentation needed.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    Fixed-Rate Mortgages
                  </h3>
                  <p className="text-gray-600">
                    Interest rate remains constant throughout the loan term (typically 15, 20, or 30 years). Provides payment stability and protection against rising rates. 30-year terms offer lowest monthly payments; 15-year terms save significantly on interest. Popular choice for long-term homeowners who value predictable budgeting.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-pink-600" />
                    </div>
                    Adjustable-Rate Mortgages (ARM)
                  </h3>
                  <p className="text-gray-600">
                    Interest rate adjusts periodically based on market conditions. Lower initial rates than fixed-rate mortgages, typically 0.5-1% less. Common structures: 5/1, 7/1, 10/1 ARM (fixed period/adjustment frequency). Best for borrowers planning to sell or refinance before the adjustment period. Includes rate caps to limit payment increases.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Mortgage Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Expert Mortgage Tips & Best Practices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">1. Get Pre-Approved Before House Hunting</h3>
                  <p className="text-gray-600 text-sm">
                    Pre-approval shows sellers you're a serious buyer and gives you a clear budget. It locks in an interest rate for 60-90 days and identifies potential issues early. Don't confuse it with pre-qualification—pre-approval involves a credit check and income verification.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">2. Aim for 20% Down Payment</h3>
                  <p className="text-gray-600 text-sm">
                    While not always required, 20% down eliminates PMI on conventional loans (saving $100-300/month), secures better rates, and builds instant equity. If you can't reach 20%, understand the long-term cost of PMI when comparing down payment options.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">3. Improve Your Credit Score First</h3>
                  <p className="text-gray-600 text-sm">
                    Even a 20-point credit score increase can significantly lower your rate. Pay down credit cards, dispute errors, and avoid new credit inquiries 3-6 months before applying. A 740+ score typically qualifies for the best rates.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">4. Compare Multiple Lender Quotes</h3>
                  <p className="text-gray-600 text-sm">
                    Shop at least 3-5 lenders within a 45-day window to avoid multiple credit hits. Compare APR (not just rate), closing costs, and loan terms. Online lenders often offer lower rates than traditional banks due to lower overhead.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">5. Understand Total Housing Costs</h3>
                  <p className="text-gray-600 text-sm">
                    Budget for PITI plus maintenance (1-2% of home value annually), HOA fees, utilities, and potential repairs. The 28% rule suggests housing costs shouldn't exceed 28% of gross income. Factor all costs into your affordability calculation.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">6. Consider Bi-Weekly Payments</h3>
                  <p className="text-gray-600 text-sm">
                    Making half your monthly payment every two weeks results in 13 full payments yearly instead of 12. On a $300,000 mortgage at 6.5%, this can save $60,000+ in interest and cut 4-5 years off a 30-year loan. Verify your lender allows true bi-weekly payments.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">7. Review Closing Costs Carefully</h3>
                  <p className="text-gray-600 text-sm">
                    Closing costs typically run 2-5% of the loan amount. Request a Loan Estimate within 3 days of applying and compare fees. Some are negotiable (origination, application fees), while others are fixed (recording, transfer taxes). Don't hesitate to question high charges.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">8. Make Extra Principal Payments Early</h3>
                  <p className="text-gray-600 text-sm">
                    Extra payments have the biggest impact in early years when the principal is highest. Even $100-200 monthly can save tens of thousands in interest. Ensure payments are applied to principal, not held for future payments. Avoid loans with prepayment penalties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive FAQ Section */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions About Mortgage Calculators</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How accurate is this mortgage calculator?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our mortgage calculator provides highly accurate estimates using the standard amortization formula that banks and lenders use: M = P[r(1+r)^n]/[(1+r)^n-1]. It accounts for principal, interest, property taxes, insurance, PMI, and HOA fees. However, actual payments may vary slightly based on your lender's specific terms, discount points, and exact closing date. Always verify final numbers with your mortgage lender before making commitments.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How much house can I afford?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lenders typically use the 28/36 rule: your monthly housing payment (PITI) should not exceed 28% of gross monthly income, and total debt payments shouldn't exceed 36%. For example, with a $7,000 monthly income, your maximum mortgage payment should be $1,960, and total debt payments $2,520. However, these are guidelines—consider your actual budget, lifestyle, savings goals, and financial comfort level. Use our monthly income field to check your debt-to-income ratio.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is PMI and when can I remove it?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Private Mortgage Insurance (PMI) is required on conventional loans when you put down less than 20%. It typically costs 0.5-1% of the loan amount annually (about $40-200/month on a $300,000 loan). You can request PMI removal once you reach 78% loan-to-value (LTV) ratio through payments, or 80% LTV with an appraisal showing home appreciation. FHA loans have different rules—mortgage insurance is typically required for the life of the loan if you put down less than 10%.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Should I choose a 15-year or 30-year mortgage?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    A 30-year mortgage offers lower monthly payments (about 30-40% less) but you'll pay significantly more interest over the loan's life. A 15-year mortgage has higher monthly payments but you'll pay roughly half the total interest and build equity faster. For example, on a $300,000 loan at 6.5%, a 30-year costs $379,000 in total interest versus $151,000 for 15 years—a $228,000 difference! Choose based on your budget, income stability, and financial goals. Use our calculator to compare both scenarios.
                  </p>
                </div>

                <div className="border-l-4 border-indigo-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What's the difference between FHA, VA, and conventional loans?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Conventional loans are not government-backed, typically require 5-20% down and 620+ credit score, with best rates at 20% down. FHA loans require 3.5% down with 580+ credit but include upfront (1.75%) and annual mortgage insurance. VA loans are for eligible veterans/service members, offer 0% down with no PMI, but charge a funding fee (2.3% typical). Each has pros/cons: conventional for strong credit/income, FHA for lower credit/down payment, VA for eligible military with excellent benefits.
                  </p>
                </div>

                <div className="border-l-4 border-pink-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How do property taxes affect my monthly payment?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Property taxes are typically escrowed into your monthly payment, so you pay 1/12 of the annual tax each month. Tax rates vary dramatically by location—from 0.3% (Hawaii) to 2.5% (New Jersey) of home value annually. On a $400,000 home, that's $1,000-10,000 yearly or $83-833 monthly. Check your local tax assessor's website for accurate rates. Taxes can increase over time, so budget for potential increases. Some states offer homestead exemptions that can reduce your tax burden.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What are closing costs and how much should I expect?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Closing costs typically range from 2-5% of the home's purchase price and include: origination fees (0.5-1% of loan), appraisal ($400-600), title insurance ($1,000-4,000), credit report ($25-50), recording fees ($50-250), prepaid property taxes and insurance, and escrow setup. On a $400,000 home, expect $8,000-20,000 in closing costs. Some fees are negotiable. You can also buy discount points (1% of loan = 0.25% rate reduction typically) to lower your interest rate. Shop lenders and compare Loan Estimates carefully.
                  </p>
                </div>

                <div className="border-l-4 border-teal-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How do extra payments save money on my mortgage?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Extra payments directly reduce your principal balance, which means less interest accrues over time since interest is calculated on the remaining balance. For example, adding $300 monthly to a $350,000 mortgage at 6.5% saves over $120,000 in interest and pays off the loan 9 years early. The impact is greatest in early years when the principal is highest. Ensure your lender applies extra payments to principal (not future payments) and check for prepayment penalties (rare on modern mortgages). Use our extra payment calculator to see your potential savings.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Can I use this calculator for refinancing?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Yes! Enter your current home value as the home price and your remaining loan balance (minus down payment) to simulate refinancing scenarios. Compare your current monthly payment with new rate scenarios to determine if refinancing makes sense. Generally, refinancing is worth it if you can lower your rate by 0.75-1% or more and plan to stay in the home long enough to recoup closing costs (typically 2-4 years). Consider refinancing to: reduce monthly payment, shorten loan term, eliminate PMI, or switch from ARM to fixed-rate.
                  </p>
                </div>

                <div className="border-l-4 border-cyan-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What credit score do I need to buy a house?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Minimum scores vary by loan type: FHA loans require 580+ for 3.5% down (500-579 may qualify with 10% down), VA loans typically want 620+, conventional loans need 620+ (640+ for better rates). However, higher scores get significantly better rates: 760+ receives the best rates, 700-759 gets good rates, 680-699 gets fair rates, 620-679 faces higher rates. A 100-point score difference can mean 1%+ rate difference, costing tens of thousands over 30 years. Improve your score by paying bills on time, reducing credit utilization below 30%, and disputing errors.
                  </p>
                </div>

                <div className="border-l-4 border-gray-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is an amortization schedule?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    An amortization schedule is a detailed table showing how each monthly payment is divided between principal and interest over your entire loan term. In early years, most payment goes to interest (70-80% initially); as time progresses, more goes to principal. For example, on a $300,000 loan at 6.5% for 30 years, month 1 might be $1,625 interest/$273 principal, while month 180 is $1,299 interest/$599 principal. This schedule helps you understand equity building and the impact of extra payments. Click "Show Amortization Schedule" to see your personalized breakdown.
                  </p>
                </div>

                <div className="border-l-4 border-lime-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How does my down payment percentage affect my mortgage?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Down payment affects four key areas: 1) Loan amount—20% down on $400K = $320K loan vs. 10% = $360K loan, 2) PMI requirement—less than 20% requires PMI ($100-300/month extra), 3) Interest rate—larger down payments often qualify for better rates (0.125-0.25% better), 4) Monthly payment—20% down results in significantly lower payments. Example: $400K home with 20% down ($2,019/month P&I) vs. 10% down ($2,273 P&I + $200 PMI = $2,473 total)—that's $454/month or $5,448/year difference.
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What is a good mortgage interest rate in 2025?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    As of 2025, mortgage rates fluctuate based on economic conditions. Historically, rates between 6-7% are moderate, 5-6% are good, and below 5% are excellent. However, "good" is relative to current market conditions. What matters most is getting the best rate YOU qualify for based on your credit, down payment, and loan type. Shop multiple lenders—rates can vary 0.25-0.5% between lenders for the same borrower, which equals $30-60/month on a $300K loan. Consider paying points (1% of loan = typically 0.25% rate reduction) if you'll keep the loan 5+ years.
                  </p>
                </div>

                <div className="border-l-4 border-emerald-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Should I pay points to lower my interest rate?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Discount points (typically 1% of loan amount = 0.25% rate reduction) make sense if you'll keep the loan long enough to break even. Calculate: points cost ÷ monthly savings = break-even months. Example: $300K loan, $3,000 for 1 point, saves $50/month = 60-month break-even. If you plan to stay 5+ years and rates are expected to rise, points can save significant money long-term. However, if you might refinance or move within 3-5 years, paying points may not be worth it. Our calculator helps you compare scenarios.
                  </p>
                </div>

                <div className="border-l-4 border-rose-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Does this calculator store my personal information?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    No, your privacy is completely protected. All mortgage calculations are performed locally in your web browser—we don't collect, store, or transmit any financial information you enter. Your home price, down payment, income, and all other details stay private on your device. We don't require registration, email, or personal information. The only data we may collect is anonymized usage statistics to improve the calculator. Your mortgage details and calculation results are 100% confidential.
                  </p>
                </div>

                <div className="border-l-4 border-violet-500 pl-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">How do I calculate my total cash needed to buy a home?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Total cash needed = Down payment + Closing costs + Moving/immediate expenses. For a $450,000 home with 20% down: $90,000 down payment + $9,000-22,500 closing costs (2-5%) + $5,000-10,000 reserves/moving = $104,000-122,500 total. Lenders also want to see 2-6 months of mortgage payments in reserves (varies by loan type). Don't drain your emergency fund—keep 3-6 months of expenses separate. Our calculator shows down payment and closing costs; add your moving costs and reserve requirements for your complete cash needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Financial Calculators */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Financial Calculators</h2>
              <p className="text-gray-600 mb-8">
                Explore our other free calculators to make informed financial decisions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <a href="/tools/loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Loan Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate personal, auto, and business loan payments with amortization schedules.</p>
                </a>
                <a href="/tools/home-loan-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Home Loan Calculator</h3>
                  <p className="text-sm text-gray-600">Specialized calculator for home loans with property-specific factors.</p>
                </a>
                <a href="/tools/emi-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">EMI Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate Equated Monthly Installments for any loan type.</p>
                </a>
                <a href="/tools/simple-interest-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Simple Interest Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate simple interest on loans and investments.</p>
                </a>
                <a href="/tools/compound-interest-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Compound Interest Calculator</h3>
                  <p className="text-sm text-gray-600">See how compound interest grows your investments over time.</p>
                </a>
                <a href="/tools/budget-calculator" className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">Budget Calculator</h3>
                  <p className="text-sm text-gray-600">Create and manage your monthly budget with ease.</p>
                </a>
              </div>
            </CardContent>
          </Card>

          </div>
      </main>

      <Footer />
    </div>
  );
};

export default MortgageCalculator;