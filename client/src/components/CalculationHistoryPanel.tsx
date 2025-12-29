import { useState, useEffect } from 'react';
import { CalculationHistory, getCalculationHistory, deleteCalculation, clearAllCalculations, exportHistoryAsJSON } from '@/lib/calculationHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Download, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CalculationHistoryPanelProps {
  toolFilter?: string;
}

export function CalculationHistoryPanel({ toolFilter }: CalculationHistoryPanelProps) {
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, [toolFilter]);

  const loadHistory = () => {
    const allHistory = getCalculationHistory();
    const filtered = toolFilter 
      ? allHistory.filter(h => h.toolName === toolFilter)
      : allHistory;
    setHistory(filtered);
  };

  const handleDelete = (id: string) => {
    deleteCalculation(id);
    loadHistory();
    toast({
      title: 'Deleted',
      description: 'Calculation removed from history',
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all calculation history? This cannot be undone.')) {
      clearAllCalculations();
      loadHistory();
      toast({
        title: 'Cleared',
        description: 'All calculation history has been removed',
      });
    }
  };

  const handleExport = () => {
    const json = exportHistoryAsJSON();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', `calculation-history-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: 'Exported',
      description: 'Calculation history downloaded',
    });
  };

  if (history.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-8 text-center">
          <p className="text-muted-foreground mb-4">No calculations in history yet</p>
          <p className="text-sm text-muted-foreground">Your calculations will appear here automatically</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{history.length} calculation{history.length !== 1 ? 's' : ''}</h3>
          <p className="text-sm text-muted-foreground">Saved locally in your browser</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            data-testid="button-export-history"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleClearAll}
            data-testid="button-clear-all-history"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {history.map((calculation) => (
          <Card key={calculation.id} className="hover-elevate">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{calculation.toolName}</CardTitle>
                  <CardDescription>
                    {calculation.timestamp.toLocaleString()}
                  </CardDescription>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === calculation.id ? null : calculation.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`button-toggle-calculation-${calculation.id}`}
                >
                  {expandedId === calculation.id ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </CardHeader>

            {expandedId === calculation.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Inputs</h4>
                    <div className="bg-muted p-3 rounded text-sm space-y-1 max-h-40 overflow-y-auto">
                      {Object.entries(calculation.inputs).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{JSON.stringify(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Results</h4>
                    <div className="bg-muted p-3 rounded text-sm space-y-1 max-h-40 overflow-y-auto">
                      {Object.entries(calculation.results).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(calculation.id)}
                  className="w-full"
                  data-testid={`button-delete-calculation-${calculation.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete This Calculation
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
