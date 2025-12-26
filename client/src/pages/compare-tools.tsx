import { useComparison } from "@/context/ComparisonContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolHeroSection from "@/components/ToolHeroSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, ArrowLeft, RefreshCw, Save, Download, Calculator, TrendingDown, DollarSign, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveComparison } from "@/lib/calculationHistory";
import { exportToPDF } from "@/lib/dynamicPDFExporter";

// --- Shared Engines ---

interface EngineProps {
  toolId: string;
  sharedInputs: Record<string, any>;
  onInputChange: (key: string, value: any) => void;
}

const MortgageEngine = ({ sharedInputs, onInputChange }: EngineProps) => {
  const homePrice = sharedInputs.homePrice || 500000;
  const interestRate = sharedInputs.interestRate || 6.5;
  const loanTerm = sharedInputs.loanTerm || 30;
  const downPaymentPercent = sharedInputs.downPaymentPercent || 20;

  const results = useMemo(() => {
    const price = parseFloat(homePrice);
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;
    const down = (price * parseFloat(downPaymentPercent)) / 100;
    const principal = price - down;

    if (principal <= 0 || rate <= 0 || term <= 0) return null;

    const monthlyPI = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalAmount = monthlyPI * term;
    const totalInterest = totalAmount - principal;

    return {
      monthlyPayment: monthlyPI,
      totalInterest,
      totalAmount,
      loanAmount: principal
    };
  }, [homePrice, interestRate, loanTerm, downPaymentPercent]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Home Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="number" 
              className="pl-9"
              value={homePrice}
              onChange={(e) => onInputChange('homePrice', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interest Rate (%)</Label>
            <Input 
              type="number" 
              step="0.1"
              value={interestRate}
              onChange={(e) => onInputChange('interestRate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Term (Years)</Label>
            <Input 
              type="number" 
              value={loanTerm}
              onChange={(e) => onInputChange('loanTerm', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Down Payment (%)</Label>
          <Input 
            type="number" 
            value={downPaymentPercent}
            onChange={(e) => onInputChange('downPaymentPercent', e.target.value)}
          />
        </div>
      </div>

      {results && (
        <div className="pt-6 border-t space-y-4">
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Payment</p>
            <p className="text-2xl font-bold text-primary">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mb-1">Total Interest</p>
              <p className="text-sm font-semibold">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mb-1">Total Loan</p>
              <p className="text-sm font-semibold">${results.loanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LoanEngine = ({ sharedInputs, onInputChange }: EngineProps) => {
  const loanAmount = sharedInputs.loanAmount || sharedInputs.homePrice || 100000;
  const interestRate = sharedInputs.interestRate || 5.5;
  const loanTerm = sharedInputs.loanTerm || 30;

  const results = useMemo(() => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;

    if (principal <= 0 || rate <= 0 || term <= 0) return null;

    const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalAmount = monthlyPayment * term;
    const totalInterest = totalAmount - principal;

    return {
      monthlyPayment,
      totalInterest,
      totalAmount
    };
  }, [loanAmount, interestRate, loanTerm]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loan Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="number" 
              className="pl-9"
              value={loanAmount}
              onChange={(e) => onInputChange('loanAmount', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interest Rate (%)</Label>
            <Input 
              type="number" 
              step="0.1"
              value={interestRate}
              onChange={(e) => onInputChange('interestRate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Term (Years)</Label>
            <Input 
              type="number" 
              value={loanTerm}
              onChange={(e) => onInputChange('loanTerm', e.target.value)}
            />
          </div>
        </div>
      </div>

      {results && (
        <div className="pt-6 border-t space-y-4">
          <div className="bg-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Payment</p>
            <p className="text-2xl font-bold text-primary">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mb-1">Total Interest</p>
              <p className="text-sm font-semibold">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground mb-1">Total Payback</p>
              <p className="text-sm font-semibold">${results.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Page ---

export default function CompareTools() {
  const { selectedTools, removeFromCompare, clearComparison } = useComparison();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [sharedInputs, setSharedInputs] = useState<Record<string, any>>({
    homePrice: 500000,
    loanAmount: 100000,
    interestRate: 6.5,
    loanTerm: 30,
    downPaymentPercent: 20
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleInputChange = (key: string, value: any) => {
    setSharedInputs(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (selectedTools.length === 0) {
      const timer = setTimeout(() => setLocation("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedTools, setLocation]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your comparison.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveComparison(
        user.uid,
        selectedTools[0].category,
        selectedTools.map(t => t.id)
      );
      toast({
        title: "Comparison saved",
        description: "You can find your saved comparisons in your profile.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save comparison. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = useCallback(async () => {
    if (selectedTools.length === 0) return;
    setIsExporting(true);
    try {
      await exportToPDF({
        filename: `tool-comparison-${selectedTools[0].category}.pdf`,
        elementId: 'comparison-grid',
        toolName: 'Tool Comparison'
      });
      
      toast({
        title: "Report generated",
        description: "Your comparison report has been downloaded.",
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export failed",
        description: "Could not generate PDF report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [selectedTools, toast]);

  if (selectedTools.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">No tools selected for comparison</h1>
        <p className="text-muted-foreground mb-6">Redirecting you to the home page...</p>
        <Button onClick={() => setLocation("/")}>Go Home Now</Button>
      </div>
    );
  }

  const renderEngine = (toolId: string) => {
    const props = { toolId, sharedInputs, onInputChange: handleInputChange };
    if (toolId === 'mortgage-calculator') return <MortgageEngine {...props} />;
    if (toolId === 'loan-calculator') return <LoanEngine {...props} />;
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground italic">
        <p>Comparison engine for this tool coming soon.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Helmet>
        <title>Compare Tools - DapsiWow</title>
      </Helmet>
      <Header />
      
      <main className="flex-1">
        <ToolHeroSection 
          title="Compare Tools" 
          description={`Comparing ${selectedTools.length} tools from the ${selectedTools[0].category} category.`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
                <ArrowLeft size={16} /> Back
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2"
              >
                <Save size={16} /> {isSaving ? "Saving..." : "Save Comparison"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportPDF} 
                disabled={isExporting}
                className="gap-2"
              >
                <Download size={16} /> {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
              <Button variant="outline" onClick={clearComparison} className="gap-2 text-destructive hover:text-destructive">
                <RefreshCw size={16} /> Clear All
              </Button>
            </div>
          </div>

          <div id="comparison-grid" className={`grid gap-6 grid-cols-1 md:grid-cols-${selectedTools.length} lg:grid-cols-${selectedTools.length}`}>
            {selectedTools.map((tool) => (
              <Card key={tool.id} className="relative overflow-hidden flex flex-col border-2 border-transparent hover:border-primary/20 transition-all duration-300">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeFromCompare(tool.id)}
                >
                  <X size={16} />
                </Button>
                
                <div className="p-6 border-b bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Calculator className="text-primary h-5 w-5" />
                    <h3 className="font-bold text-lg">{tool.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                </div>

                <CardContent className="p-6 flex-1">
                  {renderEngine(tool.id)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
