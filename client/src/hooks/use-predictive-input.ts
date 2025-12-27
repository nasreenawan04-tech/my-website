import { useState, useEffect } from 'react';
import { PersistentStorage } from '@/lib/utils/persistent-storage';

/**
 * Hook to provide smart predictive defaults based on user history.
 * If a user frequently uses certain values (e.g., 5% interest rate), 
 * it will suggest these as starting points.
 */
export function usePredictiveInput<T extends Record<string, any>>(
  toolId: string,
  currentValues: T,
  defaultValues: T
) {
  const [predictedValues, setPredictedValues] = useState<T>(defaultValues);
  const storageKey = `predictive_defaults_${toolId}`;

  // Load predictions on mount
  useEffect(() => {
    const saved = PersistentStorage.getItem<T>(storageKey as any);
    if (saved) {
      setPredictedValues(saved);
    }
  }, [toolId, storageKey]);

  // Update logic: track frequency of values (simplified for this MVP)
  // In a full implementation, we'd use a more sophisticated frequency map
  const updatePredictions = (finalValues: T) => {
    PersistentStorage.setItem(storageKey as any, finalValues);
    setPredictedValues(finalValues);
  };

  return { predictedValues, updatePredictions };
}
