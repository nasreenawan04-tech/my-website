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
import { Calculator, TrendingUp, Clock, PieChart, Share2, Download, TrendingDown, DollarSign, Info, RotateCcw, BarChart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { saveCalculation } from '@/lib/calculationHistory';

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

interface ComparisonEMI {
  name: string;
  principal: number;
  rate: number;
  tenure: number;
  tenureType: string;
  emi: number;
  totalInterest: number;
  totalAmount: number;
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
  const [showComparison, setShowComparison] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [comparisonEMIs, setComparisonEMIs] = useState<ComparisonEMI[]>([]);
  const [chartFilter, setChartFilter] = useState<'both' | 'principal' | 'interest'>('both');
  const [result, setResult] = useState<EMIResult | null>(null);
  const [shouldAutoCalculate, setShouldAutoCalculate] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const amortizationRef = useRef<HTMLDivElement>(null);
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
      },
      {
        "@type": "Question",
        "name": "What's the difference between fixed and floating EMI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fixed EMI: Interest rate remains constant throughout the loan tenure, resulting in predictable monthly payments. Best when rates are low or expected to rise. Typically 0.5-1% higher than floating rates initially. Floating EMI: Interest rate fluctuates based on market conditions (usually linked to bank's base rate). EMI can increase or decrease quarterly/annually. Better when rates are high or expected to fall. Riskier but potentially more cost-effective over long term. Most borrowers save 10-15% on interest with floating rates over 20+ year loans in stable economies."
        }
      },
      {
        "@type": "Question",
        "name": "Can I pay off my loan early without penalties?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "This depends entirely on your loan agreement and lender policies. Most lenders allow partial prepayments (10-25% of principal per year) without penalties for floating rate loans. For fixed-rate loans, prepayment penalties typically range from 2-5% of the outstanding principal amount if you close the loan before a certain period (usually 3-5 years). Home loans in many countries have no prepayment penalties for floating rate loans. Always check your loan agreement's prepayment clause and calculate if the interest savings outweigh any penalties before making large prepayments."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if I miss an EMI payment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Missing EMI payments has serious consequences: Late fees typically 2-3% of EMI amount, credit score drops 50-100 points after 30 days and 100-150 points after 60-90 days, higher interest rates on future loans due to lower credit score, legal action after 3-6 missed payments, and asset seizure for secured loans after 90-180 days of default. If facing payment difficulties, contact your lender immediately to discuss restructuring options like tenure extension, EMI reduction, or temporary moratorium."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Calculate EMI Using This Calculator",
    "description": "Step-by-step guide to calculating your loan EMI payments in 7 simple steps",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Enter Loan Amount",
        "text": "Input the total loan amount you wish to borrow. This can range from as low as $1,000 to millions, depending on your needs."
      },
      {
        "@type": "HowToStep",
        "name": "Set Interest Rate",
        "text": "Enter the annual interest rate offered by your lender. Home loans typically range from 6-9%, personal loans from 10-20%, and car loans from 7-12%."
      },
      {
        "@type": "HowToStep",
        "name": "Choose Loan Tenure",
        "text": "Select the loan repayment period in years or months. Shorter tenures mean higher EMIs but less total interest, while longer tenures offer lower EMIs with higher overall costs."
      },
      {
        "@type": "HowToStep",
        "name": "Select Currency (Optional)",
        "text": "Choose your preferred currency (USD, EUR, GBP, INR, etc.) for accurate regional calculations."
      },
      {
        "@type": "HowToStep",
        "name": "Add Prepayment Details (Optional)",
        "text": "If you plan to make lump-sum prepayments, enter the amount and when you'll make it. This shows how much interest you can save and how quickly you can close the loan."
      },
      {
        "@type": "HowToStep",
        "name": "Enable Step-Up EMI (Optional)",
        "text": "For young professionals expecting salary growth, enable step-up EMI to start with lower payments that increase annually (typically 5-10%)."
      },
      {
        "@type": "HowToStep",
        "name": "Click Calculate & Analyze Results",
        "text": "Click the 'Calculate EMI' button to instantly see your monthly payment, total interest, payment breakdown charts, and complete amortization schedule."
      }
    ]
  };

  // Load parameters from URL on mount (for shared links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const rate = params.get('rate');
    const term = params.get('term');
    const unit = params.get('unit');
    const curr = params.get('currency');
    const prepayment = params.get('prepayment');
    const prepaymentAfter = params.get('prepaymentAfter');
    const stepUp = params.get('stepUp');

    if (amount || rate || term) {
      if (amount) setLoanAmount(amount);
      if (rate) setInterestRate(rate);
      if (term) setLoanTenure(term);
      if (unit) setTenureType(unit);
      if (curr) setCurrency(curr);
      if (prepayment) {
        setPrepaymentAmount(prepayment);
        if (parseFloat(prepayment) > 0) setEnablePrepayment(true);
      }
      if (prepaymentAfter) setPrepaymentAfterMonths(prepaymentAfter);
      if (stepUp) {
        setStepUpPercentage(stepUp);
        if (parseFloat(stepUp) > 0) setEnableStepUp(true);
      }
      setShouldAutoCalculate(true);
    }
  }, []);

  // Auto-calculate when URL parameters are loaded
  useEffect(() => {
    if (shouldAutoCalculate) {
      calculateEMI();
      toast({
        title: "Shared calculation loaded!",
        description: "Results from the shared link have been calculated."
      });
      setShouldAutoCalculate(false);
    }
  }, [shouldAutoCalculate]);

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

    // Save calculation history (non-blocking)
    saveCalculation(
      'EMI Calculator',
      '/tools/emi-calculator',
      {
        loanAmount: principal,
        interestRate: parseFloat(interestRate),
        loanTenure: parseFloat(loanTenure),
        tenureType,
        currency,
        enablePrepayment,
        prepaymentAmount: prepayment,
        prepaymentAfterMonths: prepaymentAfter,
        enableStepUp,
        stepUpPercentage: parseFloat(stepUpPercentage)
      },
      {
        emi: Math.round(baseEMI * 100) / 100,
        totalAmount: Math.round(finalTotalAmount * 100) / 100,
        totalInterest: Math.round(finalTotalInterest * 100) / 100,
        interestPercentage: Math.round(interestPercentage * 100) / 100,
        prepaymentAnalysis,
        stepUpAnalysis
      }
    );

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
    setResult(null);
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

  const addToComparison = () => {
    if (!result) {
      toast({ title: "Please calculate EMI first", variant: "destructive" });
      return;
    }

    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const tenure = parseFloat(loanTenure);

    const newComparison: ComparisonEMI = {
      name: `Scenario ${comparisonEMIs.length + 1}`,
      principal,
      rate,
      tenure,
      tenureType,
      emi: result.emi,
      totalInterest: result.totalInterest,
      totalAmount: result.totalAmount,
    };

    setComparisonEMIs([...comparisonEMIs, newComparison]);
    setShowComparison(true);
    toast({ title: "Added to comparison!", description: `${comparisonEMIs.length + 1} EMI scenarios saved` });
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
      doc.text('EMI ANALYSIS REPORT', pageWidth / 2, 13, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional EMI Payment Calculator', pageWidth / 2, 22, { align: 'center' });
      
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
      const termDisplay = tenureType === 'years' ? `${loanTenure} years` : `${loanTenure} months`;
      doc.text('Loan Term:', margin + 3, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(termDisplay, margin + 28, yPos + 7);

      doc.setFont('helvetica', 'bold');
      doc.text('Currency:', margin + 3, yPos + 14);
      doc.setFont('helvetica', 'normal');
      doc.text(currency, margin + 28, yPos + 14);

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

      // Monthly EMI Highlight Box
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 22, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MONTHLY EMI', pageWidth / 2, yPos + 7, { align: 'center' });
      doc.setFontSize(18);
      doc.text(formatCurrency(result.emi), pageWidth / 2, yPos + 16, { align: 'center' });

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
      const metrics: { label: string; value: string; color: [number, number, number] }[] = [
        { label: 'Loan Amount', value: formatCurrency(parseFloat(loanAmount)), color: [71, 85, 105] },
        { label: 'Interest Rate', value: `${interestRate}%`, color: [71, 85, 105] },
        { label: 'Monthly EMI', value: formatCurrency(result.emi), color: [37, 99, 235] },
        { label: 'Total Amount Paid', value: formatCurrency(result.totalAmount), color: [71, 85, 105] },
        { label: 'Principal Amount', value: formatCurrency(result.principalAmount), color: [16, 185, 129] },
        { label: 'Total Interest', value: formatCurrency(result.totalInterest), color: [239, 68, 68] },
        { label: 'Interest Portion', value: `${interestPercent}%`, color: [220, 38, 38] }
      ];

      if (parseFloat(prepaymentAmount) > 0 && enablePrepayment) {
        metrics.push({ label: 'Prepayment Amount', value: formatCurrency(parseFloat(prepaymentAmount)), color: [16, 185, 129] });
      }

      if (enableStepUp) {
        metrics.push({ label: 'Step-Up Rate', value: `${stepUpPercentage}% annually`, color: [202, 138, 4] });
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

      // Prepayment Analysis
      if (result.prepaymentAnalysis) {
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

        const boxHeight = 30;
        doc.setFillColor(236, 253, 245);
        doc.rect(margin, yPos, pageWidth - (2 * margin), boxHeight, 'F');
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.8);
        doc.rect(margin, yPos, pageWidth - (2 * margin), boxHeight, 'S');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 163, 74);
        doc.text('SAVINGS WITH PREPAYMENT', margin + 3, yPos + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Interest Saved: ${formatCurrency(result.prepaymentAnalysis.interestSaved)}`, margin + 3, yPos + 12);
        doc.text(`Time Saved: ${timeSavedText}`, margin + 3, yPos + 18);
        doc.text(`New Payoff Time: ${Math.round(result.prepaymentAnalysis.newTenure)} months`, pageWidth / 2 + 3, yPos + 12);
        const originalMonths = tenureType === 'years' ? parseFloat(loanTenure) * 12 : parseFloat(loanTenure);
        doc.text(`Original Tenure: ${Math.round(originalMonths)} months`, pageWidth / 2 + 3, yPos + 18);
        doc.setFontSize(7);
        doc.text(`(Paying off ${Math.round(result.prepaymentAnalysis.timeReduction)} months earlier!)`, pageWidth / 2 + 3, yPos + 24);

        doc.setTextColor(0, 0, 0);
        yPos += boxHeight + 6;
      }

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
        interpretation = 'Excellent EMI Structure - Your interest payments are very low relative to the principal, indicating favorable loan terms and efficient debt repayment.';
        interpretationColor = [22, 163, 74];
      } else if (interestPercentNum < 40) {
        interpretation = 'Good EMI Terms - Your interest-to-principal ratio shows reasonable borrowing costs. Consider prepayments to reduce total interest burden.';
        interpretationColor = [202, 138, 4];
      } else if (interestPercentNum < 60) {
        interpretation = 'Moderate Interest Load - Interest comprises a significant portion of your EMI payments. Prepayments could yield substantial savings.';
        interpretationColor = [59, 130, 246];
      } else {
        interpretation = 'High Interest Burden - Interest payments are substantial. Strongly consider prepayments or accelerated payments to reduce total cost.';
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
      if (comparisonEMIs.length > 0) {
        try {
          doc.addPage();
          yPos = margin;
          
          // Section Header
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138);
          doc.text('EMI SCENARIO COMPARISON', margin, yPos);
          yPos += 2;
          doc.setDrawColor(37, 99, 235);
          doc.line(margin, yPos, margin + 65, yPos);
          yPos += 10;
          doc.setTextColor(0, 0, 0);
          
          // Optimized column widths (total: 186px)
          const tableWidth = pageWidth - (2 * margin);
          const colWidths = {
            scenario: 22,       // "SCENARIO"
            amount: 33,         // "AMOUNT"
            rate: 18,           // "RATE"
            term: 25,           // "TERM"
            emi: 45,            // "MONTHLY EMI"
            interest: 43        // "TOTAL INTEREST"
          };
          
          // Table header
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, tableWidth, 10, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(55, 65, 81);
          
          let xPos = margin;
          doc.text('SCENARIO', xPos + 2, yPos + 6);
          xPos += colWidths.scenario;
          doc.text('AMOUNT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.amount;
          doc.text('RATE', xPos + colWidths.rate - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.rate;
          doc.text('TERM', xPos + colWidths.term - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.term;
          doc.text('MONTHLY EMI', xPos + colWidths.emi - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.emi;
          doc.text('TOTAL INTEREST', xPos + colWidths.interest - 2, yPos + 6, { align: 'right' });
          
          yPos += 10;
          doc.setFont('helvetica', 'normal');
          
          // Table rows - 30 rows per page
          const rowsPerPage = 30;
          let rowCount = 0;
          
          comparisonEMIs.forEach((scenario, index) => {
            if (rowCount >= rowsPerPage) {
              // Add new page
              doc.addPage();
              yPos = margin;
              
              // Repeat header
              doc.setFontSize(12);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(30, 58, 138);
              doc.text('EMI SCENARIO COMPARISON - CONTINUED', margin, yPos);
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
              doc.text('SCENARIO', xPos + 2, yPos + 6);
              xPos += colWidths.scenario;
              doc.text('AMOUNT', xPos + colWidths.amount - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.amount;
              doc.text('RATE', xPos + colWidths.rate - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.rate;
              doc.text('TERM', xPos + colWidths.term - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.term;
              doc.text('MONTHLY EMI', xPos + colWidths.emi - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.emi;
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
            
            // Scenario name
            doc.setTextColor(17, 24, 39);
            doc.text(scenario.name, xPos + 2, yPos + 5.5);
            
            // Amount
            xPos += colWidths.scenario;
            doc.text(formatCurrency(scenario.principal), xPos + colWidths.amount - 2, yPos + 5.5, { align: 'right' });
            
            // Rate
            xPos += colWidths.amount;
            doc.text(`${scenario.rate}%`, xPos + colWidths.rate - 2, yPos + 5.5, { align: 'right' });
            
            // Term
            xPos += colWidths.rate;
            const termDisplay = scenario.tenureType === 'years' ? `${scenario.tenure}y` : `${scenario.tenure}m`;
            doc.text(termDisplay, xPos + colWidths.term - 2, yPos + 5.5, { align: 'right' });
            
            // Monthly EMI
            xPos += colWidths.term;
            doc.setTextColor(37, 99, 235);
            doc.text(formatCurrency(scenario.emi), xPos + colWidths.emi - 2, yPos + 5.5, { align: 'right' });
            
            // Total Interest
            xPos += colWidths.emi;
            doc.setTextColor(234, 88, 12);
            doc.text(formatCurrency(scenario.totalInterest), xPos + colWidths.interest - 2, yPos + 5.5, { align: 'right' });
            
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
      if (showSchedule && result?.amortizationSchedule) {
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
            month: 20,      // "MONTH"
            emi: 37,        // "EMI"
            principal: 37,  // "PRINCIPAL"
            interest: 37,   // "INTEREST"
            balance: 55     // "BALANCE"
          };
          
          // Table header
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, yPos, tableWidth, 10, 'F');
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(55, 65, 81);
          
          let xPos = margin;
          doc.text('MONTH', xPos + 2, yPos + 6);
          xPos += colWidths.month;
          doc.text('EMI', xPos + colWidths.emi - 2, yPos + 6, { align: 'right' });
          xPos += colWidths.emi;
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
              doc.text('MONTH', xPos + 2, yPos + 6);
              xPos += colWidths.month;
              doc.text('EMI', xPos + colWidths.emi - 2, yPos + 6, { align: 'right' });
              xPos += colWidths.emi;
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
            
            xPos += colWidths.month;
            doc.text(formatCurrency(payment.emi), xPos + colWidths.emi - 2, yPos + 5.5, { align: 'right' });
            
            xPos += colWidths.emi;
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
        doc.text('DapsiWow EMI Calculator', margin, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 10, { align: 'right' });

        // Website
        doc.setTextColor(37, 99, 235);
        doc.text('www.dapsiwow.com', pageWidth - margin, pageHeight - 5, { align: 'right' });
      }

      doc.save('emi-analysis-report.pdf');

      toast({
        title: "Professional PDF Downloaded",
        description: "Your detailed EMI analysis report has been saved successfully.",
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
        <title>EMI Calculator - Monthly Payments Instantly | DapsiWow</title>
        <meta name="description" content="Calculate your EMI instantly with our free loan calculator. Get payment schedules, compare loans, plan prepayments. Trusted by 100K+ users. 100% free, no signup." />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="EMI Calculator - Monthly Payments Instantly | DapsiWow" />
        <meta property="og:description" content="Calculate your EMI instantly with our free loan calculator. Get payment schedules, compare loans, plan prepayments. Trusted by 100K+ users. 100% free, no signup." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dapsiwow.com/tools/emi-calculator" />
        <meta property="og:image" content="https://dapsiwow.com/og-emi-calculator.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="EMI Calculator - Calculate monthly loan payments with prepayment analysis" />
        <meta property="og:site_name" content="DapsiWow" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EMI Calculator - Monthly Payments Instantly | DapsiWow" />
        <meta name="twitter:description" content="Calculate your EMI instantly with our free loan calculator. Get payment schedules, compare loans, plan prepayments. Trusted by 100K+ users. 100% free." />
        <meta name="twitter:image" content="https://dapsiwow.com/twitter-emi-calculator.jpg" />
        <meta name="twitter:image:alt" content="EMI Calculator - Free loan payment calculator with prepayment analysis" />
        <meta name="twitter:site" content="@DapsiWow" />
        <meta name="twitter:creator" content="@DapsiWow" />
        
        {/* Basic Meta Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="DapsiWow Financial Tools Team" />
        <meta name="publisher" content="DapsiWow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://dapsiwow.com/tools/emi-calculator" />
        
        {/* Hreflang Tags for International SEO */}
        <link rel="alternate" hrefLang="en" href="https://dapsiwow.com/tools/emi-calculator" />
        <link rel="alternate" hrefLang="en-US" href="https://dapsiwow.com/tools/emi-calculator" />
        <link rel="alternate" hrefLang="en-GB" href="https://dapsiwow.com/tools/emi-calculator" />
        <link rel="alternate" hrefLang="en-CA" href="https://dapsiwow.com/tools/emi-calculator" />
        <link rel="alternate" hrefLang="en-AU" href="https://dapsiwow.com/tools/emi-calculator" />
        <link rel="alternate" hrefLang="x-default" href="https://dapsiwow.com/tools/emi-calculator" />
        
        {/* PWA Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EMI Calculator" />
        <meta name="application-name" content="EMI Calculator" />
        <meta name="theme-color" content="#2563eb" />

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
                  Calculate Monthly EMI
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
                      className="w-full sm:w-auto h-10 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl shadow-lg transition-colors duration-200"
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
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          data-testid="button-show-schedule"
                        >
                          {showSchedule ? 'Hide' : 'Show'} Payment Schedule
                        </Button>
                        <Button
                          onClick={addToComparison}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          data-testid="button-add-comparison"
                        >
                          Add to Comparison
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
                    </div>
                  )}
                </div>

                {result ? (
                  <div ref={resultsRef} className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">Your Loan Calculation Results</h2>

                    <div className="space-y-4 sm:space-y-6 md:space-y-8" data-testid="emi-results">
                      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-200 shadow-sm">
                        <div className="text-center space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">Estimated Monthly EMI</div>
                          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 break-all" data-testid="text-monthly-emi">
                            {formatCurrency(result.emi)}
                          </div>
                          <p className="text-xs text-gray-500">Based on monthly payment frequency</p>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 text-sm sm:text-base">Principal Amount</span>
                            <span className="font-bold text-gray-900 text-sm sm:text-base break-all" data-testid="text-principal-amount">
                              {formatCurrency(result.principalAmount)}
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
                            <BarChart className="w-4 h-4 mr-1.5" />
                            {showCharts ? 'Hide Chart' : 'Show Chart'}
                          </Button>
                        </div>
                      </div>

                      {result.prepaymentAnalysis && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-3 sm:mb-4 text-base sm:text-lg flex items-center gap-2">
                            <TrendingDown className="w-5 h-5" />
                            Prepayment Benefits
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Interest Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg break-all">
                                {formatCurrency(result.prepaymentAnalysis.interestSaved)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-green-700 font-medium text-sm sm:text-base">Time Saved:</span>
                              <span className="font-bold text-green-800 text-sm sm:text-base md:text-lg">
                                {Math.round(result.prepaymentAnalysis.timeReduction / 12)} years
                              </span>
                            </div>
                            <p className="text-sm text-green-700 mt-3 italic">
                              💰 By making prepayments, you'll save significantly on interest and become debt-free faster!
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Professional Payment Charts */}
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
                        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
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

                {/* EMI Comparison Section */}
                {showComparison && comparisonEMIs.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-comparison-table">
                        EMI Comparison
                      </h3>
                      <Button
                        onClick={() => setComparisonEMIs([])}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs sm:text-sm w-full sm:w-auto"
                        data-testid="button-clear-comparison"
                      >
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        Clear All
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Compare different EMI scenarios side-by-side to find the best option.</p>
                    <div className="overflow-x-auto -mx-4 sm:mx-0" ref={comparisonRef}>
                      <table className="w-full min-w-[600px]" data-testid="comparison-table">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Scenario</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Principal</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Rate</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Tenure</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Monthly EMI</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Interest</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {comparisonEMIs.map((emi, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors" data-testid={`comparison-row-${index}`}>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{emi.name}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(emi.principal)}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{emi.rate}%</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{emi.tenure} {emi.tenureType}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{formatCurrency(emi.emi)}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(emi.totalInterest)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Amortization Schedule Section */}
                {result && showSchedule && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-left" data-testid="heading-amortization-schedule">
                        Amortization Schedule (First 5 Years)
                      </h3>
                      <Button
                        onClick={() => setShowSchedule(false)}
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
                              <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(payment.emi)}</td>
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
              </div>
            </CardContent>
          </Card>

          {/* SEO Content Sections */}
          <div className="mt-8 sm:mt-12 md:mt-16 space-y-8 sm:space-y-12 md:space-y-16">

            {/* Introduction Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">What is an EMI Calculator?</h2>
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700 space-y-4">
                <p>
                  An <strong>EMI (Equated Monthly Installment) Calculator</strong> is a free online financial tool that helps you calculate the monthly payment you need to make on a loan. Whether you're planning to buy a home, car, or need a personal loan, this calculator provides instant, accurate EMI calculations along with a complete breakdown of principal and interest payments over the loan tenure.
                </p>

                <div className="bg-blue-50 rounded-lg p-4 sm:p-6 my-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Why Use Our EMI Calculator?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">•</span>
                      <span><strong>Instant Results:</strong> Get your EMI calculation in seconds with detailed breakdowns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">•</span>
                      <span><strong>Accurate Calculations:</strong> Uses bank-standard EMI formula trusted by financial institutions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">•</span>
                      <span><strong>100% Free:</strong> No registration, no hidden fees, unlimited calculations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">•</span>
                      <span><strong>Advanced Features:</strong> Analyze prepayments, step-up EMIs, and compare scenarios</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">•</span>
                      <span><strong>Mobile-Friendly:</strong> Calculate on any device, anywhere, anytime</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold text-lg">•</span>
                      <span><strong>Privacy Protected:</strong> We don't store your financial data</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 mb-4">Who Benefits from EMI Calculator?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-bold text-gray-900 mb-2">Home Buyers</h4>
                    <p className="text-sm text-gray-700">Plan your mortgage payments and understand total interest costs before committing to a home loan</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-bold text-gray-900 mb-2">Vehicle Purchasers</h4>
                    <p className="text-sm text-gray-700">Calculate car loan EMIs and compare different loan tenures to find the most affordable option</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-bold text-gray-900 mb-2">Business Owners</h4>
                    <p className="text-sm text-gray-700">Evaluate business loan affordability and plan cash flow with accurate EMI projections</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="font-bold text-gray-900 mb-2">Students</h4>
                    <p className="text-sm text-gray-700">Plan education loan repayments and understand the long-term financial commitment</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                    <h4 className="font-bold text-gray-900 mb-2">Personal Loan Seekers</h4>
                    <p className="text-sm text-gray-700">Compare different personal loan offers and choose the most cost-effective option</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-lg p-4 border border-indigo-200">
                    <h4 className="font-bold text-gray-900 mb-2">Financial Planners</h4>
                    <p className="text-sm text-gray-700">Help clients understand loan commitments and optimize their debt repayment strategies</p>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* How to Use Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">How to Use the EMI Calculator</h2>

              <div className="space-y-6 mb-8">
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border-l-4 border-blue-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Enter Loan Amount</h3>
                      <p className="text-gray-700 text-sm sm:text-base">Input the total loan amount you wish to borrow. This can range from as low as $1,000 to millions, depending on your needs.</p>
                      <p className="text-blue-600 font-semibold mt-2 text-sm">Example: $200,000 for a home loan</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border-l-4 border-green-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Set Interest Rate</h3>
                      <p className="text-gray-700 text-sm sm:text-base">Enter the annual interest rate offered by your lender. Home loans typically range from 6-9%, personal loans from 10-20%, and car loans from 7-12%.</p>
                      <p className="text-green-600 font-semibold mt-2 text-sm">Example: 8.5% per annum</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border-l-4 border-purple-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Choose Loan Tenure</h3>
                      <p className="text-gray-700 text-sm sm:text-base">Select the loan repayment period in years or months. Shorter tenures mean higher EMIs but less total interest, while longer tenures offer lower EMIs with higher overall costs.</p>
                      <p className="text-purple-600 font-semibold mt-2 text-sm">Example: 20 years (240 months)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border-l-4 border-orange-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Select Currency (Optional)</h3>
                      <p className="text-gray-700 text-sm sm:text-base">Choose your preferred currency (USD, EUR, GBP, INR, etc.) for accurate regional calculations.</p>
                      <p className="text-orange-600 font-semibold mt-2 text-sm">Example: USD ($)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border-l-4 border-red-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Add Prepayment Details (Optional)</h3>
                      <p className="text-gray-700 text-sm sm:text-base">If you plan to make lump-sum prepayments, enter the amount and when you'll make it. This shows how much interest you can save and how quickly you can close the loan.</p>
                      <p className="text-red-600 font-semibold mt-2 text-sm">Example: $10,000 prepayment after 12 months</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border-l-4 border-indigo-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg">6</div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Enable Step-Up EMI (Optional)</h3>
                      <p className="text-gray-700 text-sm sm:text-base">For young professionals expecting salary growth, enable step-up EMI to start with lower payments that increase annually (typically 5-10%).</p>
                      <p className="text-indigo-600 font-semibold mt-2 text-sm">Example: 5% annual increase</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm border-l-4 border-teal-500">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-lg">7</div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Click Calculate & Analyze Results</h3>
                      <p className="text-gray-700 text-sm sm:text-base">Click the "Calculate EMI" button to instantly see your monthly payment, total interest, payment breakdown charts, and complete amortization schedule.</p>
                      <p className="text-teal-600 font-semibold mt-2 text-sm">Tip: Use share/download buttons to save your results</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 sm:p-6 border border-yellow-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Pro Tips for Best Results:</h3>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Compare Multiple Scenarios:</strong> Try different loan amounts and tenures to find your optimal monthly budget</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Factor in Prepayments:</strong> Even small prepayments can save thousands in interest over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Review Amortization Schedule:</strong> Understand how your payments shift from interest-heavy to principal-heavy over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Keep EMI Below 40% of Income:</strong> Financial experts recommend keeping total EMI payments under 40-50% of gross monthly income</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span><strong>Download PDF Reports:</strong> Save detailed calculations for offline review or sharing with family/advisors</span>
                  </li>
                </ul>
              </div>
              </CardContent>
            </Card>

            {/* Real-World Examples Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">EMI Calculator Examples: Real-World Scenarios</h2>

              {/* Example 1 */}
              <div className="mb-8 sm:mb-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-5 sm:p-6 lg:p-8 border border-green-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 1: Home Loan for First-Time Buyer</h3>
                
                <div className="bg-white rounded-lg p-4 sm:p-5 mb-4">
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> Sarah is a 28-year-old software engineer buying her first home. She needs to calculate affordable monthly payments for a $300,000 home loan.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Input Values:</h4>
                      <ul className="space-y-1 text-sm sm:text-base text-gray-700">
                        <li>• <strong>Loan Amount:</strong> $300,000</li>
                        <li>• <strong>Interest Rate:</strong> 7.5% per annum</li>
                        <li>• <strong>Loan Tenure:</strong> 25 years (300 months)</li>
                        <li>• <strong>Currency:</strong> USD</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Calculation Results:</h4>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <p className="font-mono">P = $300,000</p>
                        <p className="font-mono">R = 7.5% / 12 = 0.625%</p>
                        <p className="font-mono">N = 25 × 12 = 300 months</p>
                        <p className="mt-2 text-green-600 font-bold">EMI = $2,216.71/month</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-100 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">Results:</h4>
                    <ul className="space-y-1 text-sm sm:text-base text-gray-700">
                      <li>• <strong>Monthly EMI:</strong> $2,216.71</li>
                      <li>• <strong>Total Amount Paid:</strong> $665,013</li>
                      <li>• <strong>Total Interest Paid:</strong> $365,013 (121.7% of principal)</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Interpretation & Action Steps:</h4>
                    <p className="text-gray-700 mb-3">Sarah's EMI of $2,216.71 represents approximately 28% of her $8,000 monthly gross income, which is well within the recommended 30-40% debt-to-income ratio. The total interest of $365,013 is substantial but typical for a 25-year mortgage.</p>
                    <p className="font-semibold text-gray-900 mb-2">Recommended Actions:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• <strong>Comfortable Fit:</strong> EMI is affordable within her budget</li>
                      <li>• <strong>Consider Prepayments:</strong> Making an annual $5,000 prepayment could save $80,000+ in interest and reduce tenure by 4-5 years</li>
                      <li>• <strong>Refinance Opportunity:</strong> If rates drop below 6.5%, refinancing could save $200+/month</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Example 2 */}
              <div className="mb-8 sm:mb-10 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-5 sm:p-6 lg:p-8 border border-blue-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 2: Car Loan with Shorter Tenure</h3>
                
                <div className="bg-white rounded-lg p-4 sm:p-5 mb-4">
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> Mark wants to buy a $35,000 SUV and is comparing 3-year vs 5-year loan options to minimize total interest paid.</p>
                  
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[500px] text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left font-bold text-gray-900">Loan Details</th>
                          <th className="px-3 py-2 text-left font-bold text-gray-900">3-Year Option</th>
                          <th className="px-3 py-2 text-left font-bold text-gray-900">5-Year Option</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 font-medium">Loan Amount</td>
                          <td className="px-3 py-2">$35,000</td>
                          <td className="px-3 py-2">$35,000</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-3 py-2 font-medium">Interest Rate</td>
                          <td className="px-3 py-2">9% per annum</td>
                          <td className="px-3 py-2">9% per annum</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 font-medium">Loan Tenure</td>
                          <td className="px-3 py-2">3 years (36 months)</td>
                          <td className="px-3 py-2">5 years (60 months)</td>
                        </tr>
                        <tr className="bg-blue-100 font-bold">
                          <td className="px-3 py-2">Monthly EMI</td>
                          <td className="px-3 py-2 text-blue-600">$1,113.27</td>
                          <td className="px-3 py-2 text-blue-600">$726.67</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-3 py-2 font-medium">Total Amount Paid</td>
                          <td className="px-3 py-2">$40,077.72</td>
                          <td className="px-3 py-2">$43,600.20</td>
                        </tr>
                        <tr className="bg-orange-100">
                          <td className="px-3 py-2 font-medium">Total Interest</td>
                          <td className="px-3 py-2 text-orange-600">$5,077.72</td>
                          <td className="px-3 py-2 text-orange-600">$8,600.20</td>
                        </tr>
                        <tr className="bg-green-100 font-bold">
                          <td className="px-3 py-2">Interest Savings</td>
                          <td className="px-3 py-2 text-green-600">Saves $3,522.48!</td>
                          <td className="px-3 py-2">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <h4 className="font-bold text-gray-900 mb-2">Key Insights:</h4>
                    <p className="text-gray-700 mb-3">While the 5-year loan offers a lower monthly payment ($726.67 vs $1,113.27), choosing the 3-year option saves $3,522.48 in total interest—nearly 70% savings!</p>
                    <p className="font-semibold text-gray-900 mb-2">Decision Factors:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• <strong>Choose 3-Year:</strong> If Mark can afford $1,113/month and wants to save $3,500+ and own the car faster</li>
                      <li>• <strong>Choose 5-Year:</strong> If monthly budget is tight and the extra $386/month is needed for other expenses</li>
                      <li>• <strong>Hybrid Approach:</strong> Take 5-year loan but make prepayments to reduce tenure and save interest</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Example 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-5 sm:p-6 lg:p-8 border border-purple-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example 3: Personal Loan with Strategic Prepayments</h3>
                
                <div className="bg-white rounded-lg p-4 sm:p-5">
                  <p className="text-gray-700 mb-4"><strong>Scenario:</strong> Lisa takes a $50,000 personal loan for home renovation and plans to make annual lump-sum prepayments from her bonus to reduce interest burden.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Without Prepayment:</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Loan: $50,000 @ 12% for 5 years</li>
                        <li>• Monthly EMI: $1,112.23</li>
                        <li>• Total Interest: $16,733.80</li>
                        <li>• Total Paid: $66,733.80</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">With $3,000 Annual Prepayment:</h4>
                      <ul className="space-y-1 text-sm text-gray-700 font-semibold text-purple-700">
                        <li>• Same base EMI: $1,112.23</li>
                        <li>• Tenure reduced to: 3.8 years</li>
                        <li>• Total Interest: $11,247.95</li>
                        <li>• <strong className="text-green-600">Interest Saved: $5,485.85</strong></li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Impact Analysis:</h4>
                    <p className="text-gray-700 mb-2">By adding just $3,000/year (or $250/month) to her regular EMI, Lisa achieves:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• <strong className="text-green-600">32.7% reduction in total interest</strong> ($5,485.85 saved)</li>
                      <li>• <strong>1.2 years earlier loan closure</strong> (debt-free 14 months sooner)</li>
                      <li>• <strong>Improved credit utilization</strong> and better credit score</li>
                      <li>• <strong>Peace of mind</strong> from faster debt elimination</li>
                    </ul>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Understanding Results Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Understanding Your EMI Results</h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">EMI-to-Income Ratio Categories</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <h4 className="font-bold text-green-800 mb-2">Excellent: EMI &lt; 25% of Income</h4>
                      <p className="text-sm text-gray-700">You have significant financial flexibility with comfortable room for savings, investments, and lifestyle expenses. This is an ideal EMI burden that allows for emergency funds and long-term wealth building.</p>
                      <p className="text-sm text-green-700 mt-2"><strong>Recommendation:</strong> Consider investing surplus income for retirement or other financial goals</p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <h4 className="font-bold text-blue-800 mb-2">Good: EMI 25-35% of Income</h4>
                      <p className="text-sm text-gray-700">Your EMI is manageable and within recommended limits. You still have adequate funds for other expenses and some savings, though less flexibility than the excellent range.</p>
                      <p className="text-sm text-blue-700 mt-2"><strong>Recommendation:</strong> Maintain this balance while building emergency fund (3-6 months expenses)</p>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                      <h4 className="font-bold text-yellow-800 mb-2">Caution: EMI 35-45% of Income</h4>
                      <p className="text-sm text-gray-700">You're approaching the upper limit of recommended EMI burden. Budget carefully and avoid taking additional loans. Limited room for unexpected expenses or emergencies.</p>
                      <p className="text-sm text-yellow-700 mt-2"><strong>Recommendation:</strong> Create strict budget, avoid new debt, build emergency fund, consider prepayments</p>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <h4 className="font-bold text-red-800 mb-2">High Risk: EMI &gt; 45% of Income</h4>
                      <p className="text-sm text-gray-700">This EMI burden is concerning and may strain your finances. High risk of payment difficulties if income decreases or unexpected expenses arise. Lenders may reject additional loan applications.</p>
                      <p className="text-sm text-red-700 mt-2"><strong>Recommendation:</strong> Seek financial counseling, explore loan restructuring, increase income sources, or consider smaller loan amount</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-5 sm:p-6 shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">When to Seek Professional Advice</h3>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Your EMI exceeds 45% of your monthly income</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>You're considering multiple simultaneous loans (home + car + personal)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Your income is irregular or commission-based</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>You have existing debts with poor repayment history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>You're unsure about loan terms, prepayment penalties, or hidden charges</span>
                    </li>
                  </ul>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* EMI Formula Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">EMI Formula Explained</h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">The Standard EMI Formula</h3>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-center text-lg sm:text-xl font-mono font-bold text-gray-900 mb-2">
                      EMI = [P × R × (1+R)^N] / [(1+R)^N - 1]
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm sm:text-base text-gray-700">
                    <p><strong>Where:</strong></p>
                    <ul className="ml-4 space-y-1">
                      <li>• <strong>P</strong> = Principal loan amount (the amount borrowed)</li>
                      <li>• <strong>R</strong> = Monthly interest rate (Annual rate ÷ 12 ÷ 100)</li>
                      <li>• <strong>N</strong> = Loan tenure in months (Years × 12)</li>
                      <li>• <strong>EMI</strong> = Equated Monthly Installment</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Example Calculation Step-by-Step</h3>
                  <p className="text-gray-700 mb-4"><strong>Given:</strong> Loan of $100,000 at 10% annual interest for 15 years</p>
                  
                  <div className="space-y-3 font-mono text-sm">
                    <div className="bg-white rounded p-3">
                      <p className="font-semibold mb-1">Step 1: Convert annual interest to monthly rate</p>
                      <p>R = 10% ÷ 12 ÷ 100 = 0.008333</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <p className="font-semibold mb-1">Step 2: Convert years to months</p>
                      <p>N = 15 years × 12 = 180 months</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <p className="font-semibold mb-1">Step 3: Calculate (1+R)^N</p>
                      <p>(1 + 0.008333)^180 = 4.440213</p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <p className="font-semibold mb-1">Step 4: Apply the formula</p>
                      <p>EMI = [100,000 × 0.008333 × 4.440213] / [4.440213 - 1]</p>
                      <p>EMI = [3,699.93] / [3.440213]</p>
                      <p className="text-green-600 font-bold mt-2">EMI = $1,075.01 per month</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-gray-700"><strong>Verification:</strong></p>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• Total Amount Paid = $1,075.01 × 180 = $193,501.80</li>
                      <li>• Principal = $100,000</li>
                      <li>• Total Interest = $193,501.80 - $100,000 = $93,501.80</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Important Notes</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>This formula assumes <strong>fixed interest rates</strong> throughout the loan tenure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>For <strong>floating rate loans</strong>, EMI may change when interest rates change</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Formula does <strong>not include</strong> processing fees, insurance, or other charges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>Actual EMI may vary slightly due to <strong>rounding</strong> by lenders</span>
                    </li>
                  </ul>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions (FAQ)</h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What is EMI and how is it calculated?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each month. It's calculated using the formula: EMI = [P × R × (1+R)^N]/[(1+R)^N-1], where P is the principal loan amount, R is the monthly interest rate (annual rate divided by 12), and N is the number of monthly installments. This formula ensures equal payments throughout the loan term, with each payment covering both principal and interest portions.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">How does prepayment reduce my EMI burden?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Prepayment directly reduces your outstanding principal, which means less interest accrues over the remaining loan period. This can significantly shorten your loan tenure and save thousands in interest costs. For example, adding $100/month to a $200,000 loan at 7% interest can save over $30,000 in interest and reduce the loan term by 5-7 years. Even small extra payments compound to big savings over time.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What is step-up EMI and who should use it?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Step-up EMI allows you to start with lower monthly payments that increase annually, typically by 5-10%, aligned with expected salary growth. It's ideal for young professionals whose income is expected to grow consistently, allowing them to afford larger loans while maintaining their current lifestyle. The increasing EMIs align with expected salary increments, making higher loan amounts more accessible early in one's career.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Should I choose a shorter or longer loan tenure?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Shorter tenures (5-15 years) mean higher EMIs but significantly less total interest paid—often saving 30-50% in interest costs. Longer tenures (20-30 years) offer lower EMIs but cost substantially more overall due to extended interest payments. Choose based on your monthly budget, income stability, and financial goals. If you can comfortably afford higher payments without compromising emergency savings, shorter tenure saves substantial money long-term.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What percentage of my income should go toward EMI?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Financial experts recommend keeping total EMI payments (all loans combined) below 40-50% of your gross monthly income. This ensures you have enough for savings, emergencies, and other expenses. Lenders typically use a debt-to-income ratio of 40% as a maximum threshold for loan approval. For better financial health, aim for 30% or less, leaving room for investments and lifestyle expenses.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">How accurate is this EMI calculator?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">This EMI calculator uses bank-grade formulas that are 100% accurate for calculating standard EMI payments, total interest, and amortization schedules. It's the same calculation method banks and financial institutions use. However, actual loan terms may include additional fees (processing fees, insurance, etc.) that aren't reflected in basic EMI calculations. Always verify final numbers with your lender before committing to a loan.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Can I use this calculator for all types of loans?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Yes, this EMI calculator works for all types of fixed-rate loans including home loans, car loans, personal loans, business loans, education loans, and more. It supports loans from $1,000 to $10,000,000+ with any interest rate. The calculator also handles different currencies (USD, EUR, GBP, INR, etc.), prepayment scenarios, and step-up EMI structures. It's a universal tool for any standard amortizing loan calculation.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What's the difference between fixed and floating EMI?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Fixed EMI: Interest rate remains constant throughout the loan tenure, resulting in predictable monthly payments. Best when rates are low or expected to rise. Typically 0.5-1% higher than floating rates initially. Floating EMI: Interest rate fluctuates based on market conditions (usually linked to bank's base rate). EMI can increase or decrease quarterly/annually. Better when rates are high or expected to fall. Riskier but potentially more cost-effective over long term. Most borrowers save 10-15% on interest with floating rates over 20+ year loans in stable economies.</p>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Can I pay off my loan early without penalties?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">This depends entirely on your loan agreement and lender policies. Most lenders allow partial prepayments (10-25% of principal per year) without penalties for floating rate loans. For fixed-rate loans, prepayment penalties typically range from 2-5% of the outstanding principal amount if you close the loan before a certain period (usually 3-5 years). Home loans in many countries have no prepayment penalties for floating rate loans. Always check your loan agreement's prepayment clause and calculate if the interest savings outweigh any penalties before making large prepayments.</p>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What happens if I miss an EMI payment?</h3>
                  <p className="text-gray-700 text-sm sm:text-base">Missing EMI payments has serious consequences: Late fees typically 2-3% of EMI amount, credit score drops 50-100 points after 30 days and 100-150 points after 60-90 days, higher interest rates on future loans due to lower credit score, legal action after 3-6 missed payments, and asset seizure for secured loans after 90-180 days of default. If facing payment difficulties, contact your lender immediately to discuss restructuring options like tenure extension, EMI reduction, or temporary moratorium.</p>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Related Calculators Section */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Related Financial Calculators</h2>
                <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">Explore more financial tools to plan your finances comprehensively</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <a href="/tools/loan-calculator" className="group bg-white rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Calculator className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                      Loan Calculator
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Calculate loan EMI, total interest, and compare different loan options with detailed amortization schedules.
                  </p>
                </a>

                <a href="/tools/mortgage-calculator" className="group bg-white rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-green-600 transition-colors">
                      Mortgage Calculator
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Estimate your monthly mortgage payments including taxes, insurance, and PMI. Plan your home financing strategy.
                  </p>
                </a>

                <a href="/tools/compound-interest-calculator" className="group bg-white rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-purple-600 transition-colors">
                      Compound Interest Calculator
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Calculate compound interest growth on investments and savings. Visualize wealth accumulation over time.
                  </p>
                </a>

                <a href="/tools/investment-calculator" className="group bg-white rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-orange-600 transition-colors">
                      Investment Calculator
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Project investment returns with different contribution schedules. Plan your wealth-building journey.
                  </p>
                </a>

                <a href="/tools/retirement-calculator" className="group bg-white rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-red-600 transition-colors">
                      Retirement Calculator
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Calculate how much you need to save for retirement. Plan your golden years with confidence.
                  </p>
                </a>

                <a href="/tools/roi-calculator" className="group bg-white rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <BarChart className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                      ROI Calculator
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Calculate return on investment for business decisions, property, or financial instruments.
                  </p>
                </a>
              </div>
              </CardContent>
            </Card>

            {/* Final Call-to-Action */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-xl sm:rounded-2xl">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-gray-900">Ready to Calculate Your EMI?</h2>
              <p className="text-center text-base sm:text-lg text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed">
                Start using our free EMI calculator now to plan your loan repayments, compare scenarios, and make informed financial decisions. No registration required!
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Start Calculating Now:</h3>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">100% Free Forever</h4>
                      <p className="text-sm text-gray-600">No hidden fees, subscriptions, or registration required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Instant Results</h4>
                      <p className="text-sm text-gray-600">Get detailed EMI breakdowns in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Advanced Features</h4>
                      <p className="text-sm text-gray-600">Prepayment analysis, step-up EMI, and currency support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Export & Share</h4>
                      <p className="text-sm text-gray-600">Download PDF reports or share results with advisors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Privacy Protected</h4>
                      <p className="text-sm text-gray-600">Your financial data stays private—we don't store anything</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  size="lg"
                  className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-base sm:text-lg px-8 sm:px-12 rounded-lg"
                  data-testid="button-scroll-to-calculator"
                >
                  Calculate Your EMI Now
                </Button>
                <p className="mt-4 text-sm sm:text-base text-gray-600">Scroll to top to use the calculator</p>
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
