import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalculationHistoryPanel } from '@/components/CalculationHistoryPanel';
import { getCalculationHistory, getHistoryStats, importHistoryFromJSON } from '@/lib/calculationHistory';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Download, Upload } from 'lucide-react';

export default function CalculationHistoryPage() {
  const [stats, setStats] = useState({
    totalCalculations: 0,
    totalTools: 0,
    toolBreakdown: {} as Record<string, number>,
    oldestCalculation: null as Date | null,
    newestCalculation: null as Date | null
  });
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setStats(getHistoryStats());
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        importHistoryFromJSON(text);
        loadStats();
        toast({
          title: 'Imported',
          description: 'Calculation history imported successfully',
        });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: error instanceof Error ? error.message : 'Invalid file format',
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  return (
    <>
      <Helmet>
        <title>Calculation History | DapsiWow</title>
        <meta name="description" content="View and manage your calculation history from all DapsiWow tools." />
      </Helmet>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8" />
              Calculation History
            </h1>
            <p className="text-muted-foreground">View all your calculations saved locally in your browser</p>
          </div>

          {/* Statistics */}
          {stats.totalCalculations > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Calculations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCalculations}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tools Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTools}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Oldest Calculation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold">
                    {stats.oldestCalculation ? new Date(stats.oldestCalculation).toLocaleDateString() : 'N/A'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Newest Calculation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold">
                    {stats.newestCalculation ? new Date(stats.newestCalculation).toLocaleDateString() : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={handleImport}
              data-testid="button-import-history"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import History
            </Button>
          </div>

          {/* History Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Your Calculations</CardTitle>
              <CardDescription>All calculations are saved locally in your browser</CardDescription>
            </CardHeader>
            <CardContent>
              <CalculationHistoryPanel />
            </CardContent>
          </Card>

          {/* Tool Breakdown */}
          {stats.totalCalculations > 0 && Object.keys(stats.toolBreakdown).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tools Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.toolBreakdown).map(([tool, count]) => (
                    <div key={tool} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{tool}</span>
                      <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
