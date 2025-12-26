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
  const [isLoading, setIsLoading] = useState(false);
  const storageKey = `tool-presets-${toolId}`;

  // Load local and cloud presets on mount and when user changes
  useEffect(() => {
    // Load from local storage first
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse presets', e);
      }
    }

    // Load from cloud if user is logged in
    if (user) {
      setIsLoading(true);
      getPreferencesFromCloud(user.uid).then(prefs => {
        if (prefs?.presets && prefs.presets[toolId]) {
          setPresets(prefs.presets[toolId]);
          localStorage.setItem(storageKey, JSON.stringify(prefs.presets[toolId]));
        }
        setIsLoading(false);
      }).catch(error => {
        console.error('Failed to load cloud presets:', error);
        setIsLoading(false);
      });
    }
  }, [toolId, user?.uid, storageKey]);

  // Sync presets to cloud with debounce
  useEffect(() => {
    if (user && !isLoading && presets.length >= 0) {
      const syncTimer = setTimeout(() => {
        getPreferencesFromCloud(user.uid).then(prefs => {
          const allPresets = prefs?.presets || {};
          allPresets[toolId] = presets;
          syncPreferencesToCloud(user.uid, { presets: allPresets }).catch(error => {
            console.error('Failed to sync presets to cloud:', error);
          });
        }).catch(error => {
          console.error('Failed to get current cloud preferences:', error);
        });
      }, 500);

      return () => clearTimeout(syncTimer);
    }
  }, [presets, toolId, user?.uid, isLoading]);

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

  const updatePreset = useCallback((id: string, name: string, values: Record<string, any>) => {
    const updated = presets.map(p => p.id === id ? { ...p, name, values } : p);
    setPresets(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [presets, storageKey]);

  return {
    presets,
    isLoading,
    savePreset,
    deletePreset,
    updatePreset,
  };
}
