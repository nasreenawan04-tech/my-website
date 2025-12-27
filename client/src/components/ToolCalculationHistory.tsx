import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { PersistentStorage, STORAGE_KEYS } from '@/lib/utils/precision-engine';
import { motion, AnimatePresence } from 'framer-motion';

export interface CalculationHistoryItem {
  id: string;
  toolName: string;
  toolPath: string;
  timestamp: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
}

export function ToolCalculationHistory({ toolPath }: { toolPath?: string }) {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      const allHistory = PersistentStorage.load<CalculationHistoryItem[]>(STORAGE_KEYS.CALC_HISTORY, []);
      if (toolPath) {
        setHistory(allHistory.filter(item => item.toolPath === toolPath));
      } else {
        setHistory(allHistory);
      }
    };

    loadHistory();
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, [toolPath]);

  const clearHistory = () => {
    const allHistory = PersistentStorage.load<CalculationHistoryItem[]>(STORAGE_KEYS.CALC_HISTORY, []);
    const updated = toolPath 
      ? allHistory.filter(item => item.toolPath !== toolPath)
      : [];
    PersistentStorage.save(STORAGE_KEYS.CALC_HISTORY, updated);
    setHistory([]);
  };

  const deleteItem = (id: string) => {
    const allHistory = PersistentStorage.load<CalculationHistoryItem[]>(STORAGE_KEYS.CALC_HISTORY, []);
    const updated = allHistory.filter(item => item.id !== id);
    PersistentStorage.save(STORAGE_KEYS.CALC_HISTORY, updated);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  if (history.length === 0) return null;

  return (
    <Card className="mt-8 overflow-hidden border-neutral-200 dark:border-neutral-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-neutral-50/50 dark:bg-neutral-900/50">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          {toolPath ? 'Your Recent Calculations' : 'Recent Calculation History'}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearHistory}
          className="text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          <AnimatePresence initial={false}>
            {history.slice(0, 5).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {item.toolName}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-neutral-400 hover:text-red-500"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Inputs</p>
                    {Object.entries(item.inputs).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-neutral-500 truncate mr-2">{key}:</span>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Results</p>
                    {Object.entries(item.results).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-neutral-500 truncate mr-2">{key}:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {!toolPath && (
                  <Link href={item.toolPath}>
                    <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-blue-500 flex items-center gap-1">
                      Reuse Tool <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {history.length > 5 && (
          <div className="p-3 text-center bg-neutral-50/30 dark:bg-neutral-900/30">
            <p className="text-xs text-neutral-500">Showing 5 most recent entries</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
