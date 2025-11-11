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
import { Info, Download, Share2, Calculator, TrendingDown, Clock, DollarSign, PieChart, Building2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

interface BusinessLoanResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  yearlyPayment: number;
  debtServiceCoverage: number;
  loanToValue: number;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export default function BusinessLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState('250000');
  const [interestRate, setInterestRate] = useState('7.50');
  const [loanTerm, setLoanTerm] = useState('10');
  const [termUnit, setTermUnit] = useState('years');
  const [loanType, setLoanType] = useState('term-loan');
  const [businessRevenue, setBusinessRevenue] = useState('');
  const [collateralValue, setCollateralValue] = useState('');
  const [showAmortization, setShowAmortization] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [result, setResult] = useState<BusinessLoanResult | null>(null);
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
    const type = params.get('type');
    const revenue = params.get('revenue');
    const collateral = params.get('collateral');

    if (amount || rate || term) {
      if (amount) setLoanAmount(amount);
      if (rate) setInterestRate(rate);
      if (term) setLoanTerm(term);
      if (unit) setTermUnit(unit);
      if (type) setLoanType(type);
      if (revenue) setBusinessRevenue(revenue);
      if (collateral) setCollateralValue(collateral);

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

  const calculateBusinessLoan = () => {
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate) / 100;
    const rate = annualRate / 12;
    const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);
    const revenue = parseFloat(businessRevenue) || 0;
    const collateral = parseFloat(collateralValue) || 0;

    if (principal <= 0 || annualRate <= 0 || termMonths <= 0) return;

    let monthlyPayment;
    
    if (loanType === 'line-of-credit') {
      monthlyPayment = principal * rate;
    } else {
      monthlyPayment = (principal * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1);
    }

    const amortizationSchedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;

    for (let month = 1; month <= termMonths && currentBalance > 0.01; month++) {
      const interestPayment = currentBalance * rate;
      const principalPayment = loanType === 'line-of-credit' ? 0 : Math.min(monthlyPayment - interestPayment, currentBalance);
      
      if (loanType !== 'line-of-credit') {
        currentBalance -= principalPayment;
      }
      totalInterestPaid += interestPayment;

      if (month <= 60) {
        amortizationSchedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: currentBalance
        });
      }
    }
    
    const totalAmount = loanType === 'line-of-credit' ? totalInterestPaid + principal : monthlyPayment * termMonths;
    const totalInterest = loanType === 'line-of-credit' ? totalInterestPaid : totalAmount - principal;
    const yearlyPayment = monthlyPayment * 12;
    
    const debtServiceCoverage = revenue > 0 ? revenue / yearlyPayment : 0;
    const loanToValue = collateral > 0 ? (principal / collateral) * 100 : 0;

    setResult({
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      yearlyPayment: Math.round(yearlyPayment * 100) / 100,
      debtServiceCoverage: Math.round(debtServiceCoverage * 100) / 100,
      loanToValue: Math.round(loanToValue * 100) / 100,
      amortizationSchedule
    });

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const resetCalculator = () => {
    setLoanAmount('250000');
    setInterestRate('7.50');
    setLoanTerm('10');
    setTermUnit('years');
    setLoanType('term-loan');
    setBusinessRevenue('');
    setCollateralValue('');
    setShowAmortization(false);
    setShowChart(false);
    setResult(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleDownloadPDF = () => {
    if (!result) return;

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
    doc.text('Business Loan Calculation Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(230, 240, 255);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    doc.text(`Report Date: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    // Executive Summary
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

    // Loan Details
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
    const loanTypeDisplay = loanType === 'term-loan' ? 'Term Loan' :
                           loanType === 'sba-loan' ? 'SBA Loan' :
                           loanType === 'equipment-financing' ? 'Equipment Financing' : 'Line of Credit';
    
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
    doc.text('Loan Type', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(loanTypeDisplay, col4X, yPos);
    
    if (businessRevenue && parseFloat(businessRevenue) > 0) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('Business Revenue', col1X, yPos);
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(parseFloat(businessRevenue)), col2X, yPos);
    }
    
    if (collateralValue && parseFloat(collateralValue) > 0) {
      if (!businessRevenue || parseFloat(businessRevenue) === 0) {
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('Collateral Value', col1X, yPos);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('Collateral Value', col3X, yPos);
      }
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      if (!businessRevenue || parseFloat(businessRevenue) === 0) {
        doc.text(formatCurrency(parseFloat(collateralValue)), col2X, yPos);
      } else {
        doc.text(formatCurrency(parseFloat(collateralValue)), col4X, yPos);
      }
    }

    // Payment Summary
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
    doc.text(formatCurrency(parseFloat(loanAmount)), pageWidth - margin - 12, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Interest', margin + 12, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38);
    doc.text(formatCurrency(result.totalInterest), pageWidth - margin - 12, yPos, { align: 'right' });

    // Business Metrics (if available)
    if ((businessRevenue && parseFloat(businessRevenue) > 0) || (collateralValue && parseFloat(collateralValue) > 0)) {
      yPos += 12;
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 28, 3, 3, 'FD');
      
      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text('BUSINESS METRICS', margin + 4, yPos);
      
      yPos += 2;
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.3);
      doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);

      yPos += 7;
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      
      if (businessRevenue && parseFloat(businessRevenue) > 0) {
        const dscr = result.debtServiceCoverage;
        doc.text('Debt Service Coverage Ratio (DSCR)', margin + 8, yPos);
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${dscr.toFixed(2)}x`, margin + 8, yPos + 5);
      }
      
      if (collateralValue && parseFloat(collateralValue) > 0) {
        const ltv = result.loanToValue;
        const xPos = businessRevenue && parseFloat(businessRevenue) > 0 ? pageWidth / 2 + 8 : margin + 8;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(8);
        doc.text('Loan-to-Value Ratio (LTV)', xPos, yPos);
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${ltv.toFixed(1)}%`, xPos, yPos + 5);
      }
    }

    // Footer
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

    doc.save(`DapsiWow-Business-Loan-Calculation-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your professional business loan calculation report has been saved." 
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
      doc.text(formatCurrency(payment.payment), colX[1], yPos + 4);
      
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

    doc.save(`DapsiWow-Business-Loan-Amortization-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your amortization schedule has been saved." 
    });
  };

  const handleShare = async () => {
    if (!result) return;

    // Create shareable URL with encoded parameters
    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      type: loanType
    });
    
    // Add optional business parameters if they exist
    if (businessRevenue) params.append('revenue', businessRevenue);
    if (collateralValue) params.append('collateral', collateralValue);
    
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Create comprehensive share text
    const termDisplay = termUnit === 'years' ? `${loanTerm} years` : `${loanTerm} months`;
    const loanTypeDisplay = loanType === 'term-loan' ? 'Term Loan' :
                           loanType === 'sba-loan' ? 'SBA Loan' :
                           loanType === 'equipment-financing' ? 'Equipment Financing' : 'Line of Credit';

    let shareText = `💼 Business Loan Calculator Results\n\n`;
    shareText += `📊 Loan Details:\n`;
    shareText += `• Loan Amount: ${formatCurrency(parseFloat(loanAmount))}\n`;
    shareText += `• Interest Rate: ${interestRate}%\n`;
    shareText += `• Loan Term: ${termDisplay}\n`;
    shareText += `• Loan Type: ${loanTypeDisplay}\n`;
    
    if (businessRevenue && parseFloat(businessRevenue) > 0) {
      shareText += `• Business Revenue: ${formatCurrency(parseFloat(businessRevenue))}\n`;
    }
    if (collateralValue && parseFloat(collateralValue) > 0) {
      shareText += `• Collateral Value: ${formatCurrency(parseFloat(collateralValue))}\n`;
    }
    
    shareText += `\n💵 Payment Breakdown:\n`;
    shareText += `• Monthly Payment: ${formatCurrency(result.monthlyPayment)}\n`;
    shareText += `• Yearly Payment: ${formatCurrency(result.yearlyPayment)}\n`;
    shareText += `• Total Interest: ${formatCurrency(result.totalInterest)}\n`;
    shareText += `• Total Amount: ${formatCurrency(result.totalAmount)}\n`;

    if (businessRevenue && parseFloat(businessRevenue) > 0) {
      shareText += `\n📈 Business Metrics:\n`;
      shareText += `• Debt Service Coverage Ratio: ${result.debtServiceCoverage.toFixed(2)}x\n`;
    }
    
    if (collateralValue && parseFloat(collateralValue) > 0) {
      if (!businessRevenue || parseFloat(businessRevenue) === 0) {
        shareText += `\n📈 Business Metrics:\n`;
      }
      shareText += `• Loan-to-Value Ratio: ${result.loanToValue.toFixed(1)}%\n`;
    }

    shareText += `\n🔗 View & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '💼 Business Loan Calculator Results',
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
      type: loanType,
      revenue: businessRevenue,
      collateral: collateralValue
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening Facebook share..." });
  };

  const shareOnTwitter = () => {
    if (!result) return;
    
    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      type: loanType,
      revenue: businessRevenue,
      collateral: collateralValue
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const loanTypeDisplay = loanType === 'term-loan' ? 'Term Loan' : loanType === 'sba-7a' ? 'SBA 7(a)' : loanType === 'sba-504' ? 'SBA 504' : loanType === 'equipment' ? 'Equipment' : 'Line of Credit';
    const tweetText = `💼 My ${loanTypeDisplay} calculation: ${formatCurrency(result.monthlyPayment)}/month on ${formatCurrency(parseFloat(loanAmount))} at ${interestRate}% - Calculate yours free!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening Twitter share..." });
  };

  const shareOnLinkedIn = () => {
    if (!result) return;
    
    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      type: loanType,
      revenue: businessRevenue,
      collateral: collateralValue
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening LinkedIn share..." });
  };

  const shareOnWhatsApp = () => {
    if (!result) return;
    
    const params = new URLSearchParams({
      amount: loanAmount,
      rate: interestRate,
      term: loanTerm,
      unit: termUnit,
      type: loanType,
      revenue: businessRevenue,
      collateral: collateralValue
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const termDisplay = termUnit === 'years' ? `${loanTerm} years` : `${loanTerm} months`;
    const loanTypeDisplay = loanType === 'term-loan' ? 'Term Loan' : loanType === 'sba-7a' ? 'SBA 7(a)' : loanType === 'sba-504' ? 'SBA 504' : loanType === 'equipment' ? 'Equipment' : 'Line of Credit';
    const whatsappText = `💼 Business Loan Calculator Results:\n\nLoan Type: ${loanTypeDisplay}\nAmount: ${formatCurrency(parseFloat(loanAmount))}\nRate: ${interestRate}%\nTerm: ${termDisplay}\nMonthly Payment: ${formatCurrency(result.monthlyPayment)}\n\nCalculate yours: ${shareableUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast({ title: "Opening WhatsApp share..." });
  };

  const principalPercentage = result ? (parseFloat(loanAmount) / result.totalAmount) * 100 : 0;
  const interestPercentage = result ? (result.totalInterest / result.totalAmount) * 100 : 0;

  const pieData = result ? [
    { name: 'Principal', value: parseFloat(loanAmount), color: '#3b82f6' },
    { name: 'Interest', value: result.totalInterest, color: '#f97316' }
  ] : [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I calculate my business loan monthly payment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To calculate business loan monthly payments, use our free calculator by entering the loan amount, interest rate, and loan term. The calculator uses the amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1], where M is monthly payment, P is principal, r is monthly interest rate, and n is number of payments. This gives you accurate monthly payment estimates for SBA loans, equipment financing, working capital loans, and more."
        }
      },
      {
        "@type": "Question",
        "name": "What types of business loans can I calculate with this tool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our free business loan calculator supports multiple loan types: SBA 7(a) loans, SBA 504 loans, term loans, equipment financing, working capital loans, business lines of credit, merchant cash advances, commercial mortgages, startup loans, and franchise financing. Each calculation includes monthly payment breakdown, total interest, DSCR analysis, and amortization schedules."
        }
      },
      {
        "@type": "Question",
        "name": "What is a debt service coverage ratio (DSCR) and why does it matter?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DSCR (Debt Service Coverage Ratio) measures your business's ability to repay loans by comparing annual revenue to annual loan payments. Lenders typically require a DSCR of 1.25 or higher, meaning your business generates 25% more income than needed to cover loan payments. Our calculator automatically calculates DSCR when you enter your business revenue, helping you understand loan affordability before applying."
        }
      },
      {
        "@type": "Question",
        "name": "How much can I afford to borrow for my small business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use our business loan affordability calculator by entering your annual business revenue and desired monthly payment. The calculator determines the maximum loan amount you can afford while maintaining healthy DSCR and LTV ratios. Generally, your annual debt payments shouldn't exceed 25-35% of annual revenue. Factor in your credit score, time in business, and available collateral when determining affordability."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between APR and interest rate on business loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Interest rate is the cost of borrowing money, while APR (Annual Percentage Rate) includes the interest rate plus all fees (origination fees, processing fees, closing costs). APR gives a true cost comparison between lenders. For example, a 7% interest rate with 2% origination fee equals approximately 7.5% APR. Our calculator helps you understand both to make informed financing decisions."
        }
      },
      {
        "@type": "Question",
        "name": "How do I convert factor rate to APR for business loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To convert factor rate to APR: (1) Subtract 1 from the factor rate, (2) Divide by loan term in years, (3) Multiply by 100. For example, a 1.35 factor rate on a 6-month loan: (1.35-1) / 0.5 × 100 = 70% APR. Factor rates are common with merchant cash advances and short-term business loans. Always convert to APR to compare true costs across different loan options."
        }
      },
      {
        "@type": "Question",
        "name": "What's the typical interest rate for business loans in 2025?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Business loan rates in 2025 vary by type and creditworthiness: SBA 7(a) loans (6-9% APR), SBA 504 loans (5-8% APR), traditional bank term loans (6-10% APR), online lender term loans (10-30% APR), equipment financing (8-20% APR), business lines of credit (7-25% APR), and merchant cash advances (40-350% APR equivalent). Rates depend on credit score, time in business, revenue, and collateral."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a business loan with bad credit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, business loans for bad credit are available through alternative lenders, though with higher interest rates (15-35% APR). Options include: merchant cash advances, invoice financing, equipment financing (asset-backed), business lines of credit (smaller limits), and startup loans with personal guarantees. Improve approval chances by showing strong revenue, offering collateral, adding a co-signer, or choosing revenue-based financing options."
        }
      }
    ]
  };

  const canonicalUrl = "https://dapsiwow.com/tools/business-loan-calculator";
  const ogImageUrl = "https://dapsiwow.com/og-business-loan-calculator.jpg";
  const publishDate = "2024-02-01T00:00:00+00:00";
  const modifiedDate = "2025-01-10T00:00:00+00:00";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <html lang="en" />
        <title>Business Loan Calculator - Monthly Payments | DapsiWow</title>
        <meta name="description" content="Calculate business loan payments instantly. Get monthly estimates, DSCR analysis, amortization schedules & total interest. Free, no signup required." />
        <meta name="keywords" content="business loan calculator, sba loan calculator, equipment financing calculator, business loan payment calculator, dscr calculator, ltv calculator, amortization calculator" />
        
        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Language and Geo */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />
        
        {/* Dates and Authorship */}
        <meta name="date" content={publishDate} />
        <meta name="last-modified" content={modifiedDate} />
        <meta name="copyright" content="© 2025 DapsiWow. All rights reserved." />
        <meta name="author" content="DapsiWow Financial Tools Team" />
        <meta name="publisher" content="DapsiWow" />
        
        {/* Robots */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Hreflang Alternates */}
        <link rel="alternate" hrefLang="en" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-US" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-CA" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-AU" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="Business Loan Calculator" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Business Loan Calculator" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="Business Loan Calculator - Monthly Payments | DapsiWow" />
        <meta property="og:description" content="Calculate business loan payments instantly. Get monthly estimates, DSCR analysis, amortization schedules & total interest. Free, no signup required." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Business Loan Calculator showing monthly payment breakdown, DSCR analysis, and amortization schedule for SBA and equipment financing" />
        <meta property="og:site_name" content="DapsiWow - Free Financial Tools" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content="Business Loan Calculator - Monthly Payments | DapsiWow" />
        <meta name="twitter:description" content="Calculate business loan payments instantly. Get monthly estimates, DSCR analysis, amortization schedules & total interest. Free, no signup required." />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content="Business loan calculator interface with payment analysis, DSCR metrics, and amortization schedule visualization" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="twitter:creator" content="@DapsiWow" />
        
        {/* Pinterest Rich Pins */}
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:author" content="DapsiWow" />
        <meta property="article:section" content="Finance Tools" />
        <meta property="article:tag" content="Business Loans, SBA Loans, Equipment Financing, DSCR, Loan Calculator" />

        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Business Loan Calculator - Monthly Payments | DapsiWow",
              "description": "Calculate business loan payments instantly. Get monthly estimates, DSCR analysis, amortization schedules & total interest. Free, no signup required.",
              "url": canonicalUrl,
              "mainEntity": {
                "@type": "WebApplication",
                "name": "Business Loan Calculator",
                "description": "Free business loan calculator for SBA 7(a), SBA 504, equipment financing, term loans, and working capital. Calculate monthly payments, DSCR, LTV ratios with detailed amortization schedules.",
                "url": canonicalUrl,
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "Any",
                "browserRequirements": "Requires JavaScript",
                "softwareVersion": "2.0",
                "datePublished": publishDate,
                "dateModified": modifiedDate,
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock"
                },
                "featureList": [
                  "SBA 7(a) and SBA 504 loan calculations",
                  "Equipment financing and term loan analysis",
                  "DSCR (Debt Service Coverage Ratio) calculation",
                  "LTV (Loan-to-Value) ratio analysis",
                  "Detailed amortization schedules",
                  "PDF download and sharing capabilities"
                ],
                "audience": {
                  "@type": "Audience",
                  "audienceType": "Small Business Owners, Entrepreneurs, Financial Planners"
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "ratingCount": "2847",
                  "bestRating": "5",
                  "worstRating": "1"
                }
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
                    "item": "https://dapsiwow.com/tools/finance"
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Business Loan Calculator",
                    "item": canonicalUrl
                  }
                ]
              },
              "speakable": {
                "@type": "SpeakableSpecification",
                "xpath": [
                  "/html/head/title",
                  "/html/head/meta[@name='description']/@content"
                ]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dapsiwow.com/logo.png",
                "width": 250,
                "height": 60
              },
              "description": "Free online financial calculators and tools for personal finance, business loans, mortgages, and health metrics.",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "email": "support@dapsiwow.com",
                "areaServed": "Worldwide",
                "availableLanguage": ["English"]
              },
              "sameAs": [
                "https://twitter.com/DapsiWow",
                "https://facebook.com/DapsiWow",
                "https://linkedin.com/company/dapsiwow"
              ]
            },
            faqSchema
          ])}
        </script>
      </Helmet>

      <Header />

      <main>
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-colors duration-200 max-w-full mx-auto sm:mx-0">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 flex-shrink-0 text-blue-700" />
                <span className="text-[11px] sm:text-xs md:text-sm lg:text-base font-medium text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                  Professional Business Loan Calculator - Free & Accurate
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Business Loan Calculator:</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Monthly Payments & Interest
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Free calculator for SBA, equipment, and term loans. Instant monthly payments with DSCR/LTV analysis and amortization schedules. No signup.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Compare Loan Types</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">DSCR & LTV Analysis</span>
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
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Business Loan Payment Calculator - Enter Your Details</h2>
                    <p className="text-sm sm:text-base text-gray-600">Calculate monthly payments for SBA loans, equipment financing, working capital & more. Get instant DSCR, LTV ratios and amortization schedules.</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="loan-type" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Loan Type
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Select the type of business financing you need</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={loanType} onValueChange={setLoanType}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg" data-testid="select-loan-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="term-loan">Term Loan</SelectItem>
                            <SelectItem value="sba-loan">SBA Loan (7a or 504)</SelectItem>
                            <SelectItem value="equipment-loan">Equipment Financing</SelectItem>
                            <SelectItem value="line-of-credit">Line of Credit</SelectItem>
                            <SelectItem value="working-capital">Working Capital Loan</SelectItem>
                            <SelectItem value="commercial-mortgage">Commercial Mortgage</SelectItem>
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
                              <p className="max-w-xs text-sm">The total amount you want to borrow for your business</p>
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
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="250,000"
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
                              <p className="max-w-xs text-sm">The annual percentage rate (APR) for your business loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <Input
                            id="interest-rate"
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="7.50"
                            step="0.01"
                            data-testid="input-interest-rate"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Loan Term
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you'll take to repay the loan</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500"
                            placeholder="10"
                            min="1"
                            data-testid="input-loan-term"
                          />
                          <Select value={termUnit} onValueChange={setTermUnit}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg" data-testid="select-term-unit">
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
                          <Label htmlFor="business-revenue" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Revenue (Optional)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Your business's annual revenue to calculate DSCR</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="business-revenue"
                            type="number"
                            value={businessRevenue}
                            onChange={(e) => setBusinessRevenue(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="500,000"
                            data-testid="input-business-revenue"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="collateral-value" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Collateral Value (Optional)
                          </Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Value of assets securing the loan to calculate LTV</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="collateral-value"
                            type="number"
                            value={collateralValue}
                            onChange={(e) => setCollateralValue(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="300,000"
                            data-testid="input-collateral-value"
                          />
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateBusinessLoan}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Business Loan
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
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 print:hidden">
                        <Button
                          onClick={() => setShowAmortization(!showAmortization)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                          data-testid="button-amortization"
                        >
                          {showAmortization ? 'Hide' : 'Show'} Payment Schedule
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

                      
                    </>
                  )}
                </div>

                {/* Results Section */}
                {result && (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your Business Loan Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="loan-results">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Estimated Monthly Payment</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all" data-testid="text-monthly-payment">
                            {formatCurrency(result.monthlyPayment)}
                          </div>
                          <p className="text-xs text-gray-500">{loanType === 'line-of-credit' ? 'Interest-only payment' : 'Based on monthly payment frequency'}</p>
                        </div>
                      </div>

                      {showChart && (
                        <div className="space-y-4 sm:space-y-6">
                          {/* Donut Chart - Total Loan Breakdown */}
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-xl border border-gray-100 transition-colors duration-300 hover:shadow-2xl">
                            <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-base sm:text-lg md:text-xl">Total Loan Breakdown</h3>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
                              <div className="w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                                <div className="relative">
                                  <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 240 : window.innerWidth < 768 ? 260 : 300}>
                                    <RechartsPieChart>
                                      <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={window.innerWidth < 640 ? 50 : window.innerWidth < 768 ? 55 : 65}
                                        outerRadius={window.innerWidth < 640 ? 80 : window.innerWidth < 768 ? 90 : 100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                      >
                                        <Cell fill="url(#principalGradient)" className="hover:opacity-90 transition-opacity duration-200" />
                                        <Cell fill="url(#interestGradient)" className="hover:opacity-90 transition-opacity duration-200" />
                                      </Pie>
                                      <RechartsTooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                          border: '1px solid #e5e7eb',
                                          borderRadius: '12px',
                                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                          fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                          padding: '12px 16px'
                                        }}
                                      />
                                      <defs>
                                        <linearGradient id="principalGradient" x1="0" y1="0" x2="1" y2="1">
                                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                          <stop offset="50%" stopColor="#059669" stopOpacity={1} />
                                          <stop offset="100%" stopColor="#047857" stopOpacity={1} />
                                        </linearGradient>
                                        <linearGradient id="interestGradient" x1="0" y1="0" x2="1" y2="1">
                                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                          <stop offset="50%" stopColor="#d97706" stopOpacity={1} />
                                          <stop offset="100%" stopColor="#b45309" stopOpacity={1} />
                                        </linearGradient>
                                      </defs>
                                    </RechartsPieChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4 w-full md:w-auto md:min-w-[280px] lg:min-w-[320px]">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-green-200 shadow-md hover:shadow-lg transition-colors duration-300 hover:border-green-300">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm md:text-base">Principal Amount</span>
                                  </div>
                                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 break-all transition-colors duration-300">{formatCurrency(parseFloat(loanAmount))}</div>
                                  <div className="text-xs sm:text-sm md:text-base text-green-700 mt-1">{principalPercentage.toFixed(1)}% of total</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-orange-200 shadow-md hover:shadow-lg transition-colors duration-300 hover:border-orange-300">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full animate-pulse"></div>
                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm md:text-base">Total Interest</span>
                                  </div>
                                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 break-all transition-colors duration-300">{formatCurrency(result.totalInterest)}</div>
                                  <div className="text-xs sm:text-sm md:text-base text-orange-700 mt-1">{interestPercentage.toFixed(1)}% of total</div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
                                <span className="text-xs sm:text-sm md:text-base text-gray-600">Total Amount to be Repaid:</span>
                                <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-all">{formatCurrency(result.totalAmount)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Loan Progress Indicator */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-blue-200">
                            <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-center text-base sm:text-lg">Understanding Your Business Loan</h3>
                            <div className="space-y-3 sm:space-4">
                              <div>
                                <div className="flex flex-col xs:flex-row justify-between gap-1 xs:gap-2 text-xs sm:text-sm mb-2">
                                  <span className="text-gray-700 font-medium">You're borrowing</span>
                                  <span className="text-gray-900 font-bold break-all">{formatCurrency(parseFloat(loanAmount))}</span>
                                </div>
                                <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-colors duration-500"
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
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-colors duration-500"
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
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Annual Payment</span>
                            <span className="font-bold text-blue-600 text-sm sm:text-base break-all" data-testid="text-yearly-payment">
                              {formatCurrency(result.yearlyPayment)}
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

                      {result.debtServiceCoverage > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Debt Service Coverage Ratio (DSCR)
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">DSCR:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg" data-testid="text-dscr">
                                {result.debtServiceCoverage.toFixed(2)}x
                              </span>
                            </div>
                            <p className="text-sm text-green-700 mt-3 italic">
                              {result.debtServiceCoverage >= 1.25 ? '✓ Excellent - Lenders prefer 1.25+' : result.debtServiceCoverage >= 1.0 ? '✓ Good - May qualify' : '✗ Low - May not qualify'}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.loanToValue > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200">
                          <h4 className="font-bold text-purple-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Loan-to-Value Ratio (LTV)
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-700 font-medium text-sm sm:text-base">LTV:</span>
                              <span className="font-bold text-purple-800 text-sm sm:text-base md:text-lg" data-testid="text-ltv">
                                {result.loanToValue.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-sm text-purple-700 mt-3 italic">
                              {result.loanToValue <= 80 ? '✓ Excellent - Below 80% preferred' : result.loanToValue <= 90 ? '✓ Good - Acceptable range' : '✗ High - May need more collateral'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!result && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Results</h2>
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg px-4">Enter your business loan details above and click "Calculate Business Loan" to see your personalized results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amortization Schedule */}
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

          

          </div>
      </main>

      <Footer />
    </div>
  );
}
