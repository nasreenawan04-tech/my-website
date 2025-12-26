import { useState, useEffect, useCallback } from 'react';

export interface Preset {
  id: string;
  name: string;
  values: Record<string, any>;
  createdAt: number;
}

export function usePresets(toolId: string) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const storageKey = `tool-presets-${toolId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse presets', e);
      }
    }
  }, [storageKey]);

  const savePreset = useCallback((name: string, values: Record<string, any>) => {
    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name,
      values,
      createdAt: Date.now(),
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    return newPreset;
  }, [presets, storageKey]);

  const deletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [presets, storageKey]);

  return {
    presets,
    savePreset,
    deletePreset,
  };
}
