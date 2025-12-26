import { useComparison } from "@/context/ComparisonContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolHeroSection from "@/components/ToolHeroSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

// For now, we'll map category to a generic comparison view
// In a real app, we might want specialized comparison components per tool type
export default function CompareTools() {
  const { selectedTools, removeFromCompare, clearComparison } = useComparison();
  const [, setLocation] = useLocation();
  const [sharedInputs, setSharedInputs] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedTools.length === 0) {
      // Redirect back if no tools selected
      const timer = setTimeout(() => setLocation("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedTools, setLocation]);

  if (selectedTools.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">No tools selected for comparison</h1>
        <p className="text-muted-foreground mb-6">Redirecting you to the home page...</p>
        <Button onClick={() => setLocation("/")}>Go Home Now</Button>
      </div>
    );
  }

  const handleSharedInputChange = (key: string, value: any) => {
    setSharedInputs(prev => ({ ...prev, [key]: value }));
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
          <div className="flex justify-between items-center mb-8">
            <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="outline" onClick={clearComparison} className="gap-2 text-destructive hover:text-destructive">
              <RefreshCw size={16} /> Clear All
            </Button>
          </div>

          <div className={`grid gap-6 grid-cols-1 md:grid-cols-${selectedTools.length} lg:grid-cols-${selectedTools.length}`}>
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
                  {/* In a fully dynamic system, we would render the tool's engine here */}
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground italic">
                    <p>Comparison engine for {tool.name} coming soon.</p>
                    <p className="text-xs mt-2">Shared state: {JSON.stringify(sharedInputs)}</p>
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
