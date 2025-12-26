import { createContext, useContext, useState, ReactNode } from 'react';
import { type Tool } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

interface ComparisonContextType {
  selectedTools: Tool[];
  addToCompare: (tool: Tool) => void;
  removeFromCompare: (toolId: string) => void;
  clearComparison: () => void;
  isComparing: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const { toast } = useToast();

  const addToCompare = (tool: Tool) => {
    if (selectedTools.find((t) => t.id === tool.id)) {
      toast({
        title: "Already added",
        description: `${tool.name} is already in the comparison list.`,
      });
      return;
    }

    if (selectedTools.length >= 3) {
      toast({
        title: "Maximum reached",
        description: "You can compare up to 3 tools at a time.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTools.length > 0 && selectedTools[0].category !== tool.category) {
      toast({
        title: "Category mismatch",
        description: "You can only compare tools from the same category.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTools([...selectedTools, tool]);
    toast({
      title: "Added to comparison",
      description: `${tool.name} has been added to comparison.`,
    });
  };

  const removeFromCompare = (toolId: string) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
  };

  const clearComparison = () => {
    setSelectedTools([]);
  };

  return (
    <ComparisonContext.Provider
      value={ {
        selectedTools,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isComparing: selectedTools.length > 0,
      } }
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
