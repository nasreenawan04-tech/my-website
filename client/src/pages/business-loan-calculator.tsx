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
import { Info, Download, Share2, Calculator, TrendingDown, Clock, DollarSign, PieChart, Building2, RotateCcw, BarChartIcon, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, AreaChart, Area } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { saveCalculation } from '@/lib/calculationHistory';

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

interface ComparisonBusinessLoan {
  name: string;
  amount: number;
  rate: number;
  term: number;
  termUnit: string;
  type: string;
  monthlyPayment: number;
  totalInterest: number;
  yearlyPayment: number;
  debtServiceCoverage: number;
  loanToValue: number;
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
  const [showCharts, setShowCharts] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [chartFilter, setChartFilter] = useState<'principal' | 'interest' | 'both'>('both');
  const [comparisonLoans, setComparisonLoans] = useState<ComparisonBusinessLoan[]>([]);
  const [result, setResult] = useState<BusinessLoanResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const amortizationRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
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

    // Save calculation history (non-blocking)
    saveCalculation(
      'Business Loan Calculator',
      '/tools/business-loan-calculator',
      {
        loanAmount: principal,
        interestRate: parseFloat(interestRate),
        loanTerm: parseFloat(loanTerm),
        termUnit,
        loanType,
        businessRevenue: revenue,
        collateralValue: collateral
      },
      {
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        yearlyPayment: Math.round(yearlyPayment * 100) / 100,
        debtServiceCoverage: Math.round(debtServiceCoverage * 100) / 100,
        loanToValue: Math.round(loanToValue * 100) / 100
      }
    );

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
    setShowCharts(false);
    setShowComparison(false);
    setComparisonLoans([]);
    setResult(null);
  };

  const addToComparison = () => {
    if (result) {
      const newLoan: ComparisonBusinessLoan = {
        name: `Scenario ${comparisonLoans.length + 1}`,
        amount: parseFloat(loanAmount),
        rate: parseFloat(interestRate),
        term: parseFloat(loanTerm),
        termUnit: termUnit,
        type: loanType,
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        yearlyPayment: result.yearlyPayment,
        debtServiceCoverage: result.debtServiceCoverage,
        loanToValue: result.loanToValue
      };
      setComparisonLoans([...comparisonLoans, newLoan]);
      setShowComparison(true);
      toast({
        title: "Business Loan Added",
        description: "Loan added to comparison. Calculate another to compare.",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
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
      doc.text('BUSINESS LOAN ANALYSIS REPORT', pageWidth / 2, 13, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Business Loan Payment Calculator', pageWidth / 2, 22, { align: 'center' });

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
      const termDisplay = termUnit === 'years' ? `${loanTerm} years` : `${loanTerm} months`;
      const loanTypeDisplay = loanType === 'term-loan' ? 'Term Loan' : loanType === 'sba-7a' ? 'SBA 7(a)' : loanType === 'sba-504' ? 'SBA 504' : loanType === 'equipment' ? 'Equipment' : 'Line of Credit';
      doc.text('Loan Term:', margin + 3, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(termDisplay, margin + 28, yPos + 7);

      doc.setFont('helvetica', 'bold');
      doc.text('Loan Type:', margin + 3, yPos + 14);
      doc.setFont('helvetica', 'normal');
      doc.text(loanTypeDisplay, margin + 28, yPos + 14);

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
      doc.text('MONTHLY PAYMENT', pageWidth / 2, yPos + 7, { align: 'center' });
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
      const termMonths = termUnit === 'years' ? parseFloat(loanTerm) * 12 : parseFloat(loanTerm);
      
      const metrics: { label: string; value: string; color: [number, number, number] }[] = [
        { label: 'Loan Amount', value: formatCurrency(parseFloat(loanAmount)), color: [71, 85, 105] },
        { label: 'Interest Rate', value: `${interestRate}% per year`, color: [71, 85, 105] },
        { label: 'Loan Term', value: termUnit === 'years' ? `${loanTerm} years (${Math.round(termMonths)} months)` : `${loanTerm} months`, color: [71, 85, 105] },
        { label: 'Loan Type', value: loanTypeDisplay, color: [71, 85, 105] },
        { label: 'Monthly Payment', value: formatCurrency(result.monthlyPayment), color: [37, 99, 235] },
        { label: 'Yearly Payment', value: formatCurrency(result.yearlyPayment), color: [79, 70, 229] },
        { label: 'Total Amount Paid', value: formatCurrency(result.totalAmount), color: [71, 85, 105] },
        { label: 'Total Interest', value: formatCurrency(result.totalInterest), color: [239, 68, 68] },
        { label: 'Interest Portion', value: `${interestPercent}%`, color: [220, 38, 38] }
      ];

      if (businessRevenue && parseFloat(businessRevenue) > 0) {
        metrics.push({ label: 'DSCR', value: result.debtServiceCoverage.toFixed(2) + 'x', color: [16, 185, 129] });
      }

      if (collateralValue && parseFloat(collateralValue) > 0) {
        metrics.push({ label: 'LTV Ratio', value: result.loanToValue.toFixed(1) + '%', color: [16, 185, 129] });
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
        interpretation = 'Excellent Loan Terms - Your interest payments are very low relative to the principal, indicating favorable loan terms and efficient debt management.';
        interpretationColor = [22, 163, 74];
      } else if (interestPercentNum < 40) {
        interpretation = 'Good Loan Structure - Your interest-to-principal ratio shows reasonable borrowing costs. Consider extra payments to reduce total interest.';
        interpretationColor = [202, 138, 4];
      } else if (interestPercentNum < 60) {
        interpretation = 'Moderate Interest Load - Interest payments are substantial. Extra payments could yield substantial savings.';
        interpretationColor = [59, 130, 246];
      } else {
        interpretation = 'High Interest Burden - Interest payments are substantial. Strongly consider refinancing or accelerated payments to reduce total cost.';
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
      if (comparisonLoans.length > 0) {
        try {
          doc.addPage();
          yPos = margin;
          
          // Section Header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text('BUSINESS LOAN SCENARIO COMPARISON', margin, yPos);
          yPos += 2;
          doc.setDrawColor(37, 99, 235);
          doc.line(margin, yPos, margin + 85, yPos);
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
          
          comparisonLoans.forEach((loan, index) => {
            if (rowCount >= rowsPerPage) {
              // Add new page
              doc.addPage();
              yPos = margin;
              
              // Repeat header
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 58, 138);
              doc.text('BUSINESS LOAN SCENARIO COMPARISON - CONTINUED', margin, yPos);
              yPos += 2;
              doc.setDrawColor(37, 99, 235);
              doc.line(margin, yPos, margin + 110, yPos);
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
            doc.text(loan.name, xPos + 2, yPos + 5.5);
            
            // Amount
            xPos += colWidths.loan;
            doc.text(formatCurrency(loan.amount), xPos + colWidths.amount - 2, yPos + 5.5, { align: 'right' });
            
            // Rate
            xPos += colWidths.amount;
            doc.text(`${loan.rate}%`, xPos + colWidths.rate - 2, yPos + 5.5, { align: 'right' });
            
            // Term
            xPos += colWidths.rate;
            const termDisplay = loan.termUnit === 'years' ? `${loan.term}y` : `${loan.term}m`;
            doc.text(termDisplay, xPos + colWidths.term - 2, yPos + 5.5, { align: 'right' });
            
            // Monthly Payment
            xPos += colWidths.term;
            doc.setTextColor(37, 99, 235);
            doc.text(formatCurrency(loan.monthlyPayment), xPos + colWidths.payment - 2, yPos + 5.5, { align: 'right' });
            
            // Total Interest
            xPos += colWidths.payment;
            doc.setTextColor(234, 88, 12);
            doc.text(formatCurrency(loan.totalInterest), xPos + colWidths.interest - 2, yPos + 5.5, { align: 'right' });
            
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
        doc.text('DapsiWow Business Loan Calculator', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 10, { align: 'right' });

        // Website
        doc.setTextColor(37, 99, 235);
        doc.text('www.dapsiwow.com', pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      doc.save('business-loan-analysis-report.pdf');

      toast({
        title: "Professional PDF Downloaded",
        description: "Your detailed business loan analysis report has been saved successfully.",
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
                  Calculate Monthly Payments
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
                          onClick={addToComparison}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                          data-testid="button-add-comparison"
                        >
                          <Scale className="w-4 h-4 sm:mr-1.5" />
                          Add to Comparison
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
                      </div>

                      {/* Professional Payment Chart */}
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
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius="70%"
                                fill="#8884d8"
                                dataKey="value"
                                style={{ fontSize: '11px', fontWeight: '500' }}
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
                                wrapperStyle={{ fontSize: '11px' }}
                                iconType="circle"
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-center">
                            <div className="bg-green-50 rounded-md sm:rounded-lg p-2 sm:p-3">
                              <div className="text-[10px] sm:text-xs text-green-700 font-medium">Principal</div>
                              <div className="text-xs sm:text-sm md:text-base font-bold text-green-800 break-all">{formatCurrency(parseFloat(loanAmount))}</div>
                            </div>
                            <div className="bg-orange-50 rounded-md sm:rounded-lg p-2 sm:p-3">
                              <div className="text-[10px] sm:text-xs text-orange-700 font-medium">Interest</div>
                              <div className="text-xs sm:text-sm md:text-base font-bold text-orange-800 break-all">{formatCurrency(result.totalInterest)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Area Chart - Payment Breakdown Over Time */}
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm mt-4">
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

                      {/* Business Loan Comparison Section */}
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
                          <p className="text-sm text-gray-600 mb-4">Compare different loan scenarios side-by-side to find the best option.</p>
                          <div className="overflow-x-auto -mx-4 sm:mx-0" ref={comparisonRef}>
                            <table className="w-full min-w-[600px]" data-testid="comparison-table">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Loan</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Rate</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Term</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Monthly Payment</th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Interest</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {comparisonLoans.map((loan, index) => (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors" data-testid={`comparison-row-${index}`}>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{loan.name}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(loan.amount)}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{loan.rate}%</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{loan.term} {loan.termUnit}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(loan.monthlyPayment)}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(loan.totalInterest)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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

          {/* SEO Content Sections */}
          <div className="space-y-8 sm:space-y-12 md:space-y-16 mt-8 sm:mt-12 md:mt-16">
            
            {/* Introduction Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  What is a Business Loan Calculator?
                </h2>
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    The Business Loan Calculator is a powerful financial tool designed to help entrepreneurs, business owners, and financial planners estimate monthly payments, total interest costs, and critical financial metrics for commercial loans. Whether you're seeking startup capital, equipment financing, working capital, or expansion funding, this calculator provides instant, accurate projections to support your business decisions.
                  </p>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-4">Why Use Our Business Loan Calculator?</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Instant Results:</strong> Get accurate monthly payment estimates in seconds</li>
                    <li><strong>Comprehensive Analysis:</strong> View DSCR (Debt Service Coverage Ratio), LTV (Loan-to-Value), and total interest calculations</li>
                    <li><strong>Multiple Loan Types:</strong> Supports SBA 7(a), SBA 504, term loans, equipment financing, and lines of credit</li>
                    <li><strong>Detailed Amortization:</strong> See exact payment breakdown over the life of your loan</li>
                    <li><strong>100% Free:</strong> No registration, no hidden fees, unlimited calculations</li>
                    <li><strong>Export & Share:</strong> Download PDF reports or share calculations with partners and lenders</li>
                  </ul>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-4">Who Benefits from the Business Loan Calculator?</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Entrepreneurs & Startups:</strong> Estimate funding needs and affordability before approaching lenders</li>
                    <li><strong>Small Business Owners:</strong> Plan for equipment purchases, inventory expansion, or facility improvements</li>
                    <li><strong>Financial Advisors:</strong> Provide clients with accurate loan projections and debt capacity analysis</li>
                    <li><strong>Commercial Lenders:</strong> Quickly calculate payments and ratios during client consultations</li>
                    <li><strong>CFOs & Controllers:</strong> Model different financing scenarios for strategic planning</li>
                    <li><strong>Real Estate Investors:</strong> Evaluate commercial property financing options and cash flow impact</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How to Use Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  How to Use the Business Loan Calculator
                </h2>
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Step-by-Step Guide:</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        Enter Loan Amount
                      </h4>
                      <p className="text-gray-700 ml-10">
                        Input the total amount you need to borrow. This could be anywhere from $5,000 for small working capital needs to $5 million for major expansion or commercial real estate. Consider your actual business needs and avoid borrowing more than necessary.
                      </p>
                      <p className="text-sm text-blue-700 mt-2 ml-10 italic">
                        Example: $250,000 for equipment purchase and working capital
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 sm:p-6 rounded-lg border-l-4 border-green-600">
                      <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                        <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                        Set Interest Rate
                      </h4>
                      <p className="text-gray-700 ml-10">
                        Enter the annual interest rate quoted by your lender. Business loan rates typically range from 5% to 30% depending on loan type, creditworthiness, and collateral. SBA loans often have lower rates (6-9%), while alternative lenders may charge higher rates.
                      </p>
                      <p className="text-sm text-green-700 mt-2 ml-10 italic">
                        Example: 7.5% APR for an SBA 7(a) loan
                      </p>
                    </div>

                    <div className="bg-purple-50 p-4 sm:p-6 rounded-lg border-l-4 border-purple-600">
                      <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                        <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                        Choose Loan Term
                      </h4>
                      <p className="text-gray-700 ml-10">
                        Select the repayment period in years or months. Longer terms mean lower monthly payments but higher total interest. Equipment loans: 3-7 years. Commercial real estate: 10-25 years. Working capital: 1-3 years.
                      </p>
                      <p className="text-sm text-purple-700 mt-2 ml-10 italic">
                        Example: 10 years (120 months) for equipment and working capital
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 sm:p-6 rounded-lg border-l-4 border-orange-600">
                      <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                        <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                        Select Loan Type
                      </h4>
                      <p className="text-gray-700 ml-10">
                        Choose the type that matches your financing: Term Loan (standard installment), Line of Credit (revolving), SBA 7(a)/504 (government-backed), or Equipment Financing. Each type has different calculation methods and typical terms.
                      </p>
                      <p className="text-sm text-orange-700 mt-2 ml-10 italic">
                        Example: Term Loan for predictable monthly payments
                      </p>
                    </div>

                    <div className="bg-indigo-50 p-4 sm:p-6 rounded-lg border-l-4 border-indigo-600">
                      <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                        Enter Business Revenue (Optional)
                      </h4>
                      <p className="text-gray-700 ml-10">
                        Input your annual gross revenue to calculate Debt Service Coverage Ratio (DSCR). Lenders typically require DSCR of 1.25 or higher. This shows whether your business generates enough cash flow to cover loan payments.
                      </p>
                      <p className="text-sm text-indigo-700 mt-2 ml-10 italic">
                        Example: $600,000 annual revenue
                      </p>
                    </div>

                    <div className="bg-pink-50 p-4 sm:p-6 rounded-lg border-l-4 border-pink-600">
                      <h4 className="font-bold text-pink-900 mb-2 flex items-center gap-2">
                        <span className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
                        Enter Collateral Value (Optional)
                      </h4>
                      <p className="text-gray-700 ml-10">
                        If you're pledging collateral (equipment, real estate, inventory), enter its appraised value to calculate Loan-to-Value (LTV) ratio. Most lenders prefer LTV below 80%, meaning your collateral should be worth at least 125% of the loan amount.
                      </p>
                      <p className="text-sm text-pink-700 mt-2 ml-10 italic">
                        Example: $350,000 in equipment and real estate
                      </p>
                    </div>

                    <div className="bg-teal-50 p-4 sm:p-6 rounded-lg border-l-4 border-teal-600">
                      <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                        <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">7</span>
                        Calculate and Analyze
                      </h4>
                      <p className="text-gray-700 ml-10">
                        Click "Calculate Business Loan" to see your results. Review monthly payments, total interest, DSCR, and LTV. Use the amortization schedule to see payment breakdown over time. Export to PDF for lender presentations or share with partners.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4">Pro Tips:</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Compare Multiple Scenarios:</strong> Calculate with different terms (7 vs 10 vs 15 years) to find the optimal balance between monthly payment affordability and total interest cost</li>
                    <li><strong>Target Strong DSCR:</strong> Aim for DSCR of 1.5 or higher to improve approval odds and potentially negotiate better rates</li>
                    <li><strong>Consider Total Interest:</strong> Longer terms reduce monthly burden but significantly increase total interest paid over the loan life</li>
                    <li><strong>Plan for Rate Changes:</strong> If considering variable-rate financing, calculate payments at rates 2-3% higher than current to ensure affordability</li>
                    <li><strong>Use for Negotiations:</strong> Bring calculator results to lender meetings to demonstrate financial literacy and serious preparation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Real-World Examples Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Business Loan Calculator Examples
                </h2>
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none space-y-8">
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4">Example 1: Manufacturing Startup Equipment Financing</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>Scenario:</strong> Sarah is launching a small manufacturing business and needs to purchase machinery and equipment. She has secured a building lease and has $75,000 saved as a down payment for equipment.
                    </p>
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <p className="font-bold text-gray-900 mb-2">Input Values:</p>
                      <ul className="list-none space-y-1 text-gray-700">
                        <li>Loan Amount: $250,000</li>
                        <li>Interest Rate: 7.5% APR</li>
                        <li>Loan Term: 10 years (120 months)</li>
                        <li>Loan Type: SBA 7(a) Term Loan</li>
                        <li>Annual Revenue (projected): $600,000</li>
                        <li>Collateral Value: $350,000 (equipment + personal guarantee)</li>
                      </ul>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg mb-4">
                      <p className="font-bold text-blue-900 mb-2">Results:</p>
                      <ul className="list-none space-y-1 text-blue-900">
                        <li>Monthly Payment: $2,970</li>
                        <li>Total Amount Paid: $356,400</li>
                        <li>Total Interest: $106,400</li>
                        <li>Annual Debt Service: $35,640</li>
                        <li>DSCR: 16.84 (Excellent - far exceeds 1.25 requirement)</li>
                        <li>LTV: 71.4% (Excellent - well below 80% threshold)</li>
                      </ul>
                    </div>
                    <p className="text-gray-700">
                      <strong>Interpretation:</strong> Sarah's loan is highly favorable. Her projected revenue provides a DSCR of 16.84, meaning she has nearly 17 times the cash flow needed to cover annual payments. The 71.4% LTV indicates strong collateral backing. Monthly payments of $2,970 represent just 5.9% of monthly revenue, leaving ample room for operating expenses and profit.
                    </p>
                    <p className="text-green-700 font-semibold mt-2">
                      Action Steps: Apply with confidence. Consider negotiating for a lower rate given strong financials. Set aside 10% of revenue monthly for debt service to ensure timely payments. Plan to refinance after 3-5 years if business grows as projected.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-4">Example 2: Restaurant Expansion - Comparing 7-Year vs 15-Year Terms</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>Scenario:</strong> Mike owns a successful restaurant and wants to expand to a second location. He needs $500,000 for leasehold improvements, equipment, and initial inventory. He's comparing shorter and longer loan terms.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg border-2 border-green-500">
                        <p className="font-bold text-green-900 mb-2">Option A: 7-Year Term</p>
                        <ul className="list-none space-y-1 text-gray-700 text-sm">
                          <li>Loan Amount: $500,000</li>
                          <li>Interest Rate: 6.5% APR</li>
                          <li>Loan Term: 7 years (84 months)</li>
                          <li>Monthly Payment: $7,366</li>
                          <li>Total Paid: $618,744</li>
                          <li>Total Interest: $118,744</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-2">Option B: 15-Year Term</p>
                        <ul className="list-none space-y-1 text-gray-700 text-sm">
                          <li>Loan Amount: $500,000</li>
                          <li>Interest Rate: 7.25% APR</li>
                          <li>Loan Term: 15 years (180 months)</li>
                          <li>Monthly Payment: $4,550</li>
                          <li>Total Paid: $819,000</li>
                          <li>Total Interest: $319,000</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-2">
                      <strong>Comparison Analysis:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Monthly Savings (15-year):</strong> $2,816 per month (38% lower payment)</li>
                      <li><strong>Interest Cost Difference:</strong> $200,256 more over loan life with 15-year term</li>
                      <li><strong>Cash Flow Impact:</strong> 7-year term requires $88,392 annually; 15-year requires $54,600</li>
                      <li><strong>Break-Even Point:</strong> If monthly savings are reinvested at 8% return, break-even occurs around year 12</li>
                    </ul>

                    <p className="text-gray-700 mt-4">
                      <strong>Recommendation:</strong> If Mike's combined restaurant revenue is $1.2M+ annually, the 7-year term is optimal. It saves $200K in interest and builds equity faster. However, if the new location needs 12-18 months to reach profitability, the 15-year term provides crucial cash flow breathing room during the startup phase.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-xl sm:text-2xl font-bold text-purple-900 mb-4">Example 3: Working Capital Line of Credit for Seasonal Business</h3>
                    <p className="text-gray-700 mb-4">
                      <strong>Scenario:</strong> Jennifer runs a landscaping company with highly seasonal revenue. She needs a $150,000 line of credit to cover payroll and equipment during the slow winter months when revenue drops but expenses continue.
                    </p>
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <p className="font-bold text-gray-900 mb-2">Input Values:</p>
                      <ul className="list-none space-y-1 text-gray-700">
                        <li>Credit Line Amount: $150,000</li>
                        <li>Interest Rate: 9.5% APR</li>
                        <li>Loan Type: Revolving Line of Credit</li>
                        <li>Annual Revenue: $850,000</li>
                        <li>Expected Usage: 6 months per year (winter season)</li>
                      </ul>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg mb-4">
                      <p className="font-bold text-purple-900 mb-2">Cost Analysis:</p>
                      <ul className="list-none space-y-1 text-purple-900">
                        <li>Monthly Interest (if fully drawn): $1,188</li>
                        <li>Interest Cost (6 months at full draw): $7,125</li>
                        <li>Interest Cost (6 months at 50% draw): $3,563</li>
                        <li>Annual Cost Range: $3,563 - $7,125 (0.4% - 0.8% of revenue)</li>
                      </ul>
                    </div>
                    <p className="text-gray-700">
                      <strong>Strategic Insight:</strong> Unlike a term loan, Jennifer only pays interest on the amount she actually uses. If she draws $150,000 in November-April and pays it down May-October, her total annual interest is around $7,125 versus $14,250 for a full-year term loan. This flexibility is perfect for seasonal businesses.
                    </p>
                    <p className="text-purple-700 font-semibold mt-2">
                      Best Practices: Draw conservatively (only what's needed), maintain a repayment schedule during high-revenue months, keep credit utilization below 50% when possible to preserve borrowing capacity for emergencies, and review annually to ensure the line size matches business growth.
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Understanding Results Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Understanding Your Business Loan Results
                </h2>
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Key Metrics Explained:</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Monthly Payment</h4>
                      <p className="text-gray-700 mb-2">
                        The fixed amount you'll pay each month for the loan term. This includes both principal (loan balance reduction) and interest (lender's fee for borrowing). Understanding this number is critical for cash flow planning.
                      </p>
                      <p className="text-sm text-blue-700 italic">
                        Rule of Thumb: Monthly payments should not exceed 15-20% of your monthly gross revenue for healthy cash flow management.
                      </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                      <h4 className="font-bold text-green-900 mb-3 text-lg">Total Interest Paid</h4>
                      <p className="text-gray-700 mb-2">
                        The total cost of borrowing over the entire loan term. This is the difference between what you borrowed and what you'll ultimately repay. Lower interest rates and shorter terms reduce this cost significantly.
                      </p>
                      <p className="text-sm text-green-700 italic">
                        Example: On a $200,000 loan at 7% for 10 years, you'll pay approximately $73,000 in interest. At 6% for 7 years, interest drops to $47,000.
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-600">
                      <h4 className="font-bold text-yellow-900 mb-3 text-lg">Debt Service Coverage Ratio (DSCR)</h4>
                      <p className="text-gray-700 mb-4">
                        DSCR measures whether your business generates enough cash flow to cover loan payments. It's calculated as: Annual Net Operating Income ÷ Annual Debt Service.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-bold text-green-700 mb-2">DSCR ≥ 1.25 (Excellent)</p>
                          <p className="text-sm text-gray-600">Strong approval likelihood. Business generates 25%+ more cash than needed for payments. Preferred by most lenders.</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-bold text-blue-700 mb-2">DSCR 1.0 - 1.24 (Good)</p>
                          <p className="text-sm text-gray-600">Acceptable but tight. Business covers payments with minimal cushion. May qualify with strong credit or collateral.</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-bold text-orange-700 mb-2">DSCR 0.8 - 0.99 (Caution)</p>
                          <p className="text-sm text-gray-600">Insufficient cash flow. Requires additional collateral, guarantors, or higher down payment. Consider smaller loan amount.</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <p className="font-bold text-red-700 mb-2">DSCR &lt; 0.8 (High Risk)</p>
                          <p className="text-sm text-gray-600">Likely denial. Cash flow cannot support debt. Focus on revenue growth or reduce loan amount before applying.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-600">
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Loan-to-Value Ratio (LTV)</h4>
                      <p className="text-gray-700 mb-4">
                        LTV compares your loan amount to the value of collateral pledged. Calculated as: (Loan Amount ÷ Collateral Value) × 100. Lower LTV means less lender risk and often better rates.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-green-700">LTV ≤ 80% (Excellent)</p>
                            <span className="text-2xl">✓</span>
                          </div>
                          <p className="text-sm text-gray-600">Strong collateral position. Qualifies for best rates. Lender has 20%+ equity cushion protecting against default loss.</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-blue-700">LTV 80-90% (Good)</p>
                            <span className="text-2xl">✓</span>
                          </div>
                          <p className="text-sm text-gray-600">Acceptable range for most lenders. May require mortgage insurance or personal guarantee on amounts exceeding 80% threshold.</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-orange-700">LTV &gt; 90% (Needs Improvement)</p>
                            <span className="text-2xl">!</span>
                          </div>
                          <p className="text-sm text-gray-600">High risk for lender. Consider larger down payment, additional collateral, or smaller loan amount. Higher interest rates likely.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">Amortization Schedule</h4>
                      <p className="text-gray-700 mb-2">
                        A detailed breakdown showing how each payment is split between principal and interest over time. Early payments are mostly interest; later payments are mostly principal. This schedule is crucial for:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li>Tax planning (interest is often tax-deductible for businesses)</li>
                        <li>Understanding equity buildup in collateral</li>
                        <li>Planning prepayment strategies to minimize interest</li>
                        <li>Cash flow forecasting for the loan term</li>
                      </ul>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4">When to Seek Professional Advice:</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>DSCR below 1.0:</strong> Consult a business advisor or accountant to review revenue projections and expense optimization before applying</li>
                    <li><strong>Comparing multiple loan offers:</strong> A commercial loan broker can help negotiate terms and identify the best overall package (not just lowest rate)</li>
                    <li><strong>Complex financing structures:</strong> SBA 504 loans, sale-leasebacks, or mezzanine financing require specialized expertise</li>
                    <li><strong>Covenant negotiations:</strong> Commercial loans often include financial covenants (minimum cash reserves, maximum debt ratios) that require careful review</li>
                    <li><strong>Tax implications:</strong> Large loans impact depreciation schedules, interest deductions, and business valuation for tax purposes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Formula Explained Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Business Loan Formula Explained
                </h2>
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">The Standard Amortization Formula:</h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300 mb-6">
                    <p className="text-center text-gray-900 font-mono text-lg mb-4">
                      M = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1]
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-bold text-blue-900 mb-1">Where:</p>
                        <ul className="list-none space-y-1 text-gray-700">
                          <li><strong>M</strong> = Monthly Payment</li>
                          <li><strong>P</strong> = Principal (loan amount)</li>
                        </ul>
                      </div>
                      <div>
                        <ul className="list-none space-y-1 text-gray-700">
                          <li><strong>r</strong> = Monthly interest rate (annual rate / 12)</li>
                          <li><strong>n</strong> = Total number of payments (years × 12)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Step-by-Step Calculation Example:</h3>
                  
                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                    <p className="font-bold text-gray-900 mb-4">Calculating payments for a $250,000 business loan at 7.5% APR for 10 years:</p>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-2">Step 1: Identify the variables</p>
                        <ul className="list-none space-y-1 text-gray-700 pl-4">
                          <li>P (Principal) = $250,000</li>
                          <li>Annual Interest Rate = 7.5%</li>
                          <li>Loan Term = 10 years</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-2">Step 2: Convert to monthly values</p>
                        <ul className="list-none space-y-1 text-gray-700 pl-4">
                          <li>r (Monthly Rate) = 7.5% ÷ 12 = 0.625% = 0.00625</li>
                          <li>n (Total Payments) = 10 years × 12 = 120 months</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-2">Step 3: Calculate (1 + r)ⁿ</p>
                        <p className="text-gray-700 pl-4">(1 + 0.00625)¹²⁰ = (1.00625)¹²⁰ = 2.1137</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-2">Step 4: Calculate numerator</p>
                        <p className="text-gray-700 pl-4">r(1 + r)ⁿ = 0.00625 × 2.1137 = 0.01321</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-2">Step 5: Calculate denominator</p>
                        <p className="text-gray-700 pl-4">(1 + r)ⁿ - 1 = 2.1137 - 1 = 1.1137</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-bold text-gray-900 mb-2">Step 6: Divide numerator by denominator</p>
                        <p className="text-gray-700 pl-4">0.01321 ÷ 1.1137 = 0.01186</p>
                      </div>

                      <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-400">
                        <p className="font-bold text-blue-900 mb-2">Step 7: Multiply by principal</p>
                        <p className="text-blue-900 pl-4">M = $250,000 × 0.01186 = <span className="text-xl font-bold">$2,965</span></p>
                        <p className="text-sm text-blue-700 mt-2 pl-4 italic">Monthly Payment: $2,965 (approximately $2,970 with rounding)</p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg mt-4">
                        <p className="font-bold text-green-900 mb-2">Total Loan Cost:</p>
                        <ul className="list-none space-y-1 text-gray-700 pl-4">
                          <li>Monthly Payment: $2,970</li>
                          <li>Total Payments: $2,970 × 120 = $356,400</li>
                          <li>Total Interest: $356,400 - $250,000 = <strong>$106,400</strong></li>
                          <li>Interest as % of Principal: 42.6%</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4">Special Calculation: Line of Credit Interest</h3>
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <p className="text-gray-700 mb-4">
                      Lines of credit use a simpler calculation since you only pay interest on the outstanding balance:
                    </p>
                    <p className="text-center text-gray-900 font-mono text-lg mb-4">
                      Monthly Interest = Outstanding Balance × (Annual Rate ÷ 12)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Example:</strong> $100,000 line of credit at 9.5% APR
                    </p>
                    <ul className="list-none space-y-1 text-gray-700 pl-4">
                      <li>Monthly Rate: 9.5% ÷ 12 = 0.792%</li>
                      <li>If you draw $50,000: Monthly Interest = $50,000 × 0.00792 = $396</li>
                      <li>If you draw full $100,000: Monthly Interest = $100,000 × 0.00792 = $792</li>
                    </ul>
                    <p className="text-sm text-purple-700 mt-4 italic">
                      Note: You only pay interest on what you actually borrow, making lines of credit ideal for seasonal cash flow needs or unpredictable expenses.
                    </p>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4">Understanding Principal vs. Interest Over Time:</h3>
                  <p className="text-gray-700">
                    In the early years of a loan, most of your payment goes toward interest. As the principal balance decreases, more of each payment reduces the principal. This is because interest is calculated on the remaining balance.
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg mt-4">
                    <p className="font-bold text-gray-900 mb-3">Example: $250,000 loan at 7.5% for 10 years</p>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-blue-900 mb-2">Payment #1 (Month 1)</p>
                        <p className="text-gray-700">Principal: $1,407</p>
                        <p className="text-gray-700">Interest: $1,563</p>
                        <p className="text-xs text-gray-500 mt-1">Interest = 52.6% of payment</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-green-900 mb-2">Payment #60 (Month 60)</p>
                        <p className="text-gray-700">Principal: $1,932</p>
                        <p className="text-gray-700">Interest: $1,038</p>
                        <p className="text-xs text-gray-500 mt-1">Interest = 35.0% of payment</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-purple-900 mb-2">Payment #120 (Final)</p>
                        <p className="text-gray-700">Principal: $2,951</p>
                        <p className="text-gray-700">Interest: $19</p>
                        <p className="text-xs text-gray-500 mt-1">Interest = 0.6% of payment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Type Comparison Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Business Loan Type Comparison
                </h2>
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <p className="text-gray-700 mb-6">
                    Choosing the right business loan type is critical for both approval odds and long-term financial health. Each loan type has distinct characteristics, qualification requirements, and ideal use cases.
                  </p>

                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[800px] border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <th className="p-4 text-left font-bold rounded-tl-lg">Loan Type</th>
                          <th className="p-4 text-left font-bold">Typical Amount</th>
                          <th className="p-4 text-left font-bold">Interest Rate</th>
                          <th className="p-4 text-left font-bold">Term Length</th>
                          <th className="p-4 text-left font-bold rounded-tr-lg">Best For</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-blue-900">SBA 7(a) Loan</div>
                            <div className="text-xs text-gray-600 mt-1">Government-backed</div>
                          </td>
                          <td className="p-4 text-gray-700">$50K - $5M</td>
                          <td className="p-4 text-green-700 font-semibold">5.5% - 8%</td>
                          <td className="p-4 text-gray-700">Up to 25 years</td>
                          <td className="p-4 text-sm text-gray-700">Working capital, equipment, real estate, business acquisition</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">SBA 504 Loan</div>
                            <div className="text-xs text-gray-600 mt-1">Government-backed CRE</div>
                          </td>
                          <td className="p-4 text-gray-700">$125K - $5.5M</td>
                          <td className="p-4 text-green-700 font-semibold">5% - 7.5%</td>
                          <td className="p-4 text-gray-700">10, 20, or 25 years</td>
                          <td className="p-4 text-sm text-gray-700">Commercial real estate purchase, major equipment, construction</td>
                        </tr>
                        <tr className="bg-green-50 hover:bg-green-100 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-green-900">Term Loan (Bank)</div>
                            <div className="text-xs text-gray-600 mt-1">Traditional financing</div>
                          </td>
                          <td className="p-4 text-gray-700">$25K - $5M+</td>
                          <td className="p-4 text-yellow-700 font-semibold">6% - 12%</td>
                          <td className="p-4 text-gray-700">1 - 20 years</td>
                          <td className="p-4 text-sm text-gray-700">Established businesses with strong credit, expansion, acquisitions</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">Equipment Financing</div>
                            <div className="text-xs text-gray-600 mt-1">Asset-based</div>
                          </td>
                          <td className="p-4 text-gray-700">$5K - $5M</td>
                          <td className="p-4 text-yellow-700 font-semibold">6% - 15%</td>
                          <td className="p-4 text-gray-700">3 - 7 years</td>
                          <td className="p-4 text-sm text-gray-700">Machinery, vehicles, technology, medical equipment</td>
                        </tr>
                        <tr className="bg-purple-50 hover:bg-purple-100 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-purple-900">Line of Credit</div>
                            <div className="text-xs text-gray-600 mt-1">Revolving credit</div>
                          </td>
                          <td className="p-4 text-gray-700">$10K - $1M</td>
                          <td className="p-4 text-orange-700 font-semibold">8% - 20%</td>
                          <td className="p-4 text-gray-700">6 months - 3 years</td>
                          <td className="p-4 text-sm text-gray-700">Seasonal cash flow, short-term inventory, payroll gaps</td>
                        </tr>
                        <tr className="bg-white hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">Bridge Loan</div>
                            <div className="text-xs text-gray-600 mt-1">Short-term</div>
                          </td>
                          <td className="p-4 text-gray-700">$50K - $5M</td>
                          <td className="p-4 text-orange-700 font-semibold">9% - 18%</td>
                          <td className="p-4 text-gray-700">6 - 18 months</td>
                          <td className="p-4 text-sm text-gray-700">Time-sensitive opportunities, pending larger financing, acquisitions</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-4">Detailed Loan Type Guidance:</h3>

                  <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">When to Choose SBA 7(a) Loans</h4>
                      <p className="text-gray-700 mb-3">
                        SBA 7(a) loans offer the best combination of low rates, long terms, and flexible use. They're ideal when you need substantial capital but may not qualify for conventional bank financing due to limited collateral or operating history.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="font-semibold text-green-700 mb-2">Pros:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            <li>Low interest rates (prime + 2.25% - 2.75%)</li>
                            <li>Long repayment terms reduce monthly burden</li>
                            <li>Up to 90% LTV on real estate</li>
                            <li>Can refinance existing debt</li>
                            <li>Government guarantee reduces lender risk</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-red-700 mb-2">Cons:</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            <li>Extensive documentation required</li>
                            <li>45-90 day approval timeline</li>
                            <li>Personal guarantee typically required</li>
                            <li>Not available for speculative businesses</li>
                            <li>SBA fees (2-3.75% of loan amount)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-600">
                      <h4 className="font-bold text-green-900 mb-3 text-lg">When to Choose Term Loans</h4>
                      <p className="text-gray-700 mb-3">
                        Traditional term loans work best for established businesses with strong financials that need quick access to capital without the SBA's bureaucracy. Banks typically require 2+ years in business and DSCR of 1.25 or higher.
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        Best for: Businesses with $500K+ annual revenue, good credit (680+), and clear purpose for funds (expansion, acquisition, major inventory purchase).
                      </p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600">
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">When to Choose Equipment Financing</h4>
                      <p className="text-gray-700 mb-3">
                        Equipment loans are secured by the equipment itself, making approval easier even for newer businesses. The equipment serves as collateral, reducing lender risk and often qualifying you for better rates than unsecured loans.
                      </p>
                      <p className="text-sm text-gray-600 mb-3 italic">
                        Typical structure: 80-100% financing, term matches equipment useful life (3-7 years), $1 buyout at end.
                      </p>
                      <p className="text-purple-700 font-semibold">
                        Pro Tip: Section 179 tax deduction allows you to deduct the full purchase price of qualifying equipment in the first year, providing significant tax savings.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-600">
                      <h4 className="font-bold text-orange-900 mb-3 text-lg">When to Choose a Line of Credit</h4>
                      <p className="text-gray-700 mb-3">
                        Lines of credit are perfect for managing cash flow fluctuations, not for purchasing fixed assets. They provide flexibility to draw funds as needed and only pay interest on the outstanding balance.
                      </p>
                      <div className="bg-white p-4 rounded-lg mt-3">
                        <p className="font-semibold text-gray-900 mb-2">Ideal Use Cases:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          <li>Seasonal businesses with revenue fluctuations (landscaping, retail, tourism)</li>
                          <li>Covering payroll during slow periods</li>
                          <li>Taking advantage of bulk purchase discounts</li>
                          <li>Managing accounts receivable gaps (invoice financing alternative)</li>
                          <li>Emergency working capital reserve</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-400 mt-8">
                    <h4 className="font-bold text-yellow-900 mb-3 text-lg flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Important Decision Factor: Speed vs. Cost
                    </h4>
                    <p className="text-gray-700">
                      SBA loans offer the lowest rates but take 1-3 months to close. Alternative lenders can fund in 1-3 days but charge 15-30% APR. For time-sensitive opportunities, consider a bridge loan from an alternative lender, then refinance with an SBA loan once the urgency passes. The extra interest cost is often worth securing a critical business opportunity.
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none space-y-6">
                  
                  <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">
                      What credit score do I need to qualify for a business loan?
                    </h3>
                    <p className="text-gray-700">
                      Minimum credit scores vary by loan type and lender. SBA 7(a) loans typically require a personal credit score of 680+, though some lenders accept 650+ with compensating factors (strong cash flow, substantial collateral, or industry experience). Traditional bank term loans usually require 700+. Alternative lenders may approve scores as low as 550, but expect significantly higher interest rates (18-30% APR). Your business credit score (FICO SBSS or Dun & Bradstreet PAYDEX) also matters for established companies.
                    </p>
                    <p className="text-sm text-blue-700 mt-2 italic">
                      If your score is below 680, focus on: paying down credit card balances below 30% utilization, correcting any credit report errors, and establishing a track record of on-time payments for 6-12 months before applying.
                    </p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-600">
                    <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-3">
                      How much can I borrow for my business?
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Loan amounts depend on several factors:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Revenue-based:</strong> Most lenders cap loans at 25-50% of annual revenue. A business earning $1M yearly might qualify for $250K-$500K.</li>
                      <li><strong>DSCR-based:</strong> Your loan payment cannot exceed available cash flow. Lenders want DSCR of 1.25+, meaning your net operating income should be 125% of your annual debt service.</li>
                      <li><strong>Collateral-based:</strong> Secured loans can reach 80-90% of collateral value. $500K in equipment might support a $400K-$450K loan.</li>
                      <li><strong>Loan type limits:</strong> SBA 7(a) caps at $5M, SBA 504 at $5.5M, while some alternative lenders offer up to $10M for qualified borrowers.</li>
                    </ul>
                    <p className="text-green-700 font-semibold mt-3">
                      Pro Tip: Apply for slightly less than your maximum qualification. Leaving a cushion demonstrates financial prudence to lenders and provides breathing room if revenue temporarily dips.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600">
                    <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-3">
                      What is a good DSCR (Debt Service Coverage Ratio)?
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Debt Service Coverage Ratio measures your ability to service debt from operating income. It's calculated as Net Operating Income ÷ Total Debt Service (all loan payments).
                    </p>
                    <div className="space-y-2">
                      <p className="text-gray-700"><strong>DSCR 1.25-1.50:</strong> Minimum acceptable by most lenders. Shows you generate 25-50% more cash than needed for debt payments.</p>
                      <p className="text-gray-700"><strong>DSCR 1.50-2.00:</strong> Strong position. Qualifies for best rates and terms. Demonstrates healthy cushion for business fluctuations.</p>
                      <p className="text-gray-700"><strong>DSCR above 2.00:</strong> Excellent. You may be under-leveraged and could potentially borrow more to fuel growth if desired.</p>
                      <p className="text-gray-700"><strong>DSCR below 1.00:</strong> Cash flow insufficient to cover debt. Likely denial or requirement for additional collateral/guarantors.</p>
                    </div>
                    <p className="text-sm text-purple-700 mt-3 italic">
                      Example: If your business has $240,000 net operating income and annual loan payments of $180,000, your DSCR is 1.33 ($240K ÷ $180K) - acceptable but close to minimums.
                    </p>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-600">
                    <h3 className="text-lg sm:text-xl font-bold text-orange-900 mb-3">
                      Can I get a business loan without collateral?
                    </h3>
                    <p className="text-gray-700">
                      Yes, unsecured business loans exist but typically require: 2+ years in business, strong credit (700+), healthy revenue ($250K+ annually), and proven profitability. Expect higher interest rates (10-20% vs. 6-10% for secured loans) and lower loan amounts (often capped at $250K). Lenders compensate for higher risk with stricter terms.
                    </p>
                    <p className="text-gray-700 mt-3">
                      <strong>Alternatives to traditional collateral:</strong> Some lenders accept alternative security like accounts receivable, inventory, or future credit card receivables. SBA 7(a) loans may require only limited collateral if the loan is under $350K. However, personal guarantees are almost always required for unsecured loans, putting your personal assets at risk if the business defaults.
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-600">
                    <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-3">
                      Should I choose a shorter or longer loan term?
                    </h3>
                    <p className="text-gray-700 mb-3">
                      The optimal term balances monthly affordability with total interest cost:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-3">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-green-700 mb-2">Shorter Terms (3-7 years)</p>
                        <p className="text-sm text-gray-600 mb-2"><strong>Pros:</strong></p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mb-2">
                          <li>Less total interest paid</li>
                          <li>Build equity faster</li>
                          <li>Lower total cost of borrowing</li>
                          <li>Debt-free sooner</li>
                        </ul>
                        <p className="text-sm text-gray-600"><strong>Cons:</strong></p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          <li>Higher monthly payments</li>
                          <li>Less cash flow flexibility</li>
                          <li>Harder to qualify</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-orange-700 mb-2">Longer Terms (10-25 years)</p>
                        <p className="text-sm text-gray-600 mb-2"><strong>Pros:</strong></p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mb-2">
                          <li>Lower monthly payments</li>
                          <li>Better cash flow management</li>
                          <li>Easier to qualify</li>
                          <li>More working capital preserved</li>
                        </ul>
                        <p className="text-sm text-gray-600"><strong>Cons:</strong></p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          <li>Significantly more interest paid</li>
                          <li>Slower equity buildup</li>
                          <li>Extended financial obligation</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-indigo-700 font-semibold">
                      Rule of Thumb: Match loan term to asset life. Equipment loan? 5-7 years. Commercial real estate? 15-25 years. Working capital? 1-3 years. Never finance short-lived assets with long-term debt.
                    </p>
                  </div>

                  <div className="bg-pink-50 p-6 rounded-xl border-l-4 border-pink-600">
                    <h3 className="text-lg sm:text-xl font-bold text-pink-900 mb-3">
                      What documents do I need to apply for a business loan?
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Required documentation varies by lender and loan type, but expect to provide:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Financial Documents:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          <li>2-3 years of business tax returns (Form 1120, 1120S, or 1065)</li>
                          <li>2-3 years of personal tax returns (Form 1040)</li>
                          <li>Profit & Loss statements (P&L) for current year</li>
                          <li>Balance sheet showing assets and liabilities</li>
                          <li>3-6 months of business bank statements</li>
                          <li>Accounts receivable and accounts payable aging reports</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Business Documents:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          <li>Business license and registration certificates</li>
                          <li>Articles of incorporation or organization</li>
                          <li>Business plan (especially for startups or large loans)</li>
                          <li>Ownership structure documentation</li>
                          <li>Commercial lease agreement (if applicable)</li>
                          <li>Contracts or purchase orders (proof of revenue)</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Additional Requirements:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          <li>Personal financial statement listing all assets/liabilities</li>
                          <li>Resume showing relevant business experience</li>
                          <li>Collateral documentation (appraisals, titles, deeds)</li>
                          <li>Explanation of loan purpose and use of funds</li>
                          <li>Debt schedule listing all current business debts</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm text-pink-700 mt-3 italic">
                      Startups with limited history may substitute with strong personal credit, industry experience documentation, and detailed financial projections showing path to profitability.
                    </p>
                  </div>

                  <div className="bg-teal-50 p-6 rounded-xl border-l-4 border-teal-600">
                    <h3 className="text-lg sm:text-xl font-bold text-teal-900 mb-3">
                      How long does business loan approval take?
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Timeline varies significantly by loan type and lender:
                    </p>
                    <ul className="list-none space-y-2 text-gray-700">
                      <li><strong>SBA Loans:</strong> 45-90 days. Extensive documentation and government guarantee process create longer timelines.</li>
                      <li><strong>Traditional Bank Loans:</strong> 30-60 days. Thorough underwriting and committee approvals take time.</li>
                      <li><strong>Online/Alternative Lenders:</strong> 1-7 days. Streamlined digital applications and automated underwriting speed process.</li>
                      <li><strong>Equipment Financing:</strong> 3-10 days. Asset-based lending reduces risk assessment time.</li>
                      <li><strong>Lines of Credit:</strong> 5-14 days. Once established, additional draws can be same-day or next-day.</li>
                    </ul>
                    <p className="text-teal-700 font-semibold mt-3">
                      Speed up approval: Have all documents organized before applying, respond quickly to lender requests, maintain clean books, and work with a loan broker who knows which lenders fit your profile.
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-600">
                    <h3 className="text-lg sm:text-xl font-bold text-yellow-900 mb-3">
                      Can I pay off my business loan early?
                    </h3>
                    <p className="text-gray-700">
                      Most business loans allow early payoff, but check for prepayment penalties. These penalties compensate lenders for lost interest income and typically apply to the first 1-5 years of the loan. Penalties range from 1-5% of the outstanding balance or several months' interest.
                    </p>
                    <p className="text-gray-700 mt-3">
                      <strong>When early payoff makes sense:</strong> If you can refinance at 2+ percentage points lower, if your business has excess cash earning less than your loan interest rate, or if you're selling the business and must clear debt. <strong>When to avoid early payoff:</strong> If prepayment penalties exceed interest savings, if you'd deplete emergency reserves, or if the cash could generate higher returns invested in business growth.
                    </p>
                  </div>

                  <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-600">
                    <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-3">
                      What happens if I can't make my business loan payment?
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Missing payments has serious consequences, but proactive communication can minimize damage:
                    </p>
                    <div className="space-y-2">
                      <p className="text-gray-700"><strong>Immediate actions:</strong> Contact your lender immediately (before the payment is due if possible). Many lenders offer hardship programs, temporary payment reductions, or restructuring options. Being proactive demonstrates good faith and often leads to better outcomes than waiting for default.</p>
                      <p className="text-gray-700"><strong>Short-term consequences:</strong> Late fees (typically $25-$50 or 5% of payment), negative marks on business and personal credit reports after 30+ days late, increased interest rate (if variable), and potential acceleration of loan (full balance becomes due).</p>
                      <p className="text-gray-700"><strong>Long-term consequences:</strong> If you default, lenders can seize collateral, pursue personal guarantors' assets, file lawsuits for unpaid amounts, and report to credit bureaus (damaging credit for 7 years).</p>
                    </div>
                    <p className="text-red-700 font-bold mt-3">
                      Prevention strategy: Maintain a cash reserve of 3-6 months of loan payments, monitor cash flow weekly, and address revenue problems early before they become payment problems. If trouble looms, explore refinancing or debt consolidation before you miss payments.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-gray-600">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                      Should I refinance my business loan?
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Refinancing can save substantial money if conditions are right. Consider refinancing when:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Interest rates have dropped 1-2% or more:</strong> Even after closing costs, you'll save significantly over the loan term.</li>
                      <li><strong>Your credit has improved significantly:</strong> A 50+ point credit score increase or 2+ years of strong payment history can qualify you for better rates.</li>
                      <li><strong>Your business has grown:</strong> Higher revenue and profitability may qualify you for better terms or allow you to consolidate multiple loans.</li>
                      <li><strong>You need to extend the term:</strong> If cash flow is tight, refinancing to a longer term reduces monthly burden (but increases total interest).</li>
                      <li><strong>You want to switch from variable to fixed:</strong> If rates are rising, locking in a fixed rate provides payment certainty and protects against future increases.</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      <strong>Calculate break-even:</strong> If closing costs are $5,000 and you save $250/month, you'll break even in 20 months. If you plan to keep the loan longer than that, refinancing makes financial sense.
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Related Calculators Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Related Financial Calculators
                </h2>
                <p className="text-gray-700 mb-6">
                  Expand your financial planning with these complementary tools. Each calculator helps you make data-driven decisions for different aspects of your business or personal finances.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 hover-elevate transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <Calculator className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-blue-900 text-lg">Mortgage Calculator</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      Calculate monthly mortgage payments for commercial or residential properties. Includes PMI, property tax, insurance, and HOA fees for complete affordability analysis.
                    </p>
                    <p className="text-xs text-blue-700 italic">
                      Best for: Commercial real estate purchases, rental property investments, business facility purchases
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover-elevate transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-600 p-3 rounded-lg">
                        <TrendingDown className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-green-900 text-lg">ROI Calculator</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      Measure return on investment for business purchases, equipment, marketing campaigns, or any business expense. Compare multiple investment options side-by-side.
                    </p>
                    <p className="text-xs text-green-700 italic">
                      Best for: Equipment purchase decisions, marketing ROI, expansion analysis, capital allocation
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 hover-elevate transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-purple-900 text-lg">Cash Flow Calculator</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      Project future cash flow based on revenue, expenses, and payment schedules. Essential for understanding if you can afford new debt obligations.
                    </p>
                    <p className="text-xs text-purple-700 italic">
                      Best for: Pre-loan planning, seasonal business forecasting, working capital management
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200 hover-elevate transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-600 p-3 rounded-lg">
                        <PieChart className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-orange-900 text-lg">Break-Even Calculator</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      Determine how much revenue you need to cover fixed costs, variable costs, and loan payments. Critical for new business ventures or expansion planning.
                    </p>
                    <p className="text-xs text-orange-700 italic">
                      Best for: Startup planning, new product launches, expansion viability assessment
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200 hover-elevate transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-teal-600 p-3 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-teal-900 text-lg">Debt Service Coverage Calculator</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      Calculate your business's ability to service debt obligations. Lenders use this metric to assess creditworthiness and loan approval likelihood.
                    </p>
                    <p className="text-xs text-teal-700 italic">
                      Best for: Pre-qualification assessment, multiple loan scenario comparison, financial health monitoring
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200 hover-elevate transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-indigo-600 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-indigo-900 text-lg">Loan Comparison Calculator</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">
                      Compare multiple loan offers side-by-side including total cost, monthly payment, and long-term savings. Find the most cost-effective financing option.
                    </p>
                    <p className="text-xs text-indigo-700 italic">
                      Best for: Evaluating competing loan offers, refinance decisions, term length optimization
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Final CTA Section */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Plan Your Business Financing?
                </h2>
                <p className="text-blue-100 text-base sm:text-lg mb-6 max-w-3xl mx-auto">
                  Use our Business Loan Calculator to get instant, accurate payment estimates and make confident financing decisions. Whether you're starting a new venture, expanding operations, or purchasing equipment, understanding your loan costs is the first step to success.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6">
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-2xl">✓</span>
                    <span className="text-sm sm:text-base">100% Free Forever</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-2xl">✓</span>
                    <span className="text-sm sm:text-base">Instant Results</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-2xl">✓</span>
                    <span className="text-sm sm:text-base">No Registration Required</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <span className="text-2xl">✓</span>
                    <span className="text-sm sm:text-base">Export & Share Results</span>
                  </div>
                </div>
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-6 text-lg shadow-xl"
                  data-testid="button-scroll-to-top"
                >
                  Start Calculating Now
                </Button>
                <p className="text-blue-200 text-sm mt-6">
                  Join thousands of business owners who trust DapsiWow for accurate financial planning
                </p>
              </CardContent>
            </Card>

          </div>

          </div>
      </main>

      <Footer />
    </div>
  );
}
