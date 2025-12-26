import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { syncPreferencesToCloud, getPreferencesFromCloud } from '@/lib/cloudSync';

export interface Preset {
  id: string;
  name: string;
  values: Record<string, any>;
  createdAt: number;
}

export function usePresets(toolId: string) {
  const { user } = useAuth();
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

    if (user) {
      getPreferencesFromCloud(user.uid).then(prefs => {
        if (prefs?.presets && prefs.presets[toolId]) {
          setPresets(prefs.presets[toolId]);
        }
      });
    }
  }, [storageKey, user, toolId]);

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
    
    if (user) {
      getPreferencesFromCloud(user.uid).then(prefs => {
        const allPresets = prefs?.presets || {};
        allPresets[toolId] = updated;
        syncPreferencesToCloud(user.uid, { presets: allPresets });
      });
    }
    return newPreset;
  }, [presets, storageKey, user, toolId]);

  const deletePreset = useCallback((id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (user) {
      getPreferencesFromCloud(user.uid).then(prefs => {
        const allPresets = prefs?.presets || {};
        allPresets[toolId] = updated;
        syncPreferencesToCloud(user.uid, { presets: allPresets });
      });
    }
  }, [presets, storageKey, user, toolId]);

  return {
    presets,
    savePreset,
    deletePreset,
  };
}
