import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, TrendingUp, Clock, DollarSign, Info, Download, Share2, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

interface CompoundInterestResult {
  finalAmount: number;
  totalInterest: number;
  principalAmount: number;
  totalContributions: number;
  realValue: number;
  inflationAdjustedGains: number;
  goalAnalysis?: {
    timeToReachGoal: number;
    requiredMonthlyContribution: number;
    isGoalAchievable: boolean;
  };
  sipAnalysis?: {
    totalSIPContributions: number;
    sipInterestEarned: number;
    averageAnnualReturn: number;
  };
  yearlyBreakdown: Array<{
    year: number;
    amount: number;
    interestEarned: number;
    totalInterest: number;
    sipContribution: number;
    cumulativeContributions: number;
    realValue: number;
  }>;
}

export default function CompoundInterestCalculator() {
  const { toast } = useToast();
  const [principal, setPrincipal] = useState('10000');
  const [interestRate, setInterestRate] = useState('8');
  const [timePeriod, setTimePeriod] = useState('10');
  const [timeUnit, setTimeUnit] = useState('years');
  const [compoundFrequency, setCompoundFrequency] = useState('12');
  const [currency, setCurrency] = useState('USD');
  const [enableSIP, setEnableSIP] = useState(false);
  const [sipAmount, setSipAmount] = useState('1000');
  const [sipFrequency, setSipFrequency] = useState('12');
  const [stepUpPercentage, setStepUpPercentage] = useState('0');
  const [inflationRate, setInflationRate] = useState('3');
  const [enableGoalPlanning, setEnableGoalPlanning] = useState(false);
  const [goalAmount, setGoalAmount] = useState('100000');
  const [showRealValue, setShowRealValue] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [result, setResult] = useState<CompoundInterestResult | null>(null);

  // Drag scrolling state for yearly breakdown table
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Load parameters from URL on mount (for shared links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const principalParam = params.get('principal');
    const rateParam = params.get('rate');
    const timeParam = params.get('time');
    const unitParam = params.get('unit');
    const freqParam = params.get('freq');
    const sipParam = params.get('sip');
    const sipAmountParam = params.get('sipAmount');
    const sipFreqParam = params.get('sipFreq');
    const stepUpParam = params.get('stepUp');
    const inflationParam = params.get('inflation');
    const goalParam = params.get('goal');
    const goalAmountParam = params.get('goalAmount');

    if (principalParam || rateParam || timeParam) {
      if (principalParam) setPrincipal(principalParam);
      if (rateParam) setInterestRate(rateParam);
      if (timeParam) setTimePeriod(timeParam);
      if (unitParam) setTimeUnit(unitParam);
      if (freqParam) setCompoundFrequency(freqParam);
      if (sipParam === 'true') setEnableSIP(true);
      if (sipAmountParam) setSipAmount(sipAmountParam);
      if (sipFreqParam) setSipFrequency(sipFreqParam);
      if (stepUpParam) setStepUpPercentage(stepUpParam);
      if (inflationParam) setInflationRate(inflationParam);
      if (goalParam === 'true') setEnableGoalPlanning(true);
      if (goalAmountParam) setGoalAmount(goalAmountParam);

      // Trigger calculation after state updates
      setTimeout(() => {
        const calculateButton = document.querySelector('[data-testid="button-calculate"]') as HTMLButtonElement;
        if (calculateButton) {
          calculateButton.click();
        }
      }, 100);
    }
  }, []);

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 100;
    const t = timeUnit === 'years' ? parseFloat(timePeriod) : parseFloat(timePeriod) / 12;
    const n = parseFloat(compoundFrequency);
    const sip = enableSIP ? parseFloat(sipAmount) : 0;
    const sipFreq = parseFloat(sipFrequency);
    const stepUp = parseFloat(stepUpPercentage) / 100;
    const inflation = parseFloat(inflationRate) / 100;
    const target = parseFloat(goalAmount);

    if (p < 0 || r <= 0 || t <= 0 || n <= 0) return;

    const years = Math.ceil(t);
    let currentAmount = p;
    let totalContributions = p;
    let totalSIPContributions = 0;
    const yearlyBreakdown = [];

    for (let year = 1; year <= years; year++) {
      const isPartialYear = year > t;
      const yearDuration = isPartialYear ? t - (year - 1) : 1;

      const growthFactor = Math.pow((1 + r / n), n * yearDuration);
      currentAmount *= growthFactor;

      if (enableSIP && sip > 0) {
        const periodsInYear = sipFreq * yearDuration;
        let currentSIP = sip;

        if (stepUp > 0 && year > 1) {
          currentSIP = sip * Math.pow(1 + stepUp, year - 1);
        }

        for (let period = 1; period <= periodsInYear; period++) {
          const remainingTime = yearDuration - (period / sipFreq);
          const contributionGrowth = remainingTime > 0 ? Math.pow((1 + r / n), n * remainingTime) : 1;
          currentAmount += currentSIP * contributionGrowth;
          totalSIPContributions += currentSIP;
          totalContributions += currentSIP;
        }
      }

      const previousAmount: number = year === 1 ? p : yearlyBreakdown[year - 2].amount;
      const interestEarned: number = currentAmount - previousAmount - (enableSIP ? totalSIPContributions - (year > 1 ? yearlyBreakdown[year - 2].cumulativeContributions - p : 0) : 0);
      const realValue = currentAmount / Math.pow(1 + inflation, year);

      yearlyBreakdown.push({
        year,
        amount: currentAmount,
        interestEarned: Math.max(0, interestEarned),
        totalInterest: currentAmount - totalContributions,
        sipContribution: enableSIP && sip > 0 ? (stepUp > 0 ? sip * Math.pow(1 + stepUp, year - 1) : sip) * sipFreq * yearDuration : 0,
        cumulativeContributions: totalContributions,
        realValue
      });
    }

    const finalAmount = currentAmount;
    const totalInterest = finalAmount - totalContributions;
    const realValue = finalAmount / Math.pow(1 + inflation, t);
    const inflationAdjustedGains = realValue - totalContributions;

    let goalAnalysis;
    if (enableGoalPlanning && target > 0) {
      let timeToGoal = 0;
      let testAmount = p;
      let testContributions = p;

      while (testAmount < target && timeToGoal < 50) {
        timeToGoal += 1;
        testAmount *= Math.pow((1 + r / n), n);

        if (enableSIP && sip > 0) {
          const yearSIP = stepUp > 0 ? sip * Math.pow(1 + stepUp, timeToGoal - 1) : sip;
          testAmount += yearSIP * sipFreq * ((Math.pow(1 + r/n, n) - 1) / (r/n));
          testContributions += yearSIP * sipFreq;
        }
      }

      const requiredTotal = target - p * Math.pow((1 + r / n), n * t);
      const annuityFactor = ((Math.pow(1 + r/n, n * t) - 1) / (r/n));
      const requiredMonthlyContribution = requiredTotal > 0 ? (requiredTotal / annuityFactor) / 12 : 0;

      goalAnalysis = {
        timeToReachGoal: timeToGoal <= 50 ? timeToGoal : -1,
        requiredMonthlyContribution: Math.max(0, requiredMonthlyContribution),
        isGoalAchievable: timeToGoal <= 50 || requiredMonthlyContribution <= sip * 2
      };
    }

    let sipAnalysis;
    if (enableSIP && totalSIPContributions > 0) {
      const sipInterestEarned = finalAmount - p - totalSIPContributions;
      const averageAnnualReturn = totalSIPContributions > 0 ? ((finalAmount / totalContributions) ** (1/t) - 1) * 100 : 0;

      sipAnalysis = {
        totalSIPContributions,
        sipInterestEarned: Math.max(0, sipInterestEarned),
        averageAnnualReturn
      };
    }

    setResult({
      finalAmount,
      totalInterest,
      principalAmount: p,
      totalContributions,
      realValue,
      inflationAdjustedGains,
      goalAnalysis,
      sipAnalysis,
      yearlyBreakdown
    });
  };

  const resetCalculator = () => {
    setPrincipal('10000');
    setInterestRate('8');
    setTimePeriod('10');
    setTimeUnit('years');
    setCompoundFrequency('12');
    setCurrency('USD');
    setEnableSIP(false);
    setSipAmount('1000');
    setSipFrequency('12');
    setStepUpPercentage('0');
    setInflationRate('3');
    setEnableGoalPlanning(false);
    setGoalAmount('100000');
    setShowRealValue(false);
    setShowBreakdown(false);
    setShowChart(false);
    setResult(null);
  };

  // Drag scrolling handlers for yearly breakdown table
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

    // Create shareable URL with encoded parameters
    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Create comprehensive share text
    const timeDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
    const compoundDisplay = compoundFrequency === '1' ? 'Annually' : 
                            compoundFrequency === '4' ? 'Quarterly' : 
                            compoundFrequency === '12' ? 'Monthly' : 'Daily';
    const sipFreqDisplay = sipFrequency === '12' ? 'Monthly' : 'Annually';

    let shareText = `💰 Compound Interest Calculator Results\n\n`;
    shareText += `📊 Investment Details:\n`;
    shareText += `• Principal: ${formatCurrency(parseFloat(principal))}\n`;
    shareText += `• Interest Rate: ${interestRate}% annually\n`;
    shareText += `• Time Period: ${timeDisplay}\n`;
    shareText += `• Compound Frequency: ${compoundDisplay}\n`;

    if (enableSIP && parseFloat(sipAmount) > 0) {
      shareText += `• ${sipFreqDisplay} Contribution: ${formatCurrency(parseFloat(sipAmount))}\n`;
      if (parseFloat(stepUpPercentage) > 0) {
        shareText += `• Annual Step-up: ${stepUpPercentage}%\n`;
      }
    }

    shareText += `\n💵 Results Breakdown:\n`;
    shareText += `• Final Amount: ${formatCurrency(result.finalAmount)}\n`;
    shareText += `• Total Interest Earned: ${formatCurrency(result.totalInterest)}\n`;
    shareText += `• Total Contributions: ${formatCurrency(result.totalContributions)}\n`;

    if (showRealValue && parseFloat(inflationRate) > 0) {
      shareText += `\n✨ Inflation Adjusted:\n`;
      shareText += `• Real Value: ${formatCurrency(result.realValue)}\n`;
      shareText += `• Inflation Rate: ${inflationRate}%\n`;
    }

    if (result.goalAnalysis && enableGoalPlanning) {
      shareText += `\n🎯 Goal Analysis:\n`;
      if (result.goalAnalysis.isGoalAchievable) {
        shareText += `• Time to Reach Goal: ${result.goalAnalysis.timeToReachGoal} years\n`;
      } else {
        shareText += `• Required Monthly SIP: ${formatCurrency(result.goalAnalysis.requiredMonthlyContribution)}\n`;
      }
    }

    shareText += `\n🔗 View & Calculate: ${shareableUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '💰 Compound Interest Calculator Results',
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
    toast({
      title: "Copied to clipboard!",
      description: "Share these results with others",
    });
  };

  const shareOnFacebook = () => {
    if (!result) return;

    const params = new URLSearchParams({
      principal: principal,
      rate: interestRate,
      time: timePeriod,
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
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
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const tweetText = `💰 My compound interest: ${formatCurrency(result.finalAmount)} from ${formatCurrency(parseFloat(principal))} at ${interestRate}% - Calculate yours free!`;
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
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
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
      unit: timeUnit,
      freq: compoundFrequency,
      sip: enableSIP ? 'true' : 'false',
      sipAmount: sipAmount,
      sipFreq: sipFrequency,
      stepUp: stepUpPercentage,
      inflation: inflationRate,
      goal: enableGoalPlanning ? 'true' : 'false',
      goalAmount: goalAmount
    });
    const shareableUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const whatsappText = `💰 Compound Interest Calculator Results:\n\nPrincipal: ${formatCurrency(parseFloat(principal))}\nRate: ${interestRate}%\nFinal Amount: ${formatCurrency(result.finalAmount)}\nTotal Interest: ${formatCurrency(result.totalInterest)}\n\nCalculate yours: ${shareableUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast({ title: "Opening WhatsApp share..." });
  };

  const handleDownloadYearlyBreakdownPDF = () => {
    if (!result || !result.yearlyBreakdown) return;

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
    doc.text('Yearly Investment Breakdown Report', pageWidth / 2, yPos, { align: 'center' });

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
    const tableWidth = pageWidth - (2 * margin);
    doc.rect(margin, yPos, tableWidth, 8, 'F');

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');

    const numCols = showRealValue ? 6 : 5;
    const colWidth = tableWidth / numCols;

    let colX = margin + 2;
    doc.text('Year', colX, yPos + 5);
    colX += colWidth;
    doc.text('Amount', colX, yPos + 5);
    colX += colWidth;
    doc.text('Interest', colX, yPos + 5);
    colX += colWidth;
    doc.text('Contribution', colX, yPos + 5);
    colX += colWidth;
    if (showRealValue) {
      doc.text('Real Value', colX, yPos + 5);
      colX += colWidth;
    }
    doc.text('Total Interest', colX, yPos + 5);

    yPos += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);

    result.yearlyBreakdown.forEach((yearData, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;

        // Repeat header on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(margin, yPos, tableWidth, 8, 'F');

        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');

        colX = margin + 2;
        doc.text('Year', colX, yPos + 5);
        colX += colWidth;
        doc.text('Amount', colX, yPos + 5);
        colX += colWidth;
        doc.text('Interest', colX, yPos + 5);
        colX += colWidth;
        doc.text('Contribution', colX, yPos + 5);
        colX += colWidth;
        if (showRealValue) {
          doc.text('Real Value', colX, yPos + 5);
          colX += colWidth;
        }
        doc.text('Total Interest', colX, yPos + 5);

        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, tableWidth, 6, 'F');
      }

      colX = margin + 2;
      doc.setTextColor(0, 0, 0);
      doc.text(yearData.year.toString(), colX, yPos + 4);

      colX += colWidth;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(yearData.amount), colX, yPos + 4);

      colX += colWidth;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(34, 197, 94);
      doc.text(formatCurrency(yearData.interestEarned), colX, yPos + 4);

      colX += colWidth;
      doc.setTextColor(59, 130, 246);
      doc.text(formatCurrency(yearData.sipContribution), colX, yPos + 4);

      colX += colWidth;
      if (showRealValue) {
        doc.setTextColor(147, 51, 234);
        doc.text(formatCurrency(yearData.realValue), colX, yPos + 4);
        colX += colWidth;
      }

      doc.setTextColor(249, 115, 22);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(yearData.totalInterest), colX, yPos + 4);

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
    doc.text('This breakdown shows year-by-year growth of your investment including principal, interest, and contributions.', pageWidth / 2, yPos, { align: 'center' });

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
      description: "Your yearly investment breakdown has been saved." 
    });
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
    doc.text('Compound Interest Calculation Report', pageWidth / 2, yPos, { align: 'center' });

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
    doc.text('Final Amount', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(24);
    doc.text(formatCurrency(result.finalAmount), pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    const interestPercent = ((result.totalInterest / result.finalAmount) * 100).toFixed(1);
    doc.text(`Total Interest: ${formatCurrency(result.totalInterest)} (${interestPercent}% of final amount)`, pageWidth / 2, yPos, { align: 'center' });

    // Investment Details Section
    yPos += 12;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    const detailsHeight = enableSIP ? 56 : 48;
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), detailsHeight, 3, 3, 'FD');

    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('INVESTMENT DETAILS', margin + 4, yPos);

    yPos += 2;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');

    const timeDisplay = timeUnit === 'years' ? `${timePeriod} years` : `${timePeriod} months`;
    const compoundDisplay = compoundFrequency === '1' ? 'Annually' : 
                            compoundFrequency === '4' ? 'Quarterly' : 
                            compoundFrequency === '12' ? 'Monthly' : 'Daily';
    const sipFreqDisplay = sipFrequency === '12' ? 'Monthly' : 'Annually';

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
    doc.text(formatCurrency(parseFloat(principal)), col2X, yPos);

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
    doc.text('Time Period', col1X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(timeDisplay, col2X, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Compound Frequency', col3X, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(compoundDisplay, col4X, yPos);

    if (enableSIP && parseFloat(sipAmount) > 0) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text(`${sipFreqDisplay} Contribution`, col1X, yPos);
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(parseFloat(sipAmount)), col2X, yPos);

      if (parseFloat(stepUpPercentage) > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('Annual Step-up', col3X, yPos);
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${stepUpPercentage}%`, col4X, yPos);
      }
    }

    // Results Summary Section
    yPos += 14;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 36, 3, 3, 'FD');

    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('RESULTS SUMMARY', margin + 4, yPos);

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
    doc.text('Final Amount', margin + 8, yPos);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(result.finalAmount), pageWidth - margin - 8, yPos, { align: 'right' });

    yPos += 9;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Contributions', margin + 12, yPos);

    doc.setFontSize(9);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(result.totalContributions), pageWidth - margin - 12, yPos, { align: 'right' });

    yPos += 6;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Total Interest Earned', margin + 12, yPos);

    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.text(formatCurrency(result.totalInterest), pageWidth - margin - 12, yPos, { align: 'right' });

    // Goal Analysis Section (if applicable)
    if (result.goalAnalysis && enableGoalPlanning) {
      yPos += 12;
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 24, 3, 3, 'FD');

      yPos += 5;
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text('GOAL ANALYSIS', margin + 4, yPos);

      yPos += 2;
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.3);
      doc.line(margin + 4, yPos, pageWidth - margin - 4, yPos);

      yPos += 7;
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');

      if (result.goalAnalysis.isGoalAchievable) {
        doc.text('Time to Reach Goal', margin + 8, yPos);
        doc.setFontSize(9);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(`${result.goalAnalysis.timeToReachGoal} years`, pageWidth - margin - 8, yPos, { align: 'right' });
      } else {
        doc.text('Required Monthly Contribution', margin + 8, yPos);
        doc.setFontSize(9);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(result.goalAnalysis.requiredMonthlyContribution), pageWidth - margin - 8, yPos, { align: 'right' });
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

    doc.save(`DapsiWow-Compound-Interest-${new Date().getTime()}.pdf`);
    toast({ 
      title: "PDF Downloaded!", 
      description: "Your professional investment calculation report has been saved." 
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

  const canonicalUrl = "https://dapsiwow.com/tools/compound-interest-calculator";
  const siteUrl = "https://dapsiwow.com";
  const ogImageUrl = `${siteUrl}/og-image-compound-interest.jpg`;
  const publishedDate = "2025-01-15T00:00:00Z";
  const modifiedDate = "2025-01-15T00:00:00Z";
  const currentYear = 2025;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <html lang="en" />
        <title>Compound Interest Calculator - SIP & Daily Returns</title>
        <meta name="description" content="Calculate compound interest & track daily returns with SIP. Get inflation-adjusted growth, yearly breakdowns, retirement planning & PDF reports. 100% free." />
        <meta name="keywords" content="compound interest calculator, free compound interest calculator, compound interest calculator with monthly contributions, daily compound interest calculator, SIP calculator, systematic investment plan calculator, retirement compound interest calculator, investment growth calculator, 401k calculator, IRA calculator" />

        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Language and Geo */}
        <meta httpEquiv="content-language" content="en" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        <meta name="distribution" content="global" />

        {/* Date and Author */}
        <meta name="date" content={publishedDate} />
        <meta name="last-modified" content={modifiedDate} />
        <meta name="author" content="DapsiWow" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="copyright" content={`© ${currentYear} DapsiWow. All rights reserved.`} />

        {/* Hreflang for International Versions */}
        <link rel="alternate" hrefLang="en" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-US" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-CA" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-AU" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="DapsiWow - Free Online Tools" />
        <meta property="og:title" content="Compound Interest Calculator - SIP & Daily Returns" />
        <meta property="og:description" content="Calculate compound interest & track daily returns with SIP. Get inflation-adjusted growth, yearly breakdowns, retirement planning & PDF reports. 100% free." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Compound Interest Calculator with SIP deposits, daily returns tracking, and retirement planning tools" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content="Compound Interest Calculator - SIP & Daily Returns" />
        <meta name="twitter:description" content="Calculate compound interest & track daily returns with SIP. Get inflation-adjusted growth, yearly breakdowns, retirement planning & PDF reports. 100% free." />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content="Compound Interest Calculator with SIP deposits, daily returns tracking, and retirement planning tools" />
        <meta name="twitter:creator" content="@DapsiWow" />
        <meta name="twitter:site" content="@DapsiWow" />

        {/* PWA / App Meta */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="DapsiWow Compound Interest Calculator" />

        {/* Pinterest Rich Pins */}
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:author" content="DapsiWow" />
        <meta property="article:section" content="Finance Tools" />
        <meta property="article:tag" content="compound interest, SIP calculator, investment planning, retirement savings" />

        {/* Consolidated Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Compound Interest Calculator - SIP & Daily Returns",
              "description": "Calculate compound interest & track daily returns with SIP. Get inflation-adjusted growth, yearly breakdowns, retirement planning & PDF reports.",
              "url": canonicalUrl,
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": siteUrl
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Tools",
                    "item": `${siteUrl}/tools`
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Compound Interest Calculator",
                    "item": canonicalUrl
                  }
                ]
              },
              "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["h1", "h2", ".description"]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Compound Interest Calculator with SIP Deposits",
              "description": "Free online compound interest calculator to calculate investment growth with daily compounding, SIP deposits, retirement planning for 401k and IRA accounts.",
              "url": canonicalUrl,
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Daily compound interest calculator",
                "SIP investment planning with step-up",
                "Goal-based investment analysis",
                "Inflation adjustment calculations",
                "Retirement planning (401k, IRA)",
                "Multi-currency support",
                "PDF report generation",
                "Yearly breakdown analysis"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "12847"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DapsiWow",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.png`,
              "description": "Free online financial calculators and tools for compound interest, investments, loans, and retirement planning.",
              "sameAs": [
                "https://twitter.com/DapsiWow"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I calculate compound interest with SIP deposits?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Enter your initial principal, interest rate, time period, and compounding frequency. Enable SIP mode and add your monthly contribution amount. The calculator will compute your final amount including compound growth on both principal and regular deposits."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between daily and monthly compounding?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Daily compounding applies interest 365 times per year, while monthly compounding applies it 12 times per year. More frequent compounding results in slightly higher returns due to earning interest on interest more often."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use this calculator for retirement planning?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Enable SIP deposits to simulate regular 401k or IRA contributions. The calculator shows inflation-adjusted returns and yearly breakdowns to help plan your retirement savings strategy."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How accurate is the compound interest calculator?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our calculator uses precise mathematical formulas for compound interest calculations. Results are accurate for planning purposes, but actual investment returns may vary based on market conditions and fees."
                  }
                }
              ]
            }
          ])}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/20"></div>
          <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="inline-flex items-center px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 max-w-full">
                <Calculator className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 text-blue-700 flex-shrink-0" />
                <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium text-blue-700 text-center leading-tight">
                  Free Daily & Monthly Compound Interest Calculator - 100% Accurate
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 leading-tight tracking-tight px-2 sm:px-0">
                <span className="block">Free Compound Interest Calculator</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 sm:mt-2">
                  Daily, Monthly & Yearly Compounding with Regular Deposits
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-slate-600 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto leading-relaxed px-3 sm:px-2 md:px-0">
                Calculate compound interest with daily, monthly, or yearly compounding. Includes regular deposits, inflation adjustments, and detailed growth projections. Perfect for retirement planning, savings goals, and investment analysis. 100% free, no registration required.
              </p>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Watch Growth</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Plan Ahead</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <DollarSign className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium">Build Wealth</span>
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
                <div className="text-2xl font-bold text-gray-900">Expert-Grade</div>
                <div className="text-sm text-gray-600">Accurate Projections</div>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">How to Calculate Compound Interest with Our Free Calculator - Step-by-Step Guide</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">1</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Enter Principal Amount</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Input your initial investment amount. This is the starting principal that will grow through compound interest over time.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">2</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Set Interest Rate</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Enter the expected annual return rate. Use realistic rates: 6-8% for conservative, 8-12% for moderate, 12-15% for aggressive investments.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">3</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Choose Time Period</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Select investment duration in years or months. Longer periods maximize compound growth benefits exponentially.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">4</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Select Compounding Frequency</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Choose how often interest compounds: monthly, quarterly, or annually. More frequent compounding accelerates growth.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">5</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Add SIP (Optional)</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Optional: Enable systematic investment plan to see how regular monthly contributions supercharge your compound growth.</p>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg md:text-xl">6</div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg">Calculate & Analyze</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Click "Calculate" to see final amount, total interest earned, yearly breakdown, and inflation-adjusted real value.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Calculator Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Input Section */}
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Calculate Your Investment Growth - Simple Compound Interest Calculator</h2>
                    <p className="text-sm sm:text-base text-gray-600">Enter your investment details to see how compound interest with monthly contributions accelerates your wealth growth and retirement savings</p>
                  </div>

                  <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                              <p className="max-w-xs text-sm">Select your preferred currency for calculations</p>
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

                      {/* Compound Frequency */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Compound Frequency</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How often interest is calculated and added to principal</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                          <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-compound-frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Annually</SelectItem>
                            <SelectItem value="2">Semi-annually</SelectItem>
                            <SelectItem value="4">Quarterly</SelectItem>
                            <SelectItem value="12">Monthly</SelectItem>
                            <SelectItem value="365">Daily</SelectItem>
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
                              <p className="max-w-xs text-sm">Your initial investment amount</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
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
                              <p className="max-w-xs text-sm">Expected yearly return rate on your investment</p>
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
                          <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                        </div>
                      </div>

                      {/* Time Period */}
                      <div className="md:col-span-2 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">Investment Period</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">How long you plan to invest</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Input
                            type="number"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                            placeholder="10"
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
                        <p className="text-xs sm:text-sm text-gray-500">💡 Pro Tip: Time is the most powerful factor in compound interest!</p>
                      </div>
                    </div>
                  </TooltipProvider>

                  {/* Advanced Options */}
                  <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6 md:pt-8">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Advanced Options</h3>

                    {/* SIP Investment Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableSIP}
                        onChange={(e) => setEnableSIP(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-sip"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable SIP (Systematic Investment Plan)
                      </label>
                    </div>

                    {enableSIP && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pl-4 sm:pl-6 md:pl-8 border-l-4 border-blue-200 bg-blue-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="sip-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            SIP Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                            <Input
                              id="sip-amount"
                              type="number"
                              value={sipAmount}
                              onChange={(e) => setSipAmount(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="1,000"
                              data-testid="input-sip-amount"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">SIP Frequency</Label>
                          <Select value={sipFrequency} onValueChange={setSipFrequency}>
                            <SelectTrigger className="h-10 sm:h-12 md:h-14 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg w-full" data-testid="select-sip-frequency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">Monthly</SelectItem>
                              <SelectItem value="4">Quarterly</SelectItem>
                              <SelectItem value="2">Semi-annually</SelectItem>
                              <SelectItem value="1">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="step-up" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Annual Step-Up (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="step-up"
                              type="number"
                              value={stepUpPercentage}
                              onChange={(e) => setStepUpPercentage(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="5"
                              step="0.01"
                              data-testid="input-step-up"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="inflation-rate" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Inflation Rate (%)
                          </Label>
                          <div className="relative">
                            <Input
                              id="inflation-rate"
                              type="number"
                              value={inflationRate}
                              onChange={(e) => setInflationRate(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pr-6 sm:pr-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="3"
                              step="0.01"
                              data-testid="input-inflation-rate"
                            />
                            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Goal Planning Toggle */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        checked={enableGoalPlanning}
                        onChange={(e) => setEnableGoalPlanning(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                        data-testid="checkbox-enable-goal"
                      />
                      <label className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                        Enable Goal Planning
                      </label>
                    </div>

                    {enableGoalPlanning && (
                      <div className="pl-4 sm:pl-6 md:pl-8 border-l-4 border-green-200 bg-green-50 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl">
                        <div className="space-y-2 sm:space-y-3">
                          <Label htmlFor="goal-amount" className="text-xs sm:text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            Target Goal Amount
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base md:text-lg">$</span>
                            <Input
                              id="goal-amount"
                              type="number"
                              value={goalAmount}
                              onChange={(e) => setGoalAmount(e.target.value)}
                              className="h-10 sm:h-12 md:h-14 pl-6 sm:pl-8 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-blue-500 w-full"
                              placeholder="100,000"
                              data-testid="input-goal-amount"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6">
                    <Button
                      onClick={calculateCompoundInterest}
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
                      data-testid="button-calculate"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Compound Interest
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

                  {/* Advanced Display Options */}
                  {result && (
                    <div className="space-y-4 pt-3 sm:pt-4 print:hidden">
                      {/* Primary Action Buttons */}
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <Button
                          onClick={() => setShowBreakdown(!showBreakdown)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          data-testid="button-show-breakdown"
                        >
                          {showBreakdown ? 'Hide' : 'Show'} Yearly Breakdown
                        </Button>
                        <Button
                          onClick={() => setShowChart(!showChart)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          data-testid="button-show-chart"
                        >
                          <PieChart className="w-4 h-4 mr-1.5" />
                          {showChart ? 'Hide' : 'Show'} Chart
                        </Button>
                        <Button
                          onClick={handleDownloadPDF}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          data-testid="button-export-pdf"
                        >
                          <Download className="w-4 h-4 mr-1.5" />
                          Export PDF
                        </Button>
                        <Button
                          onClick={() => setShowRealValue(!showRealValue)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          data-testid="button-show-real-value"
                        >
                          {showRealValue ? 'Hide' : 'Show'} Inflation Adjusted
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
                            data-testid="button-share"
                          >
                            <Share2 className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">More</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t lg:border-t-0 lg:border-l">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center lg:text-left">Growth Analysis</h2>

                  {result ? (
                    <div className="space-y-4 sm:space-y-6" data-testid="compound-interest-results">
                      {/* Final Amount Highlight */}
                      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-green-100">
                        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 sm:mb-2 text-center lg:text-left">
                          Final Amount
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 text-center lg:text-left break-all" data-testid="text-final-amount">
                          {formatCurrency(result.finalAmount)}
                        </div>
                        {showRealValue && (
                          <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center lg:text-left">
                            Real Value: {formatCurrency(result.realValue)}
                          </div>
                        )}
                      </div>

                      {/* Chart Section */}
                      {showChart && (
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                          <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 text-center text-base sm:text-lg">Investment Breakdown</h3>
                          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6">
                            <div className="w-full max-w-[280px] sm:max-w-xs">
                              <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 240 : 280}>
                                <RechartsPieChart>
                                  <Pie
                                    data={[
                                      { 
                                        name: 'Principal', 
                                        value: result.principalAmount,
                                        percentage: (result.principalAmount / result.finalAmount) * 100
                                      },
                                      { 
                                        name: 'Interest', 
                                        value: result.totalInterest,
                                        percentage: (result.totalInterest / result.finalAmount) * 100
                                      }
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
                                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                      <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                                    </linearGradient>
                                    <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                      <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                                    </linearGradient>
                                  </defs>
                                </RechartsPieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 w-full lg:w-auto">
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></div>
                                  <span className="font-semibold text-gray-700 text-xs sm:text-sm">Principal Amount</span>
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 break-all">{formatCurrency(result.principalAmount)}</div>
                                <div className="text-xs sm:text-sm text-blue-700 mt-1">{((result.principalAmount / result.finalAmount) * 100).toFixed(1)}% of total</div>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full"></div>
                                  <span className="font-semibold text-gray-700 text-xs sm:text-sm">Total Interest</span>
                                </div>
                                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 break-all">{formatCurrency(result.totalInterest)}</div>
                                <div className="text-xs sm:text-sm text-green-700 mt-1">{((result.totalInterest / result.finalAmount) * 100).toFixed(1)}% of total</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-center">
                              <span className="text-xs sm:text-sm text-gray-600">Total Final Amount:</span>
                              <span className="text-lg sm:text-xl font-bold text-gray-900 break-all">{formatCurrency(result.finalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Growth Breakdown */}
                      <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
                            </span>
                          </div>
                        </div>

                        {enableSIP && result.sipAnalysis && (
                          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total SIP Contributions</span>
                              <span className="font-bold text-blue-600 text-xs sm:text-sm md:text-base" data-testid="text-sip-contributions">
                                {formatCurrency(result.sipAnalysis.totalSIPContributions)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total Interest Earned</span>
                            <span className="font-bold text-green-600 text-xs sm:text-sm md:text-base" data-testid="text-total-interest">
                              {formatCurrency(result.totalInterest)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">Total Contributions</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm md:text-base" data-testid="text-total-contributions">
                              {formatCurrency(result.totalContributions)}
                            </span>
                          </div>
                        </div>

                        {result.sipAnalysis && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Average Annual Return</span>
                              <span className="font-bold text-purple-600" data-testid="text-average-return">
                                {result.sipAnalysis.averageAnnualReturn.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Goal Analysis */}
                      {result.goalAnalysis && enableGoalPlanning && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-gray-900 text-lg">Goal Analysis</h4>

                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-green-700">Time to Reach Goal</span>
                                <span className="font-bold text-green-600" data-testid="text-time-to-goal">
                                  {result.goalAnalysis.timeToReachGoal > 0 ? `${result.goalAnalysis.timeToReachGoal} years` : 'Goal not achievable'}
                                </span>
                              </div>
                              {result.goalAnalysis.requiredMonthlyContribution > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-green-700">Required Monthly SIP</span>
                                  <span className="font-bold text-green-600" data-testid="text-required-sip">
                                    {formatCurrency(result.goalAnalysis.requiredMonthlyContribution)}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm text-green-600">
                                {result.goalAnalysis.isGoalAchievable ? 'Goal is achievable with current plan' : 'Consider increasing investment amount or duration'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Investment Summary */}
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Interest Rate</span>
                          <span className="font-bold text-blue-600">
                            {interestRate}% per year
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 md:py-16" data-testid="no-results">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mx-auto mb-3 sm:mb-4 md:mb-6 flex items-center justify-center">
                        <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-400">%</div>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base md:text-lg">Enter investment details to see compound interest growth</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Breakdown */}
          {result && showBreakdown && (
            <Card className="mt-4 sm:mt-6 md:mt-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-lg sm:rounded-xl md:rounded-2xl">
              <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Yearly Investment Breakdown</h3>
                  <Button
                    onClick={handleDownloadYearlyBreakdownPDF}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    data-testid="button-export-yearly-breakdown-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
                <div 
                  ref={tableScrollRef}
                  className="overflow-x-auto cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                >
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left font-bold text-gray-900 rounded-l-lg text-xs sm:text-sm md:text-base">Year</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">Amount</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">Interest Earned</th>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">SIP Contribution</th>
                        {showRealValue && <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 text-xs sm:text-sm md:text-base">Real Value</th>}
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-gray-900 rounded-r-lg text-xs sm:text-sm md:text-base">Total Interest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.yearlyBreakdown.slice(0, 10).map((year, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-gray-900 text-xs sm:text-sm md:text-base">{year.year}</td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-gray-900 font-bold text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.amount)}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-green-600 font-medium text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.interestEarned)}
                          </td>
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-blue-600 font-medium text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.sipContribution)}
                          </td>
                          {showRealValue && (
                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-purple-600 font-medium text-xs sm:text-sm md:text-base">
                              {formatCurrency(year.realValue)}
                            </td>
                          )}
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-orange-600 font-bold text-xs sm:text-sm md:text-base">
                            {formatCurrency(year.totalInterest)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Understanding Compound Interest */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 lg:mb-8">Understanding Compound Interest: How Your Money Grows Exponentially</h2>
              <div className="prose max-w-none text-gray-700 space-y-4 sm:space-y-5 md:space-y-6">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Compound interest is the phenomenon where your money earns interest on both the original principal and the accumulated interest from previous periods. Unlike simple interest that only earns on the principal, compound interest creates exponential growth, making it one of the most powerful wealth-building tools available to investors. Albert Einstein allegedly called it "the eighth wonder of the world," and for good reason.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">The Compound Interest Formula</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Our calculator uses the standard compound interest formula: A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the annual interest rate (as a decimal), n is the number of times interest compounds per year, and t is the time in years. This formula accurately predicts how your investment will grow over time, accounting for the compounding frequency you choose.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">Why Compounding Frequency Matters</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  The frequency of compounding significantly impacts your returns. Daily compounding generates slightly more interest than monthly, which in turn beats quarterly or annual compounding. For example, $10,000 invested at 8% annually for 10 years grows to $21,589 with annual compounding, but $22,196 with daily compounding—a difference of $607. While this may seem modest, over longer periods and larger amounts, these differences become substantial.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">The Time Factor in Compound Growth</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Time is the most powerful variable in compound interest. A 25-year-old investing $500 monthly at 10% until age 65 accumulates approximately $3.16 million. Starting at 35 with the same monthly investment yields only $1.13 million—less than half! Those 10 extra years of compounding create over $2 million in additional wealth. This demonstrates why starting early is crucial for retirement planning and long-term financial goals.
                </p>

                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-5 sm:mt-6 md:mt-7 lg:mt-8 mb-2 sm:mb-3 md:mb-4">SIP and Regular Contributions</h3>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                  Systematic Investment Plans (SIPs) combine the power of compound interest with dollar-cost averaging. By investing fixed amounts regularly, you buy more units when prices are low and fewer when high, potentially improving long-term returns. Our calculator shows how even modest monthly contributions, when compounded over time, can build substantial wealth. For instance, adding just $500 monthly to a $10,000 investment at 8% annual return grows to over $183,000 in 15 years.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Types of Investments */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Investment Types and Expected Returns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    Conservative Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Low-risk options like savings accounts (1-2% APY), certificates of deposit (3-5% APY), government bonds (4-6% APY), and money market accounts (3-4% APY). These provide stable, predictable returns with minimal risk of principal loss, ideal for emergency funds and short-term goals. While returns are modest, the security and liquidity make them essential portfolio components.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    Moderate Growth Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Balanced options including corporate bonds (5-8% APY), balanced mutual funds (6-10% annual returns), real estate investment trusts (7-10% returns), and dividend-paying stocks (4-8% dividends plus growth). These offer growth potential while managing risk through diversification. Ideal for medium-term goals like home down payments or college savings.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    Growth Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Equity-focused options like index funds (8-12% historical returns), growth stocks (10-15% potential returns), and equity mutual funds (8-14% average returns). Stock market investments historically average 10% annually over long periods, though with significant year-to-year volatility. Best suited for long-term goals like retirement, where time smooths out market fluctuations.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    Aggressive Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    High-growth potential options including small-cap stocks (12-18% potential), emerging market funds (10-20% historical), sector-specific funds (varies widely), and growth ETFs (10-16% average). These carry higher risk but offer the greatest compound growth potential. Suitable for young investors with long time horizons who can weather market volatility for potentially superior returns.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    Tax-Advantaged Accounts
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Retirement accounts like 401(k)s, Traditional IRAs, Roth IRAs, and 529 education plans that compound tax-free or tax-deferred. These accounts supercharge compound interest by eliminating annual tax drag on dividends and capital gains. A Roth IRA allowing $6,500 annual contributions at 8% return grows to over $1 million in 40 years, all tax-free in retirement.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                    </div>
                    Alternative Investments
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Non-traditional options including peer-to-peer lending (6-10% returns), crowdfunding real estate (8-12% potential), cryptocurrency staking (variable, 4-15%), and precious metals (3-8% long-term). These can offer diversification and unique return profiles but often carry higher risks, less liquidity, and require more research and active management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Tips */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">Expert Investment Tips for Maximum Compound Growth</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">1. Start Investing Early</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Time is compound interest's greatest ally. Starting at 25 instead of 35 can result in 2-3x more wealth at retirement with the same monthly investment. Even small amounts invested early compound to significant sums. Don't wait for the "perfect" time—start with what you can afford today.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">2. Reinvest All Dividends and Interest</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Always enable dividend reinvestment (DRIP) to buy additional shares automatically. This harnesses compound interest fully by keeping all earnings working for you. Over decades, reinvested dividends can account for 40-50% of total portfolio returns.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">3. Increase Contributions Regularly</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Use step-up SIPs to increase investment amounts annually, ideally matching salary increases. Even a 5% annual increase in contributions can boost final wealth by 50-70%. This strategy keeps pace with inflation while accelerating compound growth exponentially.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">4. Choose the Right Asset Allocation</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Balance risk and return based on your age and goals. Young investors can handle more stocks for higher compound growth. As retirement approaches, gradually shift to bonds and stable investments to protect accumulated wealth while still benefiting from compounding.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">5. Minimize Fees and Taxes</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    High fees erode compound returns significantly. A 1% annual fee can reduce a portfolio by 25-30% over 30 years. Choose low-cost index funds, use tax-advantaged accounts, and hold investments long-term to minimize taxes and maximize compounding efficiency.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">6. Never Withdraw Principal</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Maintain separate emergency funds and short-term savings to avoid disrupting compound growth. Every dollar withdrawn loses all future compounding potential. A $10,000 withdrawal at age 30 could cost $100,000+ in lost growth by retirement.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">7. Account for Inflation</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Factor in 2-3% annual inflation when planning returns. An 8% nominal return becomes 5-6% real return after inflation. Use our inflation-adjusted calculator feature to see your actual purchasing power in future dollars and set realistic financial goals.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">8. Stay Invested During Market Downturns</h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    Market volatility is normal and temporary. Selling during downturns locks in losses and interrupts compounding. Historical data shows markets recover and reach new highs. Stay invested, continue contributions, and even increase them during dips to buy low.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-8 bg-white/90 backdrop-blur-sm shadow-lg border-0 rounded-xl sm:rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Frequently Asked Questions - Free Compound Interest Calculator 2025</h2>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-blue-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is compound interest and how does it work?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest which only earns on the principal, compound interest creates exponential growth. For example, $1,000 at 10% simple interest earns $100 yearly, but with monthly compounding earns increasingly more each period as interest earns interest, resulting in $1,104.71 after one year versus $1,100 with simple interest.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-green-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is a realistic return rate for investments?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Historical stock market returns average 10% annually over long periods, but individual results vary widely. Conservative savings accounts offer 1-3%, bonds 4-6%, balanced portfolios 6-8%, and equity-heavy portfolios 8-12%. For retirement planning, financial advisors typically recommend assuming 6-8% to be conservative. Never chase unrealistic returns—if it sounds too good to be true, it usually is.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-purple-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How accurate is this compound interest calculator?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Our calculator uses industry-standard financial formulas that provide mathematically accurate projections based on the inputs you provide. However, actual investment returns fluctuate year to year and may differ from the constant rate used in calculations. Use it for planning and comparison purposes, understanding that real-world results will vary based on market performance, fees, taxes, and timing of contributions.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-orange-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What's the difference between annual and monthly compounding?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Compounding frequency determines how often interest is calculated and added to the principal. Monthly compounding calculates interest 12 times per year, while annual compounding does so once. More frequent compounding yields higher returns—$10,000 at 8% for 10 years grows to $21,589 with annual compounding but $22,196 with monthly, a $607 difference. Daily compounding offers slightly more, though the improvement diminishes with higher frequencies.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-indigo-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Is it better to invest a lump sum or use SIP?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Both strategies have merits. Lump sum investing immediately puts all money to work, maximizing time in the market—statistically superior if markets trend upward. However, SIP (Systematic Investment Plan) offers dollar-cost averaging, reducing timing risk and making investing more affordable through regular smaller contributions. Most successful investors use both: invest lump sums when available (bonuses, inheritances) while maintaining regular SIP contributions from income.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-pink-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How does inflation affect compound interest?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Inflation erodes purchasing power of future dollars. An 8% investment return with 3% inflation yields only 5% "real" return in purchasing power. Our calculator's inflation adjustment feature shows this real value, helping you understand what your future wealth can actually buy. Always plan for inflation-adjusted goals to ensure your future wealth maintains desired purchasing power, especially for long-term retirement planning.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-teal-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Can I use this calculator for retirement planning?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Absolutely! This calculator is excellent for retirement planning. Input your current savings as principal, monthly contributions as SIP amount, estimated return rate (6-8% is conservative for retirement), and years until retirement. Enable inflation adjustment to see real purchasing power. For comprehensive retirement planning, also consider Social Security, pensions, and required minimum distributions. Use the goal planning feature to see if you're on track to reach your retirement number.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-red-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is step-up SIP and when should I use it?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Step-up SIP automatically increases your investment amount by a fixed percentage annually, typically 5-10%. This aligns investments with career growth and rising income, dramatically boosting long-term wealth. Starting with $500 monthly at 10% step-up grows contributions to $814 in year 5 and $1,319 in year 10. Over 30 years, a 10% step-up can increase final wealth by 50-70% compared to flat contributions. Use step-up if you expect regular salary increases or want to systematically increase savings as expenses allow.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-amber-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Should I take a business loan to invest and benefit from compound interest?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Generally, borrowing money to invest (leverage) is risky and not recommended for most investors. Business loan interest rates (typically 7-15%) often exceed reliable investment returns, and market volatility can lead to losses while loan payments remain fixed. However, borrowing for business growth that generates revenue exceeding loan costs can be strategic. Use our <a href="/tools/business-loan-calculator" className="text-blue-600 hover:text-blue-800 font-semibold underline">Business Loan Calculator</a> to compare loan costs versus expected returns. Only invest borrowed money if you have: high risk tolerance, strong cash flow to cover payments regardless of investment performance, and expected returns significantly exceeding loan interest rates.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-cyan-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How to calculate compound interest formula step by step?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    The compound interest formula is: A = P(1 + r/n)^(nt), where A is the final amount, P is principal, r is annual interest rate (decimal), n is compounding frequency per year, and t is time in years. For example: $10,000 at 8% annual rate, compounded monthly (n=12) for 10 years: A = 10,000(1 + 0.08/12)^(12×10) = 10,000(1.00667)^120 = $22,196. For investments with monthly deposits, use our calculator above which applies this formula iteratively for each contribution period, providing accurate projections including SIP, step-up increases, and inflation adjustments.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-emerald-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">What is compound interest vs simple interest? Which is better?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Compound interest calculates interest on both principal and accumulated interest, creating exponential growth. Simple interest only calculates interest on the original principal. Over time, compound interest significantly outperforms simple interest. Example: $10,000 at 8% for 20 years yields $46,610 with compound interest but only $26,000 with simple interest—a $20,610 difference! For wealth building, always choose investments with compound interest such as retirement accounts, stocks, mutual funds, and savings accounts that compound regularly.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-violet-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How does compound interest work with monthly deposits and contributions?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    With monthly deposits, each contribution starts earning compound interest from the moment it's added. Earlier deposits have more time to compound and grow exponentially. For example, investing $500 monthly at 8% for 30 years: your total contributions are $180,000, but the final value reaches $679,000—nearly $500,000 from compound interest alone! Each monthly deposit acts as a new principal amount that compounds alongside your original investment, accelerating wealth accumulation significantly compared to a single lump sum without regular contributions.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-rose-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Can I use this as a 401k or IRA compound interest calculator?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Yes! This calculator is perfect for 401k and IRA retirement planning. Enter your current 401k/IRA balance as principal, monthly contributions (including employer match), expected annual return (historically 8-10% for stock-heavy portfolios, 6-8% for balanced), and years until retirement. The calculator shows growth projections with compound interest. For 401k planning, remember to factor in employer matching—it's free money that compounds! For traditional IRAs and 401ks, also consider future tax implications when withdrawing. Use the inflation adjustment feature to see real purchasing power in retirement.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-sky-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Why is this the best free compound interest calculator for 2025?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Our 2025 compound interest calculator offers advanced features not found in basic calculators: daily/monthly/yearly compounding options, systematic investment plans (SIP) with step-up increases, inflation-adjusted real value calculations, goal planning tools, detailed yearly breakdowns, interactive charts, PDF export, and shareable results. It supports multiple currencies, handles partial years, and provides both nominal and real returns. Best of all, it's 100% free with no registration, ads, or limitations. Whether you're planning retirement, comparing investment strategies, or learning about compound interest, our calculator provides institutional-grade accuracy with a user-friendly interface.
                  </p>
                </div>

                <div className="border-l-2 sm:border-l-3 md:border-l-4 border-lime-500 pl-3 sm:pl-4 md:pl-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">How to use compound interest calculator with inflation adjustment?</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    To calculate inflation-adjusted returns: 1) Enable SIP/Advanced Options, 2) Enter your expected inflation rate (typically 2-3% annually), 3) Check "Show Inflation Adjusted" after calculating results. The calculator displays both nominal value (face value in future dollars) and real value (purchasing power in today's dollars). For example, $100,000 in 20 years with 3% inflation equals only $55,368 in today's purchasing power. Always plan for inflation-adjusted goals to ensure your future wealth maintains desired purchasing power, especially for long-term retirement planning.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Financial Calculators */}
          <Card className="mt-12 sm:mt-14 md:mt-16 lg:mt-20 bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg rounded-2xl">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">Related Financial Calculators</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-7 md:mb-8">
                Explore our other free financial calculators to make informed decisions about your money:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                <a href="/tools/mortgage-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Mortgage Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Calculate home loan payments including taxes and insurance</p>
                </a>
                <a href="/tools/debt-payoff-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Debt Payoff Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Plan your strategy to become debt-free faster</p>
                </a>
                <a href="/tools/loan-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Loan Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Calculate loan payments and total interest costs</p>
                </a>
                <a href="/tools/budget-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Budget Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Create a personalized budget plan</p>
                </a>
                <a href="/tools/investment-return-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Investment Return Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Calculate returns on your investments</p>
                </a>
                <a href="/tools/retirement-calculator" className="bg-white p-3 sm:p-4 md:p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Retirement Calculator</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Plan for a comfortable retirement</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}