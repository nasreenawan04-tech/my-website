
import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Calculator, TrendingUp, Clock, Percent, Download, Share2, PieChart as PieChartIcon, BarChart3, RotateCcw, ChevronRight, Home, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import ShareResultsButton from '@/components/ShareResultsButton';

interface SimpleInterestResult {
  simpleInterest: number;
  totalAmount: number;
  principalAmount: number;
  monthlyInterest: number;
  yearlyBreakdown: Array<{
    year: number;
    interestEarned: number;
    totalAmount: number;
    cumulativeInterest: number;
  }>;
}

interface ComparisonScenario {
  name: string;
  principal: number;
  rate: number;
  time: number;
  simpleInterest: number;
  totalAmount: number;
}

export default function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [interestRate, setInterestRate] = useState('8');
  const [timePeriod, setTimePeriod] = useState('5');
  const [timeUnit, setTimeUnit] = useState('years');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<SimpleInterestResult | null>(null);
  const [showYearlyBreakdown, setShowYearlyBreakdown] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [comparisonScenarios, setComparisonScenarios] = useState<ComparisonScenario[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const yearlyBreakdownScrollRef = useRef<HTMLDivElement>(null);
  const comparisonScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { toast } = useToast();

  // Drag scrolling handlers for tables
  const handleMouseDown = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const calculateSimpleInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100;
    const t = timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12;

    if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(t) || p <= 0 || r <= 0 || t <= 0) return;

    // Simple Interest Formula: SI = P × R × T
    const simpleInterest = p * r * t;
    const totalAmount = p + simpleInterest;
    const monthlyInterest = simpleInterest / (t * 12);

    // Calculate yearly breakdown
    const yearlyBreakdown = [];
    const years = Math.ceil(t);
    
    for (let year = 1; year <= years; year++) {
      const currentYearTime = Math.min(year, t);
      const previousYearTime = Math.min(year - 1, t);
      
      const cumulativeInterest = p * r * currentYearTime;
      const previousCumulativeInterest = p * r * previousYearTime;
      const interestEarned = cumulativeInterest - previousCumulativeInterest;
      const totalAmountYear = p + cumulativeInterest;
      
      yearlyBreakdown.push({
        year,
        interestEarned,
        totalAmount: totalAmountYear,
        cumulativeInterest
      });
    }

    setResult({
      simpleInterest,
      totalAmount,
      principalAmount: p,
      monthlyInterest,
      yearlyBreakdown
    });
  };

  // Load parameters from URL on mount (for shared links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('principal');
    const rate = params.get('rate');
    const time = params.get('time');
    const unit = params.get('unit');

    if (amount || rate || time) {
      if (amount) setPrincipal(amount);
      if (rate) setInterestRate(rate);
      if (time) setTimePeriod(time);
      if (unit) setTimeUnit(unit);

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

  const resetCalculator = () => {
    setPrincipal('10000');
    setInterestRate('8');
    setTimePeriod('5');
    setTimeUnit('years');
    setCurrency('USD');
    setResult(null);
    setShowYearlyBreakdown(false);
    setShowComparison(false);
    setShowChart(false);
    setComparisonScenarios([]);
  };

  const addToComparison = () => {
    if (result) {
      const newScenario: ComparisonScenario = {
        name: `Scenario ${comparisonScenarios.length + 1}`,
        principal: result.principalAmount,
        rate: parseFloat(interestRate),
        time: timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12,
        simpleInterest: result.simpleInterest,
        totalAmount: result.totalAmount
      };
      setComparisonScenarios([...comparisonScenarios, newScenario]);
      setShowComparison(true);
      toast({
        title: "Scenario Added",
        description: "Scenario added to comparison. Calculate another to compare.",
      });
    }
  };

  const handleShare = async () => {
    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit
    });
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleDownloadYearlyBreakdownPDF = () => {
    if (!result || !result.yearlyBreakdown || result.yearlyBreakdown.length === 0) return;

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
    doc.text('Yearly Interest Breakdown Report', pageWidth / 2, yPos, { align: 'center' });
    
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
    
    const colWidths = [20, 45, 50, 45];
    const colX = [margin + 2, margin + 25, margin + 72, margin + 125];
    
    doc.text('Year', colX[0], yPos + 5);
    doc.text('Interest Earned', colX[1], yPos + 5);
    doc.text('Cumulative Interest', colX[2], yPos + 5);
    doc.text('Total Amount', colX[3], yPos + 5);
    
    yPos += 8;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    result.yearlyBreakdown.forEach((year, index) => {
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
        
        doc.text('Year', colX[0], yPos + 5);
        doc.text('Interest Earned', colX[1], yPos + 5);
        doc.text('Cumulative Interest', colX[2], yPos + 5);
        doc.text('Total Amount', colX[3], yPos + 5);
        
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
      doc.text(year.year.toString(), colX[0], yPos + 4);
      
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(year.interestEarned), colX[1], yPos + 4);
      
      doc.setTextColor(59, 130, 246);
      doc.text(formatCurrency(year.cumulativeInterest), colX[2], yPos + 4);
      
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(year.totalAmount), colX[3], yPos + 4);
      
      doc.setFont('helvetica', 'normal');
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
    doc.text('This breakdown shows how your interest accumulates year by year with simple interest calculation.', pageWidth / 2, yPos, { align: 'center' });
    
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
      description: "Your yearly breakdown report has been saved." 
    });
  };

  const handleDownloadComparisonPDF = () => {
    if (comparisonScenarios.length === 0) return;

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
    doc.text('Scenario Comparison Report', pageWidth / 2, yPos, { align: 'center' });
    
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
    
    const colX = [margin + 2, margin + 40, margin + 70, margin + 95, margin + 125, margin + 158];
    
    doc.text('Scenario', colX[0], yPos + 5);
    doc.text('Principal', colX[1], yPos + 5);
    doc.text('Rate', colX[2], yPos + 5);
    doc.text('Time', colX[3], yPos + 5);
    doc.text('Interest', colX[4], yPos + 5);
    doc.text('Total', colX[5], yPos + 5);
    
    yPos += 8;
    
    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    
    comparisonScenarios.forEach((scenario, index) => {
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
        
        doc.text('Scenario', colX[0], yPos + 5);
        doc.text('Principal', colX[1], yPos + 5);
        doc.text('Rate', colX[2], yPos + 5);
        doc.text('Time', colX[3], yPos + 5);
        doc.text('Interest', colX[4], yPos + 5);
        doc.text('Total', colX[5], yPos + 5);
        
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
      doc.text(scenario.name, colX[0], yPos + 4.5);
      
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(scenario.principal), colX[1], yPos + 4.5);
      doc.text(`${scenario.rate}%`, colX[2], yPos + 4.5);
      doc.text(`${scenario.time.toFixed(1)} yrs`, colX[3], yPos + 4.5);
      
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(scenario.simpleInterest), colX[4], yPos + 4.5);
      
      doc.setTextColor(59, 130, 246);
      doc.text(formatCurrency(scenario.totalAmount), colX[5], yPos + 4.5);
      
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
    const bestInterest = Math.max(...comparisonScenarios.map(s => s.simpleInterest));
    const bestTotal = Math.max(...comparisonScenarios.map(s => s.totalAmount));
    const bestInterestScenario = comparisonScenarios.find(s => s.simpleInterest === bestInterest);
    const bestTotalScenario = comparisonScenarios.find(s => s.totalAmount === bestTotal);
    
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Highest Interest Earned: ${bestInterestScenario?.name} at ${formatCurrency(bestInterest)}`, margin + 5, yPos);
    
    yPos += 5;
    doc.text(`• Highest Total Amount: ${bestTotalScenario?.name} at ${formatCurrency(bestTotal)}`, margin + 5, yPos);

    // Footer
    yPos = pageHeight - 22;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 4;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text('This comparison is based on the scenarios you entered using simple interest calculation.', pageWidth / 2, yPos, { align: 'center' });
    
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

    doc.save(`DapsiWow-Scenario-Comparison-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your scenario comparison report has been saved." 
    });
  };

  const exportToPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 12;

    // Blue header bar with branding
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 38, 'F');
    
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DapsiWow', pageWidth / 2, yPos + 5, { align: 'center' });
    
    yPos += 14;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Simple Interest Calculation Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(230, 240, 255);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    doc.text(`Report Date: ${currentDate}`, pageWidth / 2, yPos, { align: 'center' });

    // Executive Summary Box
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
    doc.text('Total Amount', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(24);
    doc.text(formatCurrency(result.totalAmount), pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    const interestPercent = ((result.simpleInterest / result.totalAmount) * 100).toFixed(1);
    doc.text(`Total Interest: ${formatCurrency(result.simpleInterest)} (${interestPercent}% of total amount)`, pageWidth / 2, yPos, { align: 'center' });

    // Input Parameters Box
    yPos += 12;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 40, 3, 3, 'FD');
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('INPUT PARAMETERS', margin + 4, yPos);
    
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
    doc.text('Principal Amount', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.principalAmount), col2X, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Interest Rate', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${interestRate}% per year`, col4X, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Time Period', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${timePeriod} ${timeUnit}`, col2X, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Monthly Interest', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.monthlyInterest), col4X, yPos);

    // Results Summary Box
    yPos += 12;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 24, 3, 3, 'FD');
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('CALCULATION RESULTS', margin + 4, yPos);
    
    yPos += 2;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Simple Interest Earned', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.simpleInterest), col2X, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Final Amount', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.totalAmount), col4X, yPos);
    
    // Yearly Breakdown if available
    if (result.yearlyBreakdown.length > 0) {
      yPos += 12;
      
      // Table header with blue background
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      const yearColX = margin + 8;
      const interestColX = margin + 60;
      const totalColX = pageWidth / 2 + 60;
      
      doc.text('Year', yearColX, yPos + 5);
      doc.text('Interest Earned', interestColX, yPos + 5);
      doc.text('Total Amount', totalColX, yPos + 5);
      
      yPos += 8;
      
      // Table rows with alternating colors
      result.yearlyBreakdown.forEach((year, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
          
          // Repeat header on new page
          doc.setFillColor(59, 130, 246);
          doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');
          
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          
          doc.text('Year', yearColX, yPos + 5);
          doc.text('Interest Earned', interestColX, yPos + 5);
          doc.text('Total Amount', totalColX, yPos + 5);
          
          yPos += 8;
        }
        
        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, yPos, pageWidth - (2 * margin), 6, 'F');
        }
        
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(`Year ${year.year}`, yearColX, yPos + 4);
        
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(year.interestEarned), interestColX, yPos + 4);
        
        doc.setTextColor(0, 0, 0);
        doc.text(formatCurrency(year.totalAmount), totalColX, yPos + 4);
        yPos += 6;
      });
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

    doc.save(`DapsiWow-Simple-Interest-Calculation-${new Date().getTime()}.pdf`);
    
    toast({
      title: "PDF Downloaded!", 
      description: "Your professional calculation report has been saved." 
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

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Simple Interest Calculator - Free Online SI Calculator | Calculate Interest I = P × R × T</title>
        <meta name="description" content="Calculate simple interest on loans, savings & investments using I = P × R × T formula. Free online calculator with instant results & detailed breakdowns. 100% free, no registration required." />
        <meta name="keywords" content="simple interest calculator, calculate simple interest, simple interest formula, interest calculator, SI calculator online, simple interest rate calculator, how to calculate simple interest, simple interest loan calculator, simple interest calculator monthly, simple interest calculator with principal rate time, simple vs compound interest calculator, simple interest calculator with regular deposits, simple interest calculator for savings, online simple interest calculator, simple interest calculator free, daily simple interest calculator, monthly simple interest calculator, simple interest vs compound interest calculator, how to find simple interest, what is simple interest calculator" />
        
        <meta property="og:title" content="Simple Interest Calculator - Calculate Interest Online Free | I = P × R × T Formula" />
        <meta property="og:description" content="Free simple interest calculator with formula I = P × R × T. Calculate interest on loans, savings & investments instantly. Get monthly & yearly breakdowns with visual charts & PDF export." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/simple-interest-calculator" />
        <meta property="og:site_name" content="DapsiWow - Free Financial Calculators & Tools" />
        <meta property="og:image" content="https://dapsiwow.com/og-simple-interest-calculator.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Simple Interest Calculator - Free Online Tool" />
        <meta property="og:locale" content="en_US" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Simple Interest Calculator - Free Online Tool | I = P × R × T" />
        <meta name="twitter:description" content="Calculate simple interest instantly with our free calculator. Get monthly breakdowns, yearly projections, and PDF reports. No registration required." />
        <meta name="twitter:image" content="https://dapsiwow.com/og-simple-interest-calculator.jpg" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="twitter:creator" content="@DapsiWow" />
        
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        
        <link rel="canonical" href="https://dapsiwow.com/tools/simple-interest-calculator" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Simple Interest Calculator - Free Online SI Calculator",
            "description": "Free simple interest calculator using formula I = P × R × T. Calculate interest on loans, savings, and investments with monthly breakdown, yearly projections, visual charts, and PDF export.",
            "url": "https://dapsiwow.com/simple-interest-Calculator",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Calculate simple interest using I = P × R × T formula",
              "Monthly and yearly interest breakdown",
              "Multiple currency support (USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, MXN)",
              "Visual charts and graphs",
              "PDF export and sharing",
              "Scenario comparison tool"
            ],
            "creator": {
              "@type": "Organization",
              "name": "DapsiWow"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is simple interest?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simple interest is a method of calculating interest on a loan or deposit where interest is calculated only on the principal amount. The formula is I = P × R × T, where I is interest, P is principal, R is rate (as decimal), and T is time in years. Unlike compound interest, simple interest does not accumulate on previously earned interest."
                }
              },
              {
                "@type": "Question",
                "name": "How do you calculate simple interest?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To calculate simple interest, use the formula: Simple Interest (I) = Principal (P) × Rate (R) × Time (T). Multiply your principal amount by the annual interest rate (as a decimal) and the time period in years. For example: $10,000 × 0.08 × 5 years = $4,000 interest."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between simple and compound interest?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simple interest is calculated only on the principal amount and remains constant each period, while compound interest is calculated on the principal plus accumulated interest. Simple interest grows linearly while compound interest grows exponentially. For investments, compound interest typically yields higher returns; for loans, simple interest results in lower total interest paid."
                }
              },
              {
                "@type": "Question",
                "name": "How do I calculate monthly simple interest?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To calculate monthly simple interest, first calculate total annual interest using I = P × R × T, then divide by 12. Formula: Monthly Interest = (P × R × T) / 12. Example: If principal is $10,000, rate is 8%, and time is 5 years, monthly interest = ($10,000 × 0.08 × 5) / (5 × 12) = $66.67 per month."
                }
              },
              {
                "@type": "Question",
                "name": "When is simple interest used?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simple interest is commonly used for: short-term loans (auto loans, personal loans), certificates of deposit (CDs), bonds, treasury bills, and some savings accounts. It's preferred when you want predictable, fixed interest payments."
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Calculate Simple Interest",
            "description": "Step-by-step guide to calculate simple interest using the formula I = P × R × T",
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "Identify the Principal Amount (P)",
                "text": "Determine the initial amount of money you're investing or borrowing. This is your principal amount (P)."
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "Determine the Interest Rate (R)",
                "text": "Find the annual interest rate and convert it to a decimal by dividing by 100. For example, 8% becomes 0.08."
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "Calculate the Time Period (T)",
                "text": "Determine the time period in years. If you have months, divide by 12. For example, 36 months = 3 years."
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "Apply the Formula I = P × R × T",
                "text": "Multiply the principal amount (P) by the interest rate (R) and the time period (T) to get the simple interest (I)."
              },
              {
                "@type": "HowToStep",
                "position": 5,
                "name": "Calculate Total Amount",
                "text": "Add the simple interest to the principal amount to get the total amount: A = P + I or A = P(1 + RT)."
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
                "item": "https://dapsiwow.com/tools/finance-tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Simple Interest Calculator",
                "item": "https://dapsiwow.com/tools/simple-interest-calculator"
              }
            ]
          })}
        </script>
      </Helmet>
      
      <Header />
      
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors" itemProp="item">
                <Home className="w-4 h-4" />
                <span className="sr-only" itemProp="name">Home</span>
                <meta itemProp="position" content="1" />
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/tools/finance-tools" className="text-gray-500 hover:text-blue-600 transition-colors" itemProp="item">
                <span itemProp="name">Finance Tools</span>
                <meta itemProp="position" content="2" />
              </Link>
            </li>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-gray-900 font-medium" itemProp="name">Simple Interest Calculator</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </div>
      </nav>
      
      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-700" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">Professional Simple Interest Calculator - Free & Accurate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0" data-testid="page-title">
                <span className="block">Simple Interest Calculator</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Calculate Interest Using I = P × R × T Formula
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Free online simple interest calculator for loans, savings, and investments. Calculate interest using the formula I = P × R × T (Interest = Principal × Rate × Time). Get instant results with monthly breakdown, yearly projections, visual charts, and multiple currency support. Perfect for auto loans, personal loans, bonds, certificates of deposit, and financial planning. 100% free, no registration required.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Easy Formula</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Percent className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Multi-Currency</span>
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
                <div className="text-2xl font-bold text-gray-900">1.8M+</div>
                <div className="text-sm text-gray-600">Calculations Performed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100% Free</div>
                <div className="text-sm text-gray-600">No Registration Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">Accurate</div>
                <div className="text-sm text-gray-600">SI = P × R × T Formula</div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">How to Use This Simple Interest Calculator</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">1</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Select Currency</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Choose from 10 major currencies including USD, EUR, GBP, INR, and more for accurate calculations.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">2</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Enter Principal</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Input the initial amount you're investing or borrowing - this is your principal amount.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">3</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Set Interest Rate</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Enter the annual interest rate percentage. Our calculator will handle the conversion automatically.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">4</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Choose Time Period</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Select the duration in years or months, then click Calculate to see your interest breakdown.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Tool Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Interest Configuration</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your investment details to calculate simple interest earnings</p>
                  </div>
                  
                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      {/* Currency Selection */}
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
                              <p className="max-w-xs text-sm">Select the currency for your calculation</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
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
                              <p className="max-w-xs text-sm">The initial amount you invest or borrow</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">$</span>
                          <Input
                            id="principal"
                            type="number"
                            value={principal}
                            onChange={(e) => setPrincipal(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="10,000"
                            data-testid="input-principal"
                          />
                        </div>
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
                              <p className="max-w-xs text-sm">The yearly interest rate as a percentage</p>
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
                            placeholder="8.00"
                            step="0.01"
                            data-testid="input-interest-rate"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                      </div>

                      {/* Time Period */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Time Period</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">Duration of the loan or investment</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="5"
                            min="1"
                            data-testid="input-time-period"
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
                      </div>
                    </div>
                  </TooltipProvider>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateSimpleInterest}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Interest
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

                  {/* Interest Configuration Action Buttons */}
                  {result && (
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 print:hidden">
                      <Button
                        onClick={() => setShowChart(!showChart)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-show-chart"
                      >
                        <PieChartIcon className="w-4 h-4 mr-1" />
                        {showChart ? 'Hide' : 'Show'} Chart
                      </Button>
                      <Button
                        onClick={() => setShowYearlyBreakdown(!showYearlyBreakdown)}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-toggle-yearly"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        {showYearlyBreakdown ? 'Hide' : 'Show'} Yearly Breakdown
                      </Button>
                      <Button
                        onClick={addToComparison}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                        data-testid="button-add-comparison"
                      >
                        Add to Comparison
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
                        onClick={exportToPDF}
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

                {/* Results Section */}
                {result ? (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Interest Calculation Results</h2>
                    
                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="interest-results">
                      {/* Summary Card */}
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-3 sm:space-y-4">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-blue-900">
                            Simple Interest Calculation Result
                          </h3>
                          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 break-all" data-testid="text-simple-interest">
                            {formatCurrency(result.simpleInterest)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Interest earned over {timePeriod} {timeUnit}
                          </div>
                          <Button
                            onClick={() => {
                              const resultText = `Simple Interest: ${formatCurrency(result.simpleInterest)} | Total Amount: ${formatCurrency(result.totalAmount)} | Principal: ${formatCurrency(result.principalAmount)}`;
                              handleCopyToClipboard(resultText);
                            }}
                            variant="outline"
                            size="sm"
                            className="mt-2 sm:mt-3 rounded-lg text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2"
                          >
                            Copy Result
                          </Button>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Investment Summary</h3>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Principal Amount</span>
                              <span className="font-bold text-xs sm:text-sm break-all" data-testid="text-principal-amount">
                                {formatCurrency(result.principalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Interest Earned</span>
                              <span className="font-bold text-xs sm:text-sm text-green-600 break-all">
                                {formatCurrency(result.simpleInterest)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Total Amount</span>
                              <span className="font-bold text-xs sm:text-sm text-blue-600 break-all" data-testid="text-total-amount">
                                {formatCurrency(result.totalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Monthly Interest</span>
                              <span className="font-bold text-xs sm:text-sm text-purple-600 break-all" data-testid="text-monthly-interest">
                                {formatCurrency(result.monthlyInterest)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Interest Breakdown</h3>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Interest Rate</span>
                              <span className="font-bold text-xs sm:text-sm">
                                {interestRate}% per year
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Time Period</span>
                              <span className="font-bold text-xs sm:text-sm">
                                {timePeriod} {timeUnit}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Formula Used</span>
                              <span className="font-bold text-xs sm:text-sm font-mono">
                                SI = P × R × T
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-gray-600">Return Percentage</span>
                              <span className="font-bold text-xs sm:text-sm text-green-600">
                                {((result.simpleInterest / result.principalAmount) * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Charts Section */}
                      {showChart && (
                        <div className="space-y-4 sm:space-y-6">
                          {/* Donut Chart - Total Breakdown */}
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-base sm:text-lg">Total Investment Breakdown</h3>
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6">
                              <div className="w-full max-w-[280px] sm:max-w-xs">
                                <ResponsiveContainer width="100%" height={280}>
                                  <PieChart>
                                    <Pie
                                      data={[
                                        { 
                                          name: 'Principal', 
                                          value: result.principalAmount,
                                          percentage: (result.principalAmount / result.totalAmount) * 100
                                        },
                                        { 
                                          name: 'Interest', 
                                          value: result.simpleInterest,
                                          percentage: (result.simpleInterest / result.totalAmount) * 100
                                        }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={90}
                                      paddingAngle={3}
                                      dataKey="value"
                                      label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                                      labelLine={true}
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
                                        fontSize: '14px'
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
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 w-full lg:w-auto">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Principal Amount</span>
                                  </div>
                                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 break-all">{formatCurrency(result.principalAmount)}</div>
                                  <div className="text-xs sm:text-sm text-green-700 mt-1">{((result.principalAmount / result.totalAmount) * 100).toFixed(1)}% of total</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full"></div>
                                    <span className="font-semibold text-gray-700 text-xs sm:text-sm">Interest Earned</span>
                                  </div>
                                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 break-all">{formatCurrency(result.simpleInterest)}</div>
                                  <div className="text-xs sm:text-sm text-orange-700 mt-1">{((result.simpleInterest / result.totalAmount) * 100).toFixed(1)}% of total</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bar Chart - Yearly Growth */}
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-base sm:text-lg">Yearly Interest Growth</h3>
                            <ResponsiveContainer width="100%" height={280}>
                              <BarChart data={result.yearlyBreakdown.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="year" 
                                  tick={{ fontSize: 12, fill: '#6b7280' }}
                                  stroke="#9ca3af"
                                />
                                <YAxis 
                                  tick={{ fontSize: 12, fill: '#6b7280' }}
                                  stroke="#9ca3af"
                                />
                                <RechartsTooltip 
                                  formatter={(value: number) => formatCurrency(value)}
                                  contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    fontSize: '14px'
                                  }}
                                />
                                <Legend 
                                  wrapperStyle={{ fontSize: '14px' }}
                                />
                                <Bar 
                                  dataKey="cumulativeInterest" 
                                  fill="url(#barGradient)" 
                                  name="Cumulative Interest"
                                  radius={[8, 8, 0, 0]}
                                />
                                <defs>
                                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
                                  </linearGradient>
                                </defs>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Yearly Breakdown */}
                      {showYearlyBreakdown && result.yearlyBreakdown.length > 0 && (
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <h3 
                              className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors select-none"
                              onClick={() => setShowYearlyBreakdown(false)}
                              title="Click to hide breakdown"
                            >
                              Yearly Interest Breakdown
                            </h3>
                            <Button
                              onClick={handleDownloadYearlyBreakdownPDF}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 w-full sm:w-auto justify-center"
                              data-testid="button-export-breakdown-pdf"
                            >
                              <Download className="w-4 h-4" />
                              Export PDF
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">See how your interest accumulates year by year.</p>
                          <div 
                            ref={yearlyBreakdownScrollRef}
                            className={`overflow-x-auto -mx-4 sm:mx-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            onMouseDown={(e) => handleMouseDown(e, yearlyBreakdownScrollRef)}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={(e) => handleMouseMove(e, yearlyBreakdownScrollRef)}
                          >
                            <table className="w-full min-w-[600px] select-none" data-testid="yearly-breakdown-table">
                              <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-sm rounded-l-lg">Year</th>
                                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Interest Earned</th>
                                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Cumulative Interest</th>
                                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm rounded-r-lg">Total Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {result.yearlyBreakdown.map((year) => (
                                  <tr key={year.year} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 text-xs sm:text-sm">{year.year}</td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-green-600 font-bold text-xs sm:text-sm">
                                      {formatCurrency(year.interestEarned)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-blue-600 font-bold text-xs sm:text-sm">
                                      {formatCurrency(year.cumulativeInterest)}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-purple-600 font-bold text-xs sm:text-sm">
                                      {formatCurrency(year.totalAmount)}
                                    </td>
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
                    <div className="text-center py-12 sm:py-16" data-testid="no-results">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-base sm:text-lg px-4">Enter investment details and calculate to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {showComparison && comparisonScenarios.length > 0 && (
            <Card className="mt-6 sm:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Scenario Comparison</h3>
                  <Button
                    onClick={handleDownloadComparisonPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    data-testid="button-export-comparison-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Compare different investment scenarios side-by-side to find the best option.</p>
                <div 
                  ref={comparisonScrollRef}
                  className={`overflow-x-auto -mx-4 sm:mx-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={(e) => handleMouseDown(e, comparisonScrollRef)}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={(e) => handleMouseMove(e, comparisonScrollRef)}
                >
                  <table className="w-full min-w-[600px] select-none" data-testid="comparison-table">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-gray-900 text-xs sm:text-sm rounded-l-lg">Scenario</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Principal</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Rate</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Time (yrs)</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm">Interest</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm rounded-r-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {comparisonScenarios.map((scenario, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-900 font-bold text-xs sm:text-sm">{scenario.name}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(scenario.principal)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {scenario.rate}%
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-gray-900 font-medium text-xs sm:text-sm">
                            {scenario.time.toFixed(1)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-green-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(scenario.simpleInterest)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-blue-600 font-bold text-xs sm:text-sm">
                            {formatCurrency(scenario.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 sm:mt-6">
                  <Button
                    onClick={() => setComparisonScenarios([])}
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

          {/* SEO Content Sections */}
          <div className="mt-12 sm:mt-16 space-y-8 sm:space-y-12">
            {/* What is Simple Interest Calculator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-7 leading-tight">
                  What is a Simple Interest Calculator?
                </h2>
                <div className="prose max-w-none text-gray-700 space-y-4 sm:space-y-5 md:space-y-6">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed sm:leading-relaxed md:leading-loose">
                    A simple interest calculator is a free online financial tool that helps you calculate the interest earned or paid on a principal amount over a specific time period using the simple interest formula (SI = P × R × T). Unlike compound interest, simple interest is calculated only on the original principal amount, making it easier to understand and ideal for short-term loans, bonds, and certificates of deposit.
                  </p>
                  
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-3 sm:mb-3.5 md:mb-4 lg:mb-5 leading-tight">
                    How Does Simple Interest Work?
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed sm:leading-relaxed md:leading-loose">
                    Simple interest is calculated by multiplying the principal amount by the interest rate and the time period. The formula is straightforward: SI = P × R × T, where P is the principal (initial amount), R is the annual interest rate (as a decimal), and T is the time in years. This means if you invest $10,000 at 5% simple interest for 3 years, you'll earn $1,500 in interest (10,000 × 0.05 × 3 = 1,500).
                  </p>

                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-3 sm:mb-3.5 md:mb-4 lg:mb-5 leading-tight">
                    Benefits of Using a Simple Interest Calculator
                  </h3>
                  <ul className="list-disc pl-5 sm:pl-6 md:pl-7 lg:pl-8 space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5 text-sm sm:text-base md:text-lg">
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Quick calculations:</strong> Get instant results without manual math or complex formulas
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Compare investments:</strong> Evaluate different principal amounts, rates, and time periods
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Plan finances:</strong> Understand exactly how much interest you'll earn or pay
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Multi-currency support:</strong> Calculate in your preferred currency with proper formatting
                    </li>
                    <li className="leading-relaxed sm:leading-relaxed md:leading-loose pl-1 sm:pl-2">
                      <strong className="font-semibold text-gray-900">Free and accessible:</strong> No registration, downloads, or hidden fees required
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Simple Interest Formula */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Simple Interest Formula Explained</h2>
                <div className="prose max-w-none text-gray-700 space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed">
                  <p>
                    The simple interest formula is one of the most fundamental concepts in finance. It calculates interest based solely on the principal amount, making it transparent and easy to understand for both borrowers and investors.
                  </p>

                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">The Simple Interest Formula</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl my-3 sm:my-4">
                    <p className="text-center text-lg sm:text-xl md:text-2xl font-bold text-blue-700 mb-3 sm:mb-4">SI = P × R × T</p>
                    <div className="space-y-1.5 sm:space-y-2 text-gray-800 text-xs sm:text-sm md:text-base">
                      <p><strong>SI</strong> = Simple Interest (the amount of interest earned or paid)</p>
                      <p><strong>P</strong> = Principal amount (initial investment or loan)</p>
                      <p><strong>R</strong> = Annual interest rate (expressed as a decimal: 8% = 0.08)</p>
                      <p><strong>T</strong> = Time period in years (or converted to years for months/days)</p>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">Step-by-Step Calculation Example</h3>
                  <div className="bg-green-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                    <p className="font-bold mb-2 sm:mb-3 text-xs sm:text-sm md:text-base">Example: Calculate simple interest on $15,000 at 6% for 4 years</p>
                    <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm md:text-base">
                      <li>• Principal (P) = $15,000</li>
                      <li>• Interest Rate (R) = 6% = 0.06</li>
                      <li>• Time (T) = 4 years</li>
                      <li className="pt-2 border-t border-green-200 font-bold text-green-700">• Simple Interest = $15,000 × 0.06 × 4 = $3,600</li>
                      <li>• Total Amount = $15,000 + $3,600 = $18,600</li>
                    </ul>
                  </div>

                  <p className="mt-4 sm:mt-6">
                    Our calculator automates this entire process, handling currency formatting, time conversions, and providing detailed breakdowns including monthly interest and yearly projections—saving you time and eliminating calculation errors.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Simple vs Compound Interest Comparison */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Simple Interest vs Compound Interest: Key Differences</h2>
                <div className="prose max-w-none text-gray-700 space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed">
                  <p>
                    Understanding the difference between simple and compound interest is crucial for making informed financial decisions. Here's a detailed comparison of these two interest calculation methods:
                  </p>

                  <div className="overflow-x-auto mt-4 sm:mt-6 -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <tr>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">Feature</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">Simple Interest</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-bold">Compound Interest</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">Calculation Base</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Principal only</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Principal + accumulated interest</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">Growth Pattern</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Linear (constant)</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Exponential (accelerating)</td>
                          </tr>
                          <tr className="hover:bg-gray-50 bg-blue-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">Best For</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Short-term loans, bonds, CDs</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Long-term investments, savings</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">Borrower Benefit</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-green-600 font-bold text-xs sm:text-sm md:text-base">Lower total interest</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-red-600 font-bold text-xs sm:text-sm md:text-base">Higher total interest</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">Investor Benefit</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Predictable returns</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-green-600 font-bold text-xs sm:text-sm md:text-base">Higher returns over time</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm md:text-base">Formula Complexity</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Simple: P × R × T</td>
                            <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-gray-700 text-xs sm:text-sm md:text-base">Complex: P(1 + r/n)^(nt)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 md:p-6 mt-4 sm:mt-6 rounded-r-lg">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">💡 Key Takeaway</h4>
                    <p className="text-xs sm:text-sm md:text-base">
                      For a $10,000 investment at 8% for 5 years: Simple interest earns $4,000, while compound interest (annual compounding) earns $4,693. For borrowers, simple interest saves money. For investors, compound interest maximizes returns over time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* When to Use Simple Interest */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">When to Use Simple Interest Calculator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      Short-Term Loans
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Personal loans with terms of 6-24 months, payday loans, bridge financing, and equipment leasing. Simple interest provides transparent cost calculations, making it easier to compare loan offers and understand exactly what you'll pay.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      Fixed-Income Investments
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Government and corporate bonds, treasury bills, certificates of deposit (CDs), and fixed deposits. These investments offer predictable returns calculated using simple interest, ideal for conservative investors seeking stability.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      Financial Planning
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Budget planning, loan comparison analysis, educational purposes, and teaching basic financial concepts. The straightforward calculation makes it perfect for understanding interest fundamentals before exploring more complex financial products.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      </div>
                      Business Applications
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Invoice financing, accounts receivable factoring, trade credit, and working capital loans. Businesses use simple interest for short-term cash flow management and transparent vendor payment terms that are easy to calculate and verify.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Frequently Asked Questions About Simple Interest</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">How do I calculate simple interest manually?</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        Use the formula SI = P × R × T. Multiply your principal amount by the interest rate (as a decimal) and the time in years. For example, $5,000 at 4% for 2 years: $5,000 × 0.04 × 2 = $400 interest.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">What's the difference between simple interest and APR?</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        Simple interest only accounts for the principal and interest rate. APR (Annual Percentage Rate) includes additional fees like origination fees, closing costs, and other charges, giving you the true cost of borrowing.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Can I use this calculator for monthly payments?</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        Yes! Our calculator shows monthly interest amounts in the results breakdown. For loans with monthly payments, you can divide the total interest by the number of months to estimate average monthly interest charges.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Why is simple interest better for borrowers?</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        Simple interest calculates interest only on the principal, so you pay less total interest compared to compound interest. This makes simple interest loans more affordable, especially for short-term borrowing needs.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">How accurate is this simple interest calculator?</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        Our calculator uses the standard SI = P × R × T formula and provides accurate results for planning purposes. For official loan documents, always verify with your lender as they may include additional fees or use different calculation methods.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Can I calculate simple interest for days or months?</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        Yes! Select "Months" in the time period dropdown for calculations less than a year. For daily calculations, convert days to years by dividing by 365 (e.g., 90 days = 90/365 = 0.247 years).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips for Using Simple Interest */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Tips for Maximizing Simple Interest Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">1. Compare Rates Before Borrowing</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Even a 0.5% difference in interest rates can save hundreds of dollars. Use our calculator to compare multiple loan offers by entering different rates and see the total interest difference instantly.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">2. Choose Shorter Terms When Possible</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      With simple interest, shorter loan terms mean less total interest paid. If you can afford higher monthly payments, opt for a shorter term to minimize overall borrowing costs.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">3. Understand Your Investment Timeline</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Simple interest works best for short to medium-term investments (under 5 years). For longer periods, consider compound interest investments which can provide significantly higher returns.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">4. Factor in All Costs</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      Remember that simple interest calculators show interest only. When comparing loans, also consider origination fees, processing charges, prepayment penalties, and other costs that affect the total expense.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-World Simple Interest Examples */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Real-World Simple Interest Calculation Examples</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  Learn how to apply simple interest calculations with these practical, real-world examples:
                </p>
                
                <div className="space-y-6 sm:space-y-8">
                  {/* Example 1: Car Loan */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-5 md:p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      Auto Loan with Simple Interest
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                      <strong>Scenario:</strong> You take out a $20,000 car loan at 6% simple interest for 3 years.
                    </p>
                    <div className="bg-white p-3 sm:p-4 rounded-lg space-y-2 text-sm sm:text-base">
                      <p><strong>Principal (P):</strong> $20,000</p>
                      <p><strong>Rate (R):</strong> 6% = 0.06</p>
                      <p><strong>Time (T):</strong> 3 years</p>
                      <p className="pt-2 border-t border-blue-200"><strong>Calculation:</strong> SI = $20,000 × 0.06 × 3 = $3,600</p>
                      <p className="font-bold text-blue-700"><strong>Total Amount to Repay:</strong> $20,000 + $3,600 = $23,600</p>
                      <p className="text-gray-600"><strong>Monthly Interest:</strong> $3,600 ÷ 36 months = $100/month</p>
                    </div>
                  </div>

                  {/* Example 2: Personal Loan */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-5 md:p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      Personal Loan Simple Interest Calculation
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                      <strong>Scenario:</strong> You borrow $5,000 for 18 months at 8.5% annual simple interest.
                    </p>
                    <div className="bg-white p-3 sm:p-4 rounded-lg space-y-2 text-sm sm:text-base">
                      <p><strong>Principal (P):</strong> $5,000</p>
                      <p><strong>Rate (R):</strong> 8.5% = 0.085</p>
                      <p><strong>Time (T):</strong> 18 months = 1.5 years</p>
                      <p className="pt-2 border-t border-green-200"><strong>Calculation:</strong> SI = $5,000 × 0.085 × 1.5 = $637.50</p>
                      <p className="font-bold text-green-700"><strong>Total Repayment:</strong> $5,000 + $637.50 = $5,637.50</p>
                      <p className="text-gray-600"><strong>Monthly Interest:</strong> $637.50 ÷ 18 months = $35.42/month</p>
                    </div>
                  </div>

                  {/* Example 3: Investment/Savings */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-5 md:p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      Certificate of Deposit (CD) Investment
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                      <strong>Scenario:</strong> You invest $10,000 in a 2-year CD with 4.5% simple interest.
                    </p>
                    <div className="bg-white p-3 sm:p-4 rounded-lg space-y-2 text-sm sm:text-base">
                      <p><strong>Principal (P):</strong> $10,000</p>
                      <p><strong>Rate (R):</strong> 4.5% = 0.045</p>
                      <p><strong>Time (T):</strong> 2 years</p>
                      <p className="pt-2 border-t border-purple-200"><strong>Calculation:</strong> SI = $10,000 × 0.045 × 2 = $900</p>
                      <p className="font-bold text-purple-700"><strong>Maturity Value:</strong> $10,000 + $900 = $10,900</p>
                      <p className="text-gray-600"><strong>Annual Interest Earned:</strong> $900 ÷ 2 = $450/year</p>
                    </div>
                  </div>

                  {/* Example 4: Bond Investment */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 sm:p-5 md:p-6 rounded-xl border border-orange-200">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                      Government Bond with Simple Interest
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                      <strong>Scenario:</strong> You purchase a $15,000 government bond with 3.75% annual simple interest for 5 years.
                    </p>
                    <div className="bg-white p-3 sm:p-4 rounded-lg space-y-2 text-sm sm:text-base">
                      <p><strong>Principal (P):</strong> $15,000</p>
                      <p><strong>Rate (R):</strong> 3.75% = 0.0375</p>
                      <p><strong>Time (T):</strong> 5 years</p>
                      <p className="pt-2 border-t border-orange-200"><strong>Calculation:</strong> SI = $15,000 × 0.0375 × 5 = $2,812.50</p>
                      <p className="font-bold text-orange-700"><strong>Total Value at Maturity:</strong> $15,000 + $2,812.50 = $17,812.50</p>
                      <p className="text-gray-600"><strong>Annual Interest Payment:</strong> $2,812.50 ÷ 5 = $562.50/year</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Pro Tip for Borrowers
                  </h4>
                  <p className="text-sm sm:text-base text-gray-700">
                    When comparing loan offers, always ask if the interest is simple or compound. Simple interest loans can save you thousands of dollars over the loan term, especially for short to medium-term borrowing needs. Use our calculator above to compare different scenarios instantly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Simple Interest Calculator Use Cases */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Who Uses Simple Interest Calculators?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      Individual Borrowers
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                        <span>Calculate auto loan interest before signing contracts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                        <span>Compare personal loan offers from different lenders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                        <span>Plan for short-term borrowing needs with clarity</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Calculator className="w-6 h-6 text-green-600" />
                      Investors & Savers
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                        <span>Evaluate returns on bonds and treasury bills</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                        <span>Calculate interest on certificates of deposit (CDs)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                        <span>Plan fixed-income investment strategies</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <PieChartIcon className="w-6 h-6 text-purple-600" />
                      Financial Professionals
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
                        <span>Quick loan calculations for client consultations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
                        <span>Demonstrate interest concepts to clients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
                        <span>Prepare financial reports and projections</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-orange-600" />
                      Students & Educators
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-orange-600 flex-shrink-0" />
                        <span>Learn and teach fundamental finance concepts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-orange-600 flex-shrink-0" />
                        <span>Verify homework and assignment calculations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 text-orange-600 flex-shrink-0" />
                        <span>Understand real-world financial applications</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Financial Calculators */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Related Financial Calculators</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-7 md:mb-8">
                  Explore our other free financial calculators to make informed decisions about your money:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                  <a href="/tools/compound-interest-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Compound Interest Calculator</h3>
                    <p className="text-xs sm:text-sm text-gray-600">See how your investments grow exponentially over time</p>
                  </a>
                  <a href="/tools/loan-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Loan Calculator</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Calculate monthly payments and total loan costs</p>
                  </a>
                  <a href="/tools/investment-return-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Investment Return Calculator</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Calculate returns on your investments with accuracy</p>
                  </a>
                  <a href="/tools/mortgage-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Mortgage Calculator</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Calculate home loan payments including taxes and insurance</p>
                  </a>
                  <a href="/tools/emi-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">EMI Calculator</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Calculate equated monthly installments for loans</p>
                  </a>
                  <a href="/tools/future-value-investment-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Future Value Calculator</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Determine the future value of your investments</p>
                  </a>
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
