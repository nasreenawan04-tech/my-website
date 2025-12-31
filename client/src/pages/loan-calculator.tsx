import { Helmet } from "react-helmet-async";
import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Calculator, 
  DollarSign, 
  TrendingDown, 
  Clock, 
  Calendar as CalendarIcon, 
  Download, 
  Share2, 
  RotateCcw, 
  Pin, 
  Info, 
  Zap, 
  PieChart, 
  BarChart as BarChartIcon, 
  History 
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { usePinnedTools } from "@/hooks/use-pinned-tools";
import { PresetManager } from "@/components/preset-manager";
import { ShareResultsButton } from "@/components/share-results-button";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  amortizationSchedule: AmortizationRow[];
}

export default function LoanCalculator() {
  const { toast } = useToast();
  const { isPinned, togglePin } = usePinnedTools();
  const toolId = "loan-calculator";
  const resultsRef = useRef<HTMLDivElement>(null);

  const [loanAmount, setLoanAmount] = useState<string>("100000");
  const [interestRate, setInterestRate] = useState<string>("5.5");
  const [loanTerm, setLoanTerm] = useState<string>("30");
  const [termUnit, setTermUnit] = useState<string>("years");
  const [paymentFrequency, setPaymentFrequency] = useState<string>("monthly");
  const [extraPayment, setExtraPayment] = useState<string>("0");
  const [processingFee, setProcessingFee] = useState<string>("0");
  const [balloonPayment, setBalloonPayment] = useState<string>("0");
  const [biweeklyMode, setBiweeklyMode] = useState<"standard" | "accelerated">("standard");
  
  const [result, setResult] = useState<LoanResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const calculateLoan = () => {
    setIsCalculating(true);
    const errors: Record<string, string> = {};
    
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100;
    const term = parseFloat(loanTerm);
    const extra = parseFloat(extraPayment || "0");
    const fee = parseFloat(processingFee || "0");
    const balloon = parseFloat(balloonPayment || "0");

    if (isNaN(principal) || principal <= 0) errors.loanAmount = "Enter a valid amount";
    if (isNaN(rate) || rate < 0) errors.interestRate = "Enter a valid rate";
    if (isNaN(term) || term <= 0) errors.loanTerm = "Enter a valid term";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsCalculating(false);
      return;
    }

    setValidationErrors({});

    setTimeout(() => {
      const termInMonths = termUnit === 'years' ? term * 12 : term;
      const monthlyRate = rate / 12;
      
      let periodsPerYear = 12;
      if (paymentFrequency === 'biweekly') periodsPerYear = 26;
      if (paymentFrequency === 'weekly') periodsPerYear = 52;
      
      const periodicRate = rate / periodsPerYear;
      const totalPeriods = termUnit === 'years' ? term * periodsPerYear : (term / 12) * periodsPerYear;
      
      // Standard loan payment formula
      let periodicPayment = (principal * periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / 
                         (Math.pow(1 + periodicRate, totalPeriods) - 1);
      
      if (paymentFrequency === 'biweekly' && biweeklyMode === 'accelerated') {
        // Accelerated bi-weekly is half of the monthly payment paid every 2 weeks
        const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / 
                             (Math.pow(1 + monthlyRate, termInMonths) - 1);
        periodicPayment = monthlyPayment / 2;
      }

      const schedule: AmortizationRow[] = [];
      let balance = principal;
      let totalInterest = 0;
      let period = 1;

      while (balance > 0.01 && period <= totalPeriods * 2) {
        const interest = balance * periodicRate;
        let principalPaid = periodicPayment + extra - interest;
        
        if (principalPaid > balance) {
          principalPaid = balance;
        }
        
        balance -= principalPaid;
        totalInterest += interest;
        
        schedule.push({
          month: period,
          payment: principalPaid + interest,
          principal: principalPaid,
          interest: interest,
          balance: Math.max(0, balance)
        });
        
        period++;
      }

      setResult({
        monthlyPayment: periodicPayment + extra,
        totalInterest,
        totalAmount: principal + totalInterest + fee,
        amortizationSchedule: schedule
      });
      setIsCalculating(false);
      
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 600);
  };

  const handleSaveToProfile = async () => {
    setIsSaving(true);
    // Mock save
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    toast({ title: "Saved to History", description: "This calculation has been added to your profile." });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Loan Analysis Report", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Loan Amount: ${formatCurrency(parseFloat(loanAmount))}`, 14, 35);
    doc.text(`Interest Rate: ${interestRate}%`, 14, 42);
    doc.text(`Term: ${loanTerm} ${termUnit}`, 14, 49);
    
    if (result) {
      doc.text(`Monthly Payment: ${formatCurrency(result.monthlyPayment)}`, 14, 60);
      doc.text(`Total Interest: ${formatCurrency(result.totalInterest)}`, 14, 67);
      doc.text(`Total Payoff: ${formatCurrency(result.totalAmount)}`, 14, 74);
      
      autoTable(doc, {
        startY: 85,
        head: [['#', 'Payment', 'Principal', 'Interest', 'Balance']],
        body: result.amortizationSchedule.slice(0, 50).map(row => [
          row.month,
          formatCurrency(row.payment),
          formatCurrency(row.principal),
          formatCurrency(row.interest),
          formatCurrency(row.balance)
        ]),
      });
    }

    doc.save("loan-report.pdf");
    setIsGeneratingPDF(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Professional Loan Calculator - DapsiWow</title>
        <meta name="description" content="Calculate loan payments, view amortization schedules, and analyze interest savings with our professional-grade calculator." />
      </Helmet>

      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <Calculator className="w-8 h-8 text-primary" />
                Loan Calculator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Plan your finances with precision. Calculate monthly payments, interest totals, and payoff timelines with professional amortization schedules.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <PresetManager
                toolId={toolId}
                onLoadPreset={(preset) => {
                  if (preset.loanAmount) setLoanAmount(preset.loanAmount);
                  if (preset.interestRate) setInterestRate(preset.interestRate);
                  if (preset.loanTerm) setLoanTerm(preset.loanTerm);
                  if (preset.termUnit) setTermUnit(preset.termUnit);
                  if (preset.paymentFrequency) setPaymentFrequency(preset.paymentFrequency);
                  if (preset.extraPayment) setExtraPayment(preset.extraPayment);
                  if (preset.processingFee) setProcessingFee(preset.processingFee);
                  if (preset.balloonPayment) setBalloonPayment(preset.balloonPayment);
                  toast({ title: "Preset Loaded", description: `Loaded values from "${preset.name}"` });
                }}
                currentValues={{
                  loanAmount,
                  interestRate,
                  loanTerm,
                  termUnit,
                  paymentFrequency,
                  extraPayment,
                  processingFee,
                  balloonPayment
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={togglePin}
              >
                <Pin className={`w-4 h-4 ${isPinned(toolId) ? 'fill-primary text-primary' : ''}`} />
                {isPinned(toolId) ? 'Pinned' : 'Pin Tool'}
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Input Panel */}
            <Card className="xl:col-span-4 shadow-sm border-muted/40 xl:sticky xl:top-24">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount" className="text-sm font-medium flex items-center gap-2">
                        Loan Amount
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>The total principal amount you want to borrow.</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="relative group">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="loanAmount"
                          type="number"
                          placeholder="e.g. 100,000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          className={`pl-9 h-11 ${validationErrors.loanAmount ? 'border-destructive ring-destructive/20' : ''}`}
                        />
                      </div>
                      {validationErrors.loanAmount && (
                        <p className="text-xs text-destructive font-medium mt-1">{validationErrors.loanAmount}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="interestRate" className="text-sm font-medium">Interest Rate (%)</Label>
                        <div className="relative group">
                          <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            id="interestRate"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 5.5"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            className={`pl-9 h-11 ${validationErrors.interestRate ? 'border-destructive ring-destructive/20' : ''}`}
                          />
                        </div>
                        {validationErrors.interestRate && (
                          <p className="text-xs text-destructive font-medium mt-1">{validationErrors.interestRate}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loanTerm" className="text-sm font-medium">Loan Term</Label>
                        <div className="flex gap-2">
                          <Input
                            id="loanTerm"
                            type="number"
                            value={loanTerm}
                            onChange={(e) => setLoanTerm(e.target.value)}
                            className={`h-11 ${validationErrors.loanTerm ? 'border-destructive ring-destructive/20' : ''}`}
                          />
                          <Select value={termUnit} onValueChange={setTermUnit}>
                            <SelectTrigger className="w-[100px] h-11">
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

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Payment Frequency</Label>
                      <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                        <SelectTrigger className="h-11">
                          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentFrequency === 'biweekly' && (
                      <div className="space-y-3 pt-2">
                        <Label className="text-sm font-medium text-primary">Bi-weekly Mode</Label>
                        <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-lg">
                          <Button
                            variant={biweeklyMode === 'standard' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setBiweeklyMode('standard')}
                            className="text-xs h-8"
                          >
                            Standard
                          </Button>
                          <Button
                            variant={biweeklyMode === 'accelerated' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setBiweeklyMode('accelerated')}
                            className="text-xs h-8"
                          >
                            Accelerated
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 space-y-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="extraPayment" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        Extra Monthly Payment
                        <Zap className="w-3 h-3 text-yellow-500" />
                      </Label>
                      <div className="relative group">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="extraPayment"
                          type="number"
                          value={extraPayment}
                          onChange={(e) => setExtraPayment(e.target.value)}
                          placeholder="e.g. 100"
                          className="pl-9 h-11 bg-muted/50"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={calculateLoan}
                      className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                      disabled={isCalculating}
                    >
                      {isCalculating ? (
                        <>
                          <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-5 h-5 mr-2" />
                          Calculate Loan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="xl:col-span-8 space-y-8" ref={resultsRef}>
              {result ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-primary text-primary-foreground border-none shadow-xl relative overflow-hidden group">
                      <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <DollarSign size={120} />
                      </div>
                      <CardContent className="p-6">
                        <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">
                          {paymentFrequency === 'biweekly' ? 'Bi-weekly Payment' : 
                           paymentFrequency === 'weekly' ? 'Weekly Payment' : 'Monthly Payment'}
                        </p>
                        <h3 className="text-3xl font-bold">{formatCurrency(result.monthlyPayment)}</h3>
                        <p className="text-xs mt-2 opacity-70">Based on {termUnit} term</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card shadow-md border-muted/40 relative overflow-hidden group">
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-primary group-hover:rotate-12 transition-transform duration-500">
                        <PieChart size={100} />
                      </div>
                      <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Interest</p>
                        <h3 className="text-3xl font-bold text-foreground">{formatCurrency(result.totalInterest)}</h3>
                        <p className="text-xs mt-2 text-muted-foreground">
                          {((result.totalInterest / result.totalAmount) * 100).toFixed(1)}% of total cost
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card shadow-md border-muted/40 relative overflow-hidden group">
                      <div className="absolute right-[-10px] bottom-[-10px] opacity-5 text-primary group-hover:scale-110 transition-transform duration-500">
                        <BarChartIcon size={100} />
                      </div>
                      <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Payoff</p>
                        <h3 className="text-3xl font-bold text-foreground">{formatCurrency(result.totalAmount)}</h3>
                        <p className="text-xs mt-2 text-muted-foreground">Principal + Interest + Fees</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts & Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="shadow-sm border-muted/40">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-semibold flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            Cost Breakdown
                          </h4>
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={[
                                  { name: 'Principal', value: parseFloat(loanAmount ?? '0') },
                                  { name: 'Interest', value: result.totalInterest },
                                  { name: 'Fees', value: parseFloat(processingFee ?? '0') }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill="hsl(var(--primary))" />
                                <Cell fill="#f43f5e" />
                                <Cell fill="#f59e0b" />
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              />
                              <Legend verticalAlign="bottom" height={36} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-muted/40">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-semibold flex items-center gap-2">
                            <BarChartIcon className="w-5 h-5 text-primary" />
                            Payment Progress
                          </h4>
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.amortizationSchedule.filter((_, i) => i % (result.amortizationSchedule.length > 24 ? Math.floor(result.amortizationSchedule.length / 10) : 1) === 0)}>
                              <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                              <XAxis 
                                dataKey="month" 
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                label={{ value: 'Payment #', position: 'bottom', offset: 0, fontSize: 12 }}
                              />
                              <YAxis 
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${value/1000}k`}
                              />
                              <RechartsTooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="balance" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorBalance)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Button 
                      onClick={handleSaveToProfile}
                      variant="outline"
                      className="gap-2 h-11"
                      disabled={isSaving}
                    >
                      {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4" />}
                      Save to History
                    </Button>
                    <Button 
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="gap-2 h-11"
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Export PDF
                    </Button>
                    <ShareResultsButton 
                      title="My Loan Calculation"
                      text={`Check out this loan calculation on DapsiWow! Monthly Payment: ${formatCurrency(result.monthlyPayment)}`}
                    />
                  </div>

                  {/* Amortization Table */}
                  <Card className="shadow-sm border-muted/40 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 border-b flex items-center justify-between">
                        <h4 className="text-lg font-semibold">Amortization Schedule</h4>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {result.amortizationSchedule.length} Payments
                        </div>
                      </div>
                      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-4 font-semibold">#</th>
                              <th className="px-6 py-4 font-semibold">Payment</th>
                              <th className="px-6 py-4 font-semibold">Principal</th>
                              <th className="px-6 py-4 font-semibold">Interest</th>
                              <th className="px-6 py-4 font-semibold">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-muted/40">
                            {result.amortizationSchedule.map((row) => (
                              <tr key={row.month} className="hover:bg-muted/20 transition-colors">
                                <td className="px-6 py-4 font-medium">{row.month}</td>
                                <td className="px-6 py-4">{formatCurrency(row.payment)}</td>
                                <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">
                                  {formatCurrency(row.principal)}
                                </td>
                                <td className="px-6 py-4 text-destructive font-medium">
                                  {formatCurrency(row.interest)}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{formatCurrency(row.balance)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Calculator className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Calculate?</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Enter your loan details in the left panel to see a detailed breakdown of your monthly payments, interest, and payoff schedule.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
