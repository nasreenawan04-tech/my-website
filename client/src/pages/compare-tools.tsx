import { useComparison } from "@/context/ComparisonContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolHeroSection from "@/components/ToolHeroSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, RefreshCw, Save, Download } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveComparison } from "@/lib/calculationHistory";
import { exportToPDF } from "@/lib/dynamicPDFExporter";

export default function CompareTools() {
  const { selectedTools, removeFromCompare, clearComparison } = useComparison();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [sharedInputs, setSharedInputs] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
              <Card key={tool.id} className="relative overflow-hidden flex flex-col">
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
                    <i className={`${tool.icon} text-primary text-xl`} />
                    <h3 className="font-bold text-lg">{tool.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
                </div>

                <CardContent className="p-6 flex-1">
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground italic">
                    <p>Comparison engine for {tool.name} coming soon.</p>
                  </div>
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
