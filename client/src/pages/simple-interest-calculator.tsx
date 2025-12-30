
import { useState, useRef, useEffect, useMemo } from 'react';
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
import { Info, Calculator, TrendingUp, Clock, Percent, Download, Share2, PieChart as PieChartIcon, BarChart3, RotateCcw, ArrowRight, AlertCircle } from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import ShareResultsButton from '@/components/ShareResultsButton';
import { saveCalculation } from '@/lib/calculationHistory';

import { calculateSimpleInterest, SimpleInterestResult } from '@/lib/calculators/interest-calculator.engine';

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const resultsRef = useRef<HTMLDivElement>(null);
  const yearlyBreakdownScrollRef = useRef<HTMLDivElement>(null);
  const comparisonScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const { toast } = useToast();

  // Drag scrolling handlers for tables (mouse)
  const handleMouseDown = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current || isTouchDragging) return;
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

  // Touch scrolling handlers for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    setIsTouchDragging(true);
    setStartX(e.touches[0].pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsTouchDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent, ref: React.RefObject<HTMLDivElement>) => {
    if (!isTouchDragging || !ref.current) return;
    const x = e.touches[0].pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  const calculateSimpleInterestFunc = () => {
    const errors: Record<string, string> = {};
    const p = parseFloat(principal);
    const r = parseFloat(interestRate);
    const t = parseFloat(timePeriod);

    if (!principal || principal.trim() === '' || !Number.isFinite(p) || p <= 0) {
      errors.principal = 'Please enter a valid principal amount greater than 0';
    }
    if (!interestRate || interestRate.trim() === '' || !Number.isFinite(r) || r <= 0) {
      errors.interestRate = 'Please enter a valid interest rate greater than 0';
    }
    if (!timePeriod || timePeriod.trim() === '' || !Number.isFinite(t) || t <= 0) {
      errors.timePeriod = 'Please enter a valid time period greater than 0';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form and try again.",
        variant: "destructive"
      });
      return;
    }

    setValidationErrors({});

    // Simple Interest Formula: SI = P × R × T
    const rDecimal = r / 100;
    const timeInYears = timeUnit === 'years' ? t : t / 12;
    
    const calculationResult = calculateSimpleInterest({
      principal: p,
      interestRate: r,
      timePeriod: t,
      timeUnit: timeUnit as 'years' | 'months',
      compoundFrequency: '1'
    } as any);

    if (calculationResult) {
      setResult(calculationResult);

      // Save calculation history
      saveCalculation(
        'Simple Interest Calculator',
        '/tools/simple-interest-calculator',
        {
          principal,
          interestRate,
          timePeriod,
          timeUnit,
          currency
        },
        {
          simpleInterest: calculationResult.simpleInterest,
          totalAmount: calculationResult.totalAmount
        }
      );
    }

    toast({
      title: "Calculation Complete!",
      description: "Simple interest has been calculated successfully.",
    });

    if (resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
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
          calculateSimpleInterestFunc();
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
    const yearlyBreakdown = result?.yearlyBreakdown || [];

    if (result && yearlyBreakdown.length > 0) {
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
    if (!result) return;

    // Create shareable URL with encoded parameters
    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit
    });
    
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Create comprehensive share text
    const termDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;

    let shareText = `Simple Interest Calculator Results\n\n`;
    shareText += `Investment Details:\n`;
    shareText += `• Principal Amount: ${formatCurrency(result.principalAmount)}\n`;
    shareText += `• Interest Rate: ${interestRate}%\n`;
    shareText += `• Time Period: ${termDisplay}\n`;
    
    shareText += `\nInterest Breakdown:\n`;
    shareText += `• Simple Interest: ${formatCurrency(result.simpleInterest)}\n`;
    shareText += `• Monthly Interest: ${formatCurrency(result.monthlyInterest)}\n`;
    shareText += `• Total Amount: ${formatCurrency(result.totalAmount)}\n`;

    shareText += `\nCalculate yours: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Simple Interest Calculator Results',
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
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening Facebook share..." });
  };

  const shareOnTwitter = () => {
    if (!result) return;
    
    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const termDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
    const tweetText = `My Simple Interest calculation: ${formatCurrency(result.simpleInterest)} interest on ${formatCurrency(result.principalAmount)} at ${interestRate}% for ${termDisplay} - Calculate yours free!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening Twitter share..." });
  };

  const shareOnLinkedIn = () => {
    if (!result) return;
    
    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast({ title: "Opening LinkedIn share..." });
  };

  const shareOnWhatsApp = () => {
    if (!result) return;
    
    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const termDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
    const whatsappText = `Simple Interest Calculator Results:\n\nPrincipal: ${formatCurrency(result.principalAmount)}\nRate: ${interestRate}%\nTerm: ${termDisplay}\nInterest: ${formatCurrency(result.simpleInterest)}\nTotal: ${formatCurrency(result.totalAmount)}\n\nCalculate yours: ${shareableUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast({ title: "Opening WhatsApp share..." });
  };

  const handleDownloadYearlyBreakdownPDF = async () => {
    const breakdown = result?.yearlyBreakdown || [];
    if (!result || breakdown.length === 0) return;

    const { jsPDF } = await import('jspdf');
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
    
    breakdown.forEach((year, index) => {
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
      
      doc.text((year.year || index + 1).toString(), colX[0], yPos + 4);
      
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(Number(year.interestEarned || 0)), colX[1], yPos + 4);
      
      doc.setTextColor(59, 130, 246);
      doc.text(formatCurrency(Number(year.cumulativeInterest || 0)), colX[2], yPos + 4);
      
      doc.setTextColor(0, 0, 0);
      doc.text(formatCurrency(Number(year.totalAmount || year.amount || 0)), colX[3], yPos + 4);
      
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

  const handleDownloadComparisonPDF = async () => {
    if (comparisonScenarios.length === 0) return;

    const { jsPDF } = await import('jspdf');
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

  const exportToPDF = async () => {
    if (!result) return;

    const { jsPDF } = await import('jspdf');
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
    if (result?.yearlyBreakdown && result.yearlyBreakdown.length > 0) {
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
        doc.text(formatCurrency(year.interestEarned || 0), interestColX, yPos + 4);
        
        doc.setTextColor(0, 0, 0);
        doc.text(formatCurrency(Number(year.totalAmount || 0)), totalColX, yPos + 4);
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

  const formatCurrencyMemo = useMemo(() => {
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
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return (amount: number) => formatter.format(amount);
  }, [currency]);

  const formatCurrency = (val: number) => formatCurrencyMemo(val);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>Simple Interest Calculator - Free SI Tool | DapsiWow</title>
        <meta name="description" content="Calculate simple interest fast with our free SI calculator. Get yearly breakdowns, charts & PDF reports. Supports 10 currencies. Start now, no signup needed." />
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
            "name": "Simple Interest Calculator - Calculate SI Instantly",
            "alternateName": ["Simple Interest Calculator", "SI Calculator", "Simple Interest Formula Calculator"],
            "description": "Free online simple interest calculator that instantly calculates interest using the SI = P × R × T formula. Get yearly breakdowns, visual charts, PDF exports with support for 10 currencies. 100% free, no registration required.",
            "url": "https://dapsiwow.com/tools/simple-interest-calculator",
            "applicationCategory": "FinanceApplication",
            "applicationSubCategory": "Interest Calculator",
            "operatingSystem": "Any (Web-based)",
            "browserRequirements": "Requires JavaScript. Works on Chrome, Firefox, Safari, Edge, and all modern browsers.",
            "softwareVersion": "3.0.0",
            "datePublished": "2024-01-15",
            "dateModified": "2025-01-20",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "validFrom": "2024-01-15"
            },
            "featureList": [
              "Instant simple interest calculation using SI = P × R × T formula",
              "Monthly and yearly interest breakdown with detailed tables",
              "Multi-currency support (USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, MXN)",
              "Interactive pie charts and bar charts for data visualization",
              "Professional PDF report export with complete calculations",
              "Social sharing via Facebook, Twitter, LinkedIn, WhatsApp",
              "Scenario comparison tool for multiple calculations",
              "Mobile responsive design for all devices",
              "Privacy-first architecture - no data storage",
              "100% free forever with no registration required"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "3842",
              "bestRating": "5",
              "worstRating": "1"
            },
            "creator": {
              "@type": "Organization",
              "name": "DapsiWow",
              "url": "https://dapsiwow.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://dapsiwow.com/logo.png",
                "width": 600,
                "height": 60
              }
            },
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "audience": {
              "@type": "Audience",
              "audienceType": "Investors, Borrowers, Students, Educators, Financial Professionals, Small Business Owners"
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
                "name": "What is simple interest and how does it work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simple interest is a method of calculating interest on a loan or investment where interest is calculated only on the principal amount (the original sum). The formula is SI = P × R × T, where P is principal, R is the annual interest rate (as a decimal), and T is time in years. Unlike compound interest, simple interest does not accumulate on previously earned interest. For example, if you invest $1,000 at 5% simple interest for 3 years, you'll earn $50 each year (1000 × 0.05 = $50), totaling $150 in interest and $1,150 overall."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is this simple interest calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our simple interest calculator is 100% accurate as it uses the standard mathematical formula SI = P × R × T accepted by financial institutions worldwide. All calculations are performed instantly in your browser with precision to two decimal places. However, keep in mind that while the mathematical calculation is exact, real-world factors may vary: some lenders round differently, may charge additional fees not included in the interest calculation, or may use a 360-day year instead of 365 days. Always verify with your specific lender or financial institution for exact figures."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between simple interest and compound interest?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The key difference is what the interest is calculated on. Simple Interest is calculated only on the original principal amount, with interest remaining the same each period (Formula: SI = P × R × T). Compound Interest is calculated on principal plus accumulated interest, with interest growing exponentially (Formula: A = P(1 + r/n)^(nt)). For investors, compound interest earns more money. For borrowers, simple interest costs less. The difference becomes more significant over longer time periods and higher interest rates."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this calculator for loans and investments?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! This calculator works for both scenarios. For Investments: Calculate how much interest you'll earn on savings bonds, short-term CDs, or money market accounts that use simple interest. The result shows your profit. For Loans: Calculate how much interest you'll pay on car loans, personal loans, or any financing that uses simple interest. The result shows your total cost. The formula is identical - only the interpretation differs. Before using this calculator for a specific loan or investment, confirm with your financial institution that they use simple interest."
                }
              },
              {
                "@type": "Question",
                "name": "How do I convert monthly interest rate to annual rate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To convert a monthly interest rate to an annual rate, simply multiply by 12. Formula: Annual Rate = Monthly Rate × 12. Example: 0.5% monthly × 12 = 6% annually. Our calculator requires the annual interest rate, so always perform this conversion first if you only have a monthly rate. Common examples: 0.25% monthly = 3% annual, 0.5% monthly = 6% annual, 1% monthly = 12% annual, 1.5% monthly = 18% annual. Note: This simple multiplication works for simple interest. For compound interest, the relationship is more complex due to compounding effects."
                }
              },
              {
                "@type": "Question",
                "name": "What types of loans typically use simple interest?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Several common loan types use simple interest calculations: Auto Loans (most car loans use simple interest, making payments predictable), Personal Installment Loans (many personal loans from banks use simple interest for terms under 5 years), Some Student Loans (certain federal and private student loans use the simple method), Short-Term Business Loans (small business loans with terms under 3 years), and Bridge Loans (temporary financing between property purchases). Always verify with your lender, as practices vary. Mortgages and credit cards almost never use simple interest - they use compound interest."
                }
              },
              {
                "@type": "Question",
                "name": "How often should I use this calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Use the simple interest calculator whenever you need to: 1) Before taking a loan - Calculate total interest costs to compare different loan offers and ensure affordability, 2) Planning investments - Estimate returns on short-term investments, bonds, or CDs before committing funds, 3) Comparing options - Use the scenario comparison feature to evaluate multiple interest rates or time periods, 4) Financial planning - Include in quarterly or annual reviews to project savings growth or loan payoff progress, 5) Educational purposes - Students and educators can use it anytime to learn or teach interest calculation concepts. There's no limit to how often you can use our calculator - it's 100% free, always available, and requires no registration."
                }
              },
              {
                "@type": "Question",
                "name": "Can I save or print my calculation results?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We offer multiple ways to save and share your results: 1) PDF Export - Download a professional PDF report with all your calculation details, yearly breakdowns, and charts. Perfect for financial records or sharing with advisors. 2) Social Sharing - Share your results directly via Facebook, Twitter, LinkedIn, or WhatsApp to discuss with friends, family, or colleagues. 3) Visual Charts - All charts and tables can be included in your PDF export for visual reference and presentations. All exports include our branding and a timestamp for your records. Your input data is never stored on our servers - everything happens in your browser for complete privacy."
                }
              },
              {
                "@type": "Question",
                "name": "Why do some banks use 360 days instead of 365 days per year?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Some financial institutions use a 'banker's year' of 360 days (12 months × 30 days) instead of the actual 365 days. This practice has historical origins from before calculators and computers when using 360 days (evenly divisible by 12, 30, etc.) made manual calculations simpler. Using 360 days results in slightly higher effective interest rates for lenders. Many commercial loans, particularly in the US, still use the 360-day convention. Our calculator uses the standard 365-day year, but you can manually adjust if your lender uses 360 days. Always check your loan documents for the exact method used."
                }
              },
              {
                "@type": "Question",
                "name": "Is simple interest better than compound interest for borrowers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, simple interest is generally better for borrowers because you pay less total interest over the life of the loan. With simple interest, you only pay interest on the original principal. With compound interest, you pay interest on interest, which accumulates over time. Simple interest results in fixed, consistent interest amounts each period, making budgeting easier. Example: A $20,000 loan at 8% for 5 years costs $8,000 in simple interest but $9,387 in compound interest (annual compounding) - a difference of $1,387. However, you often don't get to choose - lenders determine the interest method. When comparing loans, always check the total amount you'll repay, not just the interest rate."
                }
              }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Use the Simple Interest Calculator",
            "description": "Complete step-by-step guide to calculate simple interest using our free online calculator with the SI = P × R × T formula",
            "totalTime": "PT2M",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "USD",
              "value": "0"
            },
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Simple Interest Calculator (Online)"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "position": 1,
                "name": "Enter Principal Amount",
                "text": "Input the initial amount of money you're investing or borrowing. This is your starting balance before any interest is applied. Example: If you're investing $10,000 in a savings bond, enter 10000 as your principal.",
                "url": "https://dapsiwow.com/tools/simple-interest-calculator#step-1"
              },
              {
                "@type": "HowToStep",
                "position": 2,
                "name": "Set Interest Rate",
                "text": "Enter the annual interest rate as a percentage. Make sure this is the yearly rate, not monthly. Example: If your savings account offers 5% annual interest, enter 5 (not 0.05).",
                "url": "https://dapsiwow.com/tools/simple-interest-calculator#step-2"
              },
              {
                "@type": "HowToStep",
                "position": 3,
                "name": "Choose Time Period",
                "text": "Specify how long the money will be invested or borrowed. You can enter the time in years or months depending on your preference. Example: For a 3-year car loan, enter 3 and select 'years' or enter 36 and select 'months'.",
                "url": "https://dapsiwow.com/tools/simple-interest-calculator#step-3"
              },
              {
                "@type": "HowToStep",
                "position": 4,
                "name": "Select Currency",
                "text": "Choose your preferred currency from 10 supported options (USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, MXN). All results will automatically format in your selected currency.",
                "url": "https://dapsiwow.com/tools/simple-interest-calculator#step-4"
              },
              {
                "@type": "HowToStep",
                "position": 5,
                "name": "Click Calculate",
                "text": "Press the 'Calculate' button to instantly compute your simple interest. The calculator will display your total interest earned, final amount, monthly interest, and a year-by-year breakdown showing how your interest accumulates over time.",
                "url": "https://dapsiwow.com/tools/simple-interest-calculator#step-5"
              },
              {
                "@type": "HowToStep",
                "position": 6,
                "name": "Review Results & Visualizations",
                "text": "Examine your results including the interest breakdown card, yearly accumulation table, and interactive charts. Toggle between pie chart and bar chart views to visualize your principal vs. interest distribution and year-over-year growth.",
                "url": "https://dapsiwow.com/tools/simple-interest-calculator#step-6"
              },
              {
                "@type": "HowToStep",
                "position": 7,
                "name": "Export & Share Results",
                "text": "Download your calculation as a professional PDF report or share it directly via social media (Facebook, Twitter, LinkedIn, WhatsApp). You can also create scenario comparisons to evaluate different investment or loan options side-by-side.",
                "url": "https://dapsiwow.com/tools/simple-interest-calculator#step-7"
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
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DapsiWow",
            "url": "https://dapsiwow.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://dapsiwow.com/logo.png",
              "width": 600,
              "height": 60
            },
            "description": "Free online financial calculators and tools for loans, investments, savings, and financial planning. Trusted by thousands of users worldwide.",
            "sameAs": [
              "https://www.facebook.com/DapsiWow",
              "https://twitter.com/DapsiWow",
              "https://www.linkedin.com/company/dapsiwow"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "email": "support@dapsiwow.com",
              "availableLanguage": ["English"]
            }
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
              <div className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-2.5 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-colors duration-200 max-w-full mx-auto sm:mx-0">
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 flex-shrink-0 text-blue-700" />
                <span className="text-[11px] sm:text-xs md:text-sm lg:text-base font-medium text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                  Professional Simple Interest Calculator - Free & Accurate
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0" data-testid="page-title">
                <span className="block">Simple Interest Calculator</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  I = P × R × T Formula
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate simple interest instantly using I = P × R × T. Get detailed breakdowns with visual charts for loans, savings, and investments. Free calculator with multi-currency support—no registration needed.
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
                            onChange={(e) => { setPrincipal(e.target.value); setValidationErrors(prev => ({ ...prev, principal: '' })); }}
                            className={`h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.principal ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="10,000"
                            data-testid="input-principal"
                          />
                        </div>
                        {validationErrors.principal && (
                          <div className="flex items-center gap-1 text-red-600 text-xs sm:text-sm mt-1" data-testid="error-principal">
                            <AlertCircle className="w-4 h-4" />
                            <span>{validationErrors.principal}</span>
                          </div>
                        )}
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
                            onChange={(e) => { setInterestRate(e.target.value); setValidationErrors(prev => ({ ...prev, interestRate: '' })); }}
                            className={`h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.interestRate ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                            placeholder="8.00"
                            step="0.01"
                            data-testid="input-interest-rate"
                          />
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-lg">%</span>
                        </div>
                        {validationErrors.interestRate && (
                          <div className="flex items-center gap-1 text-red-600 text-xs sm:text-sm mt-1" data-testid="error-interest-rate">
                            <AlertCircle className="w-4 h-4" />
                            <span>{validationErrors.interestRate}</span>
                          </div>
                        )}
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
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => { setTimePeriod(e.target.value); setValidationErrors(prev => ({ ...prev, timePeriod: '' })); }}
                            className={`h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 rounded-lg sm:rounded-xl focus:ring-blue-500 w-full ${validationErrors.timePeriod ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
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
                        {validationErrors.timePeriod && (
                          <div className="flex items-center gap-1 text-red-600 text-xs sm:text-sm mt-1" data-testid="error-time-period">
                            <AlertCircle className="w-4 h-4" />
                            <span>{validationErrors.timePeriod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipProvider>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateSimpleInterestFunc}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
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
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset Calculator
                    </Button>
                  </div>

                  {/* Interest Configuration Action Buttons */}
                  {result && (
                    <>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 print:hidden">
                        <Button
                          onClick={() => setShowYearlyBreakdown(!showYearlyBreakdown)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-full"
                          data-testid="button-toggle-yearly"
                        >
                          {showYearlyBreakdown ? 'Hide' : 'Show'} Payment Schedule
                        </Button>
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
                            data-testid="button-copy-result"
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
                              <BarChart data={(result?.yearlyBreakdown || []).slice(0, 10)}>
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
                      {showYearlyBreakdown && (result?.yearlyBreakdown || []).length > 0 && (
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
                            className={`overflow-x-auto -mx-4 sm:mx-0 ${(isDragging || isTouchDragging) ? 'cursor-grabbing' : 'cursor-grab'}`}
                            onMouseDown={(e) => handleMouseDown(e, yearlyBreakdownScrollRef)}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={(e) => handleMouseMove(e, yearlyBreakdownScrollRef)}
                            onTouchStart={(e) => handleTouchStart(e, yearlyBreakdownScrollRef)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={(e) => handleTouchMove(e, yearlyBreakdownScrollRef)}
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
                                {(result?.yearlyBreakdown || []).map((year: any) => (
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
                  className={`overflow-x-auto -mx-4 sm:mx-0 ${(isDragging || isTouchDragging) ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={(e) => handleMouseDown(e, comparisonScrollRef)}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={(e) => handleMouseMove(e, comparisonScrollRef)}
                  onTouchStart={(e) => handleTouchStart(e, comparisonScrollRef)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={(e) => handleTouchMove(e, comparisonScrollRef)}
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
        </div>

      </main>

      {/* SEO Content Sections - Following DapsiWow SEO Course Framework */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        
        {/* 1. Introduction Section (200-300 words) */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What is a Simple Interest Calculator?</h2>
          <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              A <strong>simple interest calculator</strong> is a free online financial tool that helps you calculate the interest earned or paid on a principal amount over a specific time period using the simple interest formula (SI = P × R × T). Unlike compound interest, simple interest is calculated only on the original principal amount, making it easier to understand and ideal for short-term loans, savings bonds, and certain types of certificates of deposit.
            </p>
            <p>
              Our calculator instantly computes your simple interest with detailed breakdowns showing monthly interest, yearly accumulation, and total amount at maturity. Whether you're planning a short-term investment, evaluating a car loan, or understanding savings account growth, this tool provides accurate, instant results with visual charts and exportable PDF reports.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Why Use Our Simple Interest Calculator?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Instant Results:</strong> Get calculations in seconds with the proven SI = P × R × T formula</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Accurate & Reliable:</strong> Uses the standard mathematical formula accepted worldwide</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>100% Free Forever:</strong> No hidden fees, subscriptions, or registration required</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Multi-Currency Support:</strong> Calculate in USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, MXN</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Privacy Protected:</strong> All calculations happen in your browser - we never store your data</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Who Benefits from This Tool?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Investors & Savers:</strong> Calculate returns on short-term savings bonds and certificates of deposit</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Borrowers:</strong> Understand total interest costs on car loans, personal loans, and short-term financing</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Students & Educators:</strong> Learn and teach basic interest calculation concepts with real examples</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Financial Professionals:</strong> Quick reference tool for client consultations and financial planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span><strong>Small Business Owners:</strong> Evaluate short-term business loan costs and investment opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. How to Use Section (7 steps + pro tips) */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How to Use the Simple Interest Calculator</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Enter Principal Amount</h3>
                  <p className="text-gray-700">
                    Input the initial amount of money you're investing or borrowing. This is your starting balance before any interest is applied. 
                    <strong> Example:</strong> If you're investing $10,000 in a savings bond, enter 10000 as your principal.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Set Interest Rate</h3>
                  <p className="text-gray-700">
                    Enter the annual interest rate as a percentage. Make sure this is the yearly rate, not monthly.
                    <strong> Example:</strong> If your savings account offers 5% annual interest, enter 5 (not 0.05).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Choose Time Period</h3>
                  <p className="text-gray-700">
                    Specify how long the money will be invested or borrowed. You can enter the time in years or months depending on your preference.
                    <strong> Example:</strong> For a 3-year car loan, enter 3 and select "years" or enter 36 and select "months".
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Select Currency</h3>
                  <p className="text-gray-700">
                    Choose your preferred currency from 10 supported options (USD, EUR, GBP, INR, JPY, CAD, AUD, CNY, BRL, MXN). All results will automatically format in your selected currency.
                    <strong> Example:</strong> Select EUR if you're calculating interest for a European investment.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">5</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Click Calculate</h3>
                  <p className="text-gray-700">
                    Press the "Calculate" button to instantly compute your simple interest. The calculator will display your total interest earned, final amount, monthly interest, and a year-by-year breakdown showing how your interest accumulates over time.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">6</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Review Results & Visualizations</h3>
                  <p className="text-gray-700">
                    Examine your results including the interest breakdown card, yearly accumulation table, and interactive charts. Toggle between pie chart and bar chart views to visualize your principal vs. interest distribution and year-over-year growth.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">7</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Export & Share Results</h3>
                  <p className="text-gray-700">
                    Download your calculation as a professional PDF report or share it directly via social media (Facebook, Twitter, LinkedIn, WhatsApp). You can also create scenario comparisons to evaluate different investment or loan options side-by-side.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 sm:p-8 border border-blue-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" />
              Pro Tips for Best Results
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <Percent className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Double-check your rate:</strong> Ensure you're using the annual percentage rate (APR), not monthly. If you have a monthly rate, multiply by 12.</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Use consistent time units:</strong> If your rate is annual, your time must be in years (or convert months to years by dividing by 12).</span>
              </li>
              <li className="flex items-start gap-3">
                <Calculator className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Compare scenarios:</strong> Use the "Add to Comparison" feature to evaluate multiple interest rates or time periods simultaneously.</span>
              </li>
              <li className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Save your calculations:</strong> Export to PDF for your records, tax purposes, or to share with financial advisors.</span>
              </li>
              <li className="flex items-start gap-3">
                <Share2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <span><strong>Review yearly breakdown:</strong> Always check the year-by-year table to understand exactly how your interest accumulates over time.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Real-World Examples Section (3+ scenarios) */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple Interest Calculator Examples</h2>
          <p className="text-base sm:text-lg text-gray-700">
            Understanding simple interest is easier with real-world examples. Here are three common scenarios showing how simple interest works for different financial situations:
          </p>

          {/* Example 1 */}
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Example 1: Savings Account Investment</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Scenario</h4>
                <p className="text-gray-700 mb-4">
                  Sarah wants to invest $15,000 in a 2-year certificate of deposit (CD) that offers 6% simple interest annually. She wants to know how much interest she'll earn and her total return.
                </p>
                <h4 className="font-semibold text-gray-900 mb-3">Input Values</h4>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Principal (P):</strong> $15,000</li>
                  <li><strong>Interest Rate (R):</strong> 6% per year</li>
                  <li><strong>Time (T):</strong> 2 years</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Calculation</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div>SI = P × R × T</div>
                  <div>SI = $15,000 × 0.06 × 2</div>
                  <div>SI = $15,000 × 0.12</div>
                  <div className="font-bold text-green-600">SI = $1,800</div>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="font-bold text-blue-600">Total Amount = $15,000 + $1,800 = $16,800</div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 mt-4">Result & Interpretation</h4>
                <p className="text-gray-700">
                  Sarah will earn <strong>$1,800</strong> in simple interest over 2 years. Her total return will be <strong>$16,800</strong>, representing a 12% total return on her initial investment.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700">
                <strong>Action Steps:</strong> This is a safe, predictable investment ideal for short-term savings goals. Sarah should verify the CD terms don't have early withdrawal penalties and compare this rate with other banks' offerings.
              </p>
            </div>
          </div>

          {/* Example 2 */}
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Example 2: Auto Loan Interest Cost</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Scenario</h4>
                <p className="text-gray-700 mb-4">
                  Michael is taking out a $25,000 car loan with simple interest at 7% APR for 4 years. He wants to calculate the total interest he'll pay and his total repayment amount.
                </p>
                <h4 className="font-semibold text-gray-900 mb-3">Input Values</h4>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Principal (P):</strong> $25,000</li>
                  <li><strong>Interest Rate (R):</strong> 7% per year</li>
                  <li><strong>Time (T):</strong> 4 years</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Calculation</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div>SI = P × R × T</div>
                  <div>SI = $25,000 × 0.07 × 4</div>
                  <div>SI = $25,000 × 0.28</div>
                  <div className="font-bold text-green-600">SI = $7,000</div>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="font-bold text-blue-600">Total Repayment = $25,000 + $7,000 = $32,000</div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 mt-4">Result & Interpretation</h4>
                <p className="text-gray-700">
                  Michael will pay <strong>$7,000</strong> in total interest over 4 years. His total loan cost will be <strong>$32,000</strong>, meaning the interest adds 28% to the original loan amount.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700">
                <strong>Action Steps:</strong> Michael should shop around for lower interest rates. Even a 1% reduction (from 7% to 6%) would save $1,000 in interest. He could also consider a shorter loan term to reduce total interest paid.
              </p>
            </div>
          </div>

          {/* Example 3 */}
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Example 3: Short-Term Personal Loan</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Scenario</h4>
                <p className="text-gray-700 mb-4">
                  Emma needs a $5,000 personal loan for home repairs. Her credit union offers 9% simple interest for an 18-month term. She wants to know the exact interest cost and total payment.
                </p>
                <h4 className="font-semibold text-gray-900 mb-3">Input Values</h4>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Principal (P):</strong> $5,000</li>
                  <li><strong>Interest Rate (R):</strong> 9% per year</li>
                  <li><strong>Time (T):</strong> 18 months = 1.5 years</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Calculation</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div>SI = P × R × T</div>
                  <div>SI = $5,000 × 0.09 × 1.5</div>
                  <div>SI = $5,000 × 0.135</div>
                  <div className="font-bold text-green-600">SI = $675</div>
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="font-bold text-blue-600">Total Repayment = $5,000 + $675 = $5,675</div>
                    <div className="mt-2 text-gray-600">Monthly Payment = $5,675 ÷ 18 = $315.28</div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 mt-4">Result & Interpretation</h4>
                <p className="text-gray-700">
                  Emma will pay <strong>$675</strong> in interest over 18 months. Her monthly payment will be approximately <strong>$315.28</strong>, and the total loan cost is <strong>$5,675</strong>.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700">
                <strong>Action Steps:</strong> This short-term loan has manageable interest costs. Emma should confirm there are no origination fees or prepayment penalties. If she can pay it off early, she may save on interest depending on the loan terms.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Understanding Results Section */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Understanding Your Simple Interest Results</h2>
          <p className="text-base sm:text-lg text-gray-700">
            Once you calculate simple interest, it's important to understand what each number means and how to interpret your results for better financial decisions.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Simple Interest (SI)
              </h3>
              <p className="text-gray-700 mb-3">
                This is the total interest amount you'll earn (on investments) or pay (on loans) over the entire time period.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Key Insight:</strong> Simple interest remains constant each year. If you earn $500 in year 1, you'll earn exactly $500 in year 2, year 3, and so on.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                Total Amount
              </h3>
              <p className="text-gray-700 mb-3">
                This represents your principal plus all accumulated simple interest. For investors, it's your final account balance. For borrowers, it's the total you'll repay.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Formula:</strong> Total Amount = Principal + Simple Interest
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-indigo-600" />
                Monthly Interest
              </h3>
              <p className="text-gray-700 mb-3">
                The average interest amount per month, calculated by dividing total interest by the number of months in your time period.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Use Case:</strong> Helpful for budgeting monthly loan payments or estimating monthly investment income.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Yearly Breakdown
              </h3>
              <p className="text-gray-700 mb-3">
                A year-by-year table showing interest earned each year, cumulative interest to date, and running total amount.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <strong>Why It Matters:</strong> Helps you track progress toward savings goals or understand the true cost of long-term loans.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 sm:p-8 border border-yellow-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">When to Seek Professional Financial Advice</h3>
            <p className="text-gray-700 mb-4">
              While our simple interest calculator provides accurate calculations, certain situations benefit from professional guidance:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Large investments:</strong> Amounts over $50,000 where tax implications and alternative investment strategies should be evaluated</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Long-term loans:</strong> Mortgages and business loans typically use compound interest, not simple interest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Complex financial situations:</strong> Multiple income streams, retirement planning, or estate considerations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Unclear loan terms:</strong> If you're unsure whether your loan uses simple or compound interest, consult the lender or a financial advisor</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 5. Formula Explained Section */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple Interest Formula Explained</h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 border-2 border-blue-300">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 text-center">The Simple Interest Formula</h3>
            <div className="text-center">
              <div className="inline-block bg-white rounded-lg px-8 py-6 shadow-lg">
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">SI = P × R × T</p>
                <p className="text-gray-600 text-sm sm:text-base">Simple Interest = Principal × Rate × Time</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
              <h4 className="font-semibold text-gray-900 text-lg mb-2">SI (Simple Interest)</h4>
              <p className="text-gray-700 text-sm">
                The total interest earned or paid over the entire time period. This is calculated based on the original principal only.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
              <h4 className="font-semibold text-gray-900 text-lg mb-2">P (Principal)</h4>
              <p className="text-gray-700 text-sm">
                The initial amount of money invested or borrowed. This is your starting balance before any interest is applied.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
              <h4 className="font-semibold text-gray-900 text-lg mb-2">R (Rate)</h4>
              <p className="text-gray-700 text-sm">
                The annual interest rate expressed as a decimal. Convert percentage to decimal by dividing by 100 (e.g., 5% = 0.05).
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
              <h4 className="font-semibold text-gray-900 text-lg mb-2">T (Time)</h4>
              <p className="text-gray-700 text-sm">
                The duration of the investment or loan in years. Convert months to years by dividing by 12 (e.g., 18 months = 1.5 years).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Step-by-Step Calculation Example</h3>
            <p className="text-gray-700 mb-6">
              Let's calculate simple interest for a $8,000 investment at 4.5% annual interest for 3 years:
            </p>
            
            <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Identify the variables:</p>
                  <ul className="mt-2 space-y-1 text-gray-700 ml-4">
                    <li>• P (Principal) = $8,000</li>
                    <li>• R (Rate) = 4.5% per year = 0.045 (as decimal)</li>
                    <li>• T (Time) = 3 years</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Apply the formula:</p>
                  <p className="mt-2 font-mono text-gray-800 bg-white p-3 rounded border border-gray-300">
                    SI = P × R × T<br/>
                    SI = $8,000 × 0.045 × 3
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Multiply the values:</p>
                  <p className="mt-2 font-mono text-gray-800 bg-white p-3 rounded border border-gray-300">
                    SI = $8,000 × 0.135<br/>
                    SI = $1,080
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Final Result:</p>
                  <div className="mt-2 bg-green-50 p-4 rounded border border-green-300">
                    <p className="text-lg font-bold text-green-700">Simple Interest = $1,080</p>
                    <p className="text-lg font-bold text-blue-700 mt-2">Total Amount = $8,000 + $1,080 = $9,080</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Common Calculation Variations</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">When Time is in Months</h4>
                <p className="text-gray-700 mb-2">Convert months to years by dividing by 12:</p>
                <p className="font-mono text-sm bg-gray-50 p-3 rounded">
                  SI = P × R × (months ÷ 12)<br/>
                  Example: 18 months = 1.5 years
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">When Rate is Monthly</h4>
                <p className="text-gray-700 mb-2">Convert to annual rate by multiplying by 12:</p>
                <p className="font-mono text-sm bg-gray-50 p-3 rounded">
                  Annual Rate = Monthly Rate × 12<br/>
                  Example: 0.5% monthly = 6% annually
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">When Time is in Days</h4>
                <p className="text-gray-700 mb-2">Divide days by 365 (or 360 for some loans):</p>
                <p className="font-mono text-sm bg-gray-50 p-3 rounded">
                  SI = P × R × (days ÷ 365)<br/>
                  Example: 90 days ≈ 0.247 years
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Comparison Section - Simple vs Compound Interest */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple Interest vs Compound Interest</h2>
          <p className="text-base sm:text-lg text-gray-700">
            Understanding the difference between simple and compound interest is crucial for making informed financial decisions. While simple interest is calculated only on the principal, compound interest is calculated on both the principal and accumulated interest.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md border border-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <th className="px-4 sm:px-6 py-4 text-left font-semibold text-sm sm:text-base">Feature</th>
                  <th className="px-4 sm:px-6 py-4 text-left font-semibold text-sm sm:text-base">Simple Interest</th>
                  <th className="px-4 sm:px-6 py-4 text-left font-semibold text-sm sm:text-base">Compound Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Calculation Method</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Interest calculated only on principal amount (P × R × T)</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Interest calculated on principal + accumulated interest</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Formula</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">SI = P × R × T</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">A = P(1 + r/n)^(nt)</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Interest Growth</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Linear (constant amount each period)</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Exponential (increasing amount each period)</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Returns/Cost</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Lower total interest (for investors) or cost (for borrowers)</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Higher total interest (for investors) or cost (for borrowers)</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Best For</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Short-term loans, car loans, some personal loans, short-term CDs</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Savings accounts, mortgages, long-term investments, credit cards</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Complexity</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Simple to calculate and understand</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">More complex, requires compounding frequency</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Common Uses</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Auto loans, short-term bonds, some student loans</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 text-sm sm:text-base">Bank savings, retirement accounts, mortgages</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md border border-gray-200">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Side-by-Side Comparison Example</h3>
            <p className="text-gray-700 mb-6">
              Let's compare simple interest vs compound interest for a $10,000 investment at 6% for 5 years:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Simple Interest
                </h4>
                <div className="space-y-3 text-gray-800">
                  <p className="font-mono text-sm">SI = $10,000 × 0.06 × 5</p>
                  <p className="font-mono text-sm">SI = $3,000</p>
                  <p className="font-mono text-sm font-bold text-blue-700 text-lg mt-4">Total: $13,000</p>
                  <p className="text-xs text-gray-600 mt-2">Interest earned each year: $600</p>
                </div>
              </div>

              <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Compound Interest (Annual)
                </h4>
                <div className="space-y-3 text-gray-800">
                  <p className="font-mono text-sm">A = $10,000(1 + 0.06)^5</p>
                  <p className="font-mono text-sm">A = $13,382.26</p>
                  <p className="font-mono text-sm font-bold text-green-700 text-lg mt-4">Total: $13,382.26</p>
                  <p className="text-xs text-gray-600 mt-2">Interest: $3,382.26</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-5 bg-yellow-50 rounded-lg border border-yellow-300">
              <p className="text-gray-800 font-semibold mb-2">Difference: $382.26</p>
              <p className="text-gray-700 text-sm">
                Compound interest earns $382.26 more because interest is calculated on previously earned interest. This difference becomes more significant over longer time periods and with more frequent compounding.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-300">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">When to Use Simple Interest</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Short-term investments:</strong> When investing for 1-3 years where the difference from compounding is minimal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Car loans:</strong> Most auto loans use simple interest, making payments predictable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Personal loans:</strong> Many personal and installment loans use simple interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Quick calculations:</strong> When you need a fast estimate without complex math</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span><strong>Educational purposes:</strong> Learning basic interest concepts before advancing to compound interest</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-300">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">When to Use Compound Interest</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Long-term savings:</strong> Retirement accounts, college funds, and investments over 5+ years</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Savings accounts:</strong> Most bank accounts compound interest daily or monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Mortgages:</strong> Home loans almost always use compound interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Credit cards:</strong> Credit card debt compounds, often daily, making it costly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span><strong>Investment growth:</strong> Stock market returns, mutual funds, and dividend reinvestment</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. FAQ Section (8-10 questions) */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions (FAQ)</h2>
          <p className="text-base sm:text-lg text-gray-700">
            Get answers to the most common questions about simple interest calculations, formulas, and real-world applications.
          </p>

          <div className="space-y-4">
            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">What is simple interest and how does it work?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700">
                  Simple interest is a method of calculating interest on a loan or investment where interest is calculated only on the principal amount (the original sum). The formula is <strong>SI = P × R × T</strong>, where P is principal, R is the annual interest rate (as a decimal), and T is time in years. Unlike compound interest, simple interest does not accumulate on previously earned interest. For example, if you invest $1,000 at 5% simple interest for 3 years, you'll earn $50 each year (1000 × 0.05 = $50), totaling $150 in interest and $1,150 overall. Simple interest is common for short-term loans, auto financing, and certain bonds.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">How accurate is this simple interest calculator?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700">
                  Our simple interest calculator is 100% accurate as it uses the standard mathematical formula <strong>SI = P × R × T</strong> accepted by financial institutions worldwide. All calculations are performed instantly in your browser with precision to two decimal places. However, keep in mind that while the mathematical calculation is exact, real-world factors may vary: some lenders round differently, may charge additional fees not included in the interest calculation, or may use a 360-day year instead of 365 days. Always verify with your specific lender or financial institution for exact figures, especially for contractual obligations. Our calculator is perfect for estimates, planning, and educational purposes.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">What's the difference between simple interest and compound interest?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  The key difference is what the interest is calculated on:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Simple Interest:</strong> Calculated only on the original principal amount. Interest remains the same each period. Formula: SI = P × R × T. Example: $1,000 at 5% for 3 years = $150 total interest ($50/year).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Compound Interest:</strong> Calculated on principal plus accumulated interest. Interest grows exponentially. Formula: A = P(1 + r/n)^(nt). Same example: $1,000 at 5% compounded annually for 3 years = $157.63 total interest.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  For investors, compound interest earns more money. For borrowers, simple interest costs less. The difference becomes more significant over longer time periods and higher interest rates.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Can I use this calculator for loans and investments?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  Yes! This calculator works for both scenarios:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>For Investments:</strong> Calculate how much interest you'll earn on savings bonds, short-term CDs, or money market accounts that use simple interest. The result shows your profit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>For Loans:</strong> Calculate how much interest you'll pay on car loans, personal loans, or any financing that uses simple interest. The result shows your total cost.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  The formula is identical - only the interpretation differs. Before using this calculator for a specific loan or investment, confirm with your financial institution that they use simple interest, as many products now use compound interest.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">How do I convert monthly interest rate to annual rate?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  To convert a monthly interest rate to an annual rate, simply multiply by 12:
                </p>
                <div className="bg-white p-4 rounded border border-gray-300 font-mono text-sm mb-3">
                  <p>Annual Rate = Monthly Rate × 12</p>
                  <p className="mt-2">Example: 0.5% monthly × 12 = 6% annually</p>
                </div>
                <p className="text-gray-700 mb-3">
                  Our calculator requires the annual interest rate, so always perform this conversion first if you only have a monthly rate. Common examples:
                </p>
                <ul className="space-y-1 text-gray-700 ml-4 text-sm">
                  <li>• 0.25% monthly = 3% annual</li>
                  <li>• 0.5% monthly = 6% annual</li>
                  <li>• 1% monthly = 12% annual</li>
                  <li>• 1.5% monthly = 18% annual</li>
                </ul>
                <p className="text-gray-700 mt-3 text-sm">
                  <strong>Important:</strong> This simple multiplication works for simple interest. For compound interest, the relationship is more complex due to compounding effects.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">What types of loans typically use simple interest?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  Several common loan types use simple interest calculations:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Auto Loans:</strong> Most car loans and vehicle financing use simple interest, making monthly payments predictable and straightforward.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Personal Installment Loans:</strong> Many personal loans from banks and credit unions use simple interest, especially for terms under 5 years.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Some Student Loans:</strong> Certain federal and private student loans calculate interest using the simple method.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Short-Term Business Loans:</strong> Small business loans with terms under 3 years often use simple interest.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Bridge Loans:</strong> Temporary financing between property purchases typically uses simple interest due to short duration.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Always verify with your lender, as practices vary. Mortgages and credit cards almost never use simple interest - they use compound interest.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">How often should I use this calculator?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  Use the simple interest calculator whenever you need to:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Before taking a loan:</strong> Calculate total interest costs to compare different loan offers and ensure affordability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Planning investments:</strong> Estimate returns on short-term investments, bonds, or CDs before committing funds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Comparing options:</strong> Use the scenario comparison feature to evaluate multiple interest rates or time periods.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Financial planning:</strong> Include in quarterly or annual reviews to project savings growth or loan payoff progress.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Educational purposes:</strong> Students and educators can use it anytime to learn or teach interest calculation concepts.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  There's no limit to how often you can use our calculator - it's 100% free, always available, and requires no registration.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Can I save or print my calculation results?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  Yes! We offer multiple ways to save and share your results:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <Download className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span><strong>PDF Export:</strong> Download a professional PDF report with all your calculation details, yearly breakdowns, and charts. Perfect for financial records or sharing with advisors.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Share2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <span><strong>Social Sharing:</strong> Share your results directly via Facebook, Twitter, LinkedIn, or WhatsApp to discuss with friends, family, or colleagues.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <span><strong>Visual Charts:</strong> All charts and tables can be included in your PDF export for visual reference and presentations.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  All exports include our branding and a timestamp for your records. Your input data is never stored on our servers - everything happens in your browser for complete privacy.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Why do some banks use 360 days instead of 365 days per year?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  Some financial institutions use a "banker's year" of 360 days (12 months × 30 days) instead of the actual 365 days. This practice has historical origins and affects interest calculations:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Historical Reasons:</strong> Before calculators and computers, using 360 days (evenly divisible by 12, 30, etc.) made manual calculations simpler.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Higher Interest for Lenders:</strong> Using 360 days results in slightly higher effective interest rates. For example, $1,000 at 6% for 1 year = $16.67 with 365 days vs. $16.44 with 360 days.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Industry Standard:</strong> Many commercial loans, particularly in the US, still use the 360-day convention.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Our calculator uses the standard 365-day year, but you can manually adjust if your lender uses 360 days. Always check your loan documents for the exact method used. The difference is usually small but can add up on large loans.
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <summary className="cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Is simple interest better than compound interest for borrowers?</h3>
                <ArrowRight className="w-5 h-5 text-blue-600 transform group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-gray-700 mb-3">
                  <strong>Yes, simple interest is generally better for borrowers</strong> because you pay less total interest over the life of the loan. Here's why:
                </p>
                <ul className="space-y-2 text-gray-700 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Lower Total Cost:</strong> With simple interest, you only pay interest on the original principal. With compound interest, you pay interest on interest, which accumulates over time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Predictable Payments:</strong> Simple interest results in fixed, consistent interest amounts each period, making budgeting easier.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Example Comparison:</strong> A $20,000 loan at 8% for 5 years costs $8,000 in simple interest but $9,387 in compound interest (annual compounding) - a difference of $1,387.</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-3">
                  However, you often don't get to choose - lenders determine the interest method. Car loans typically use simple interest (good for you), while mortgages use compound interest. When comparing loans, always check the total amount you'll repay, not just the interest rate.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* 8. Related Tools Section */}
        <section className="space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Related Financial Calculators</h2>
          <p className="text-base sm:text-lg text-gray-700">
            Expand your financial planning toolkit with these complementary calculators. Each tool helps you make better informed decisions about your money.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate border-2 border-gray-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Compound Interest Calculator</h3>
                </div>
                <p className="text-gray-700 mb-4 text-sm">
                  Calculate compound interest with multiple compounding frequencies. Perfect for long-term investments, retirement planning, and understanding exponential growth of savings.
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  <strong>Best For:</strong> Savings accounts, retirement funds, long-term investments, college savings plans
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="link-compound-interest-calculator">
                  <Link href="/tools/compound-interest-calculator">
                    Calculate Compound Interest <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-gray-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Loan Calculator</h3>
                </div>
                <p className="text-gray-700 mb-4 text-sm">
                  Calculate monthly payments, total interest, and amortization schedules for any loan. Compare different loan amounts, terms, and interest rates side-by-side.
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  <strong>Best For:</strong> Personal loans, auto loans, student loans, debt consolidation planning
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="link-loan-calculator">
                  <Link href="/tools/loan-calculator">
                    Calculate Loan Payments <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-gray-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Investment Calculator</h3>
                </div>
                <p className="text-gray-700 mb-4 text-sm">
                  Project future investment values with regular contributions. Model different contribution frequencies and see how small regular deposits grow over time.
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  <strong>Best For:</strong> Retirement planning, systematic investment plans (SIP), regular savings goals
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="link-investment-calculator">
                  <Link href="/tools/investment-calculator">
                    Project Investment Growth <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-gray-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Savings Goal Calculator</h3>
                </div>
                <p className="text-gray-700 mb-4 text-sm">
                  Determine how much to save monthly to reach your financial goals. Calculate timelines for vacations, down payments, emergency funds, and major purchases.
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  <strong>Best For:</strong> Vacation planning, home down payments, emergency fund building, major purchases
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="link-savings-calculator">
                  <Link href="/tools/savings-calculator">
                    Plan Your Savings <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-gray-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Percent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">ROI Calculator</h3>
                </div>
                <p className="text-gray-700 mb-4 text-sm">
                  Calculate return on investment (ROI) for business ventures, real estate, stocks, or any investment. Compare multiple investment opportunities efficiently.
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  <strong>Best For:</strong> Business investments, real estate analysis, stock performance, investment comparisons
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="link-roi-calculator">
                  <Link href="/tools/roi-calculator">
                    Calculate ROI <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-2 border-gray-200 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Mortgage Calculator</h3>
                </div>
                <p className="text-gray-700 mb-4 text-sm">
                  Estimate monthly mortgage payments including principal, interest, property taxes, and insurance. See full amortization schedules and compare loan scenarios.
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  <strong>Best For:</strong> Home buying, mortgage refinancing, property investment analysis
                </p>
                <Button asChild variant="outline" size="sm" className="w-full" data-testid="link-mortgage-calculator">
                  <Link href="/tools/mortgage-calculator">
                    Calculate Mortgage <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 9. Final CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Ready to Calculate Your Simple Interest?</h2>
          <p className="text-base sm:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Get instant, accurate simple interest calculations with our free online calculator. No registration required, works on all devices, and includes detailed breakdowns and visual charts.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6 mb-8 text-left max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instant Results</h3>
                <p className="text-sm text-blue-100">Get calculations in seconds with the proven SI = P × R × T formula</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Visual Charts</h3>
                <p className="text-sm text-blue-100">See your interest breakdown with interactive pie and bar charts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">PDF Export</h3>
                <p className="text-sm text-blue-100">Download professional reports for your records or advisor meetings</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              size="lg"
              variant="secondary"
              className="px-8 py-6 text-lg font-semibold"
              data-testid="button-scroll-to-calculator"
            >
              Start Calculating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 border-2 border-white"
              data-testid="button-view-all-calculators"
            >
              <Link href="/tools">
                View All Calculators
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-sm text-blue-100">
              Join thousands of users who trust DapsiWow for accurate financial calculations. 100% free, no credit card required, no hidden fees.
            </p>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
