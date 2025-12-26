import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { syncPreferencesToCloud, getPreferencesFromCloud } from '@/lib/cloudSync';

export interface PinnedTool {
  id: string;
  name: string;
  url: string;
}

export function usePinnedTools() {
  const { user } = useAuth();
  const [pinnedTools, setPinnedTools] = useState<PinnedTool[]>([]);
  const storageKey = 'pinned-tools';

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPinnedTools(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse pinned tools', e);
      }
    }

    if (user) {
      getPreferencesFromCloud(user.uid).then(prefs => {
        if (prefs?.pinnedTools) {
          setPinnedTools(prefs.pinnedTools);
        }
      });
    }
  }, [user]);

  const togglePin = useCallback((tool: PinnedTool) => {
    setPinnedTools(prev => {
      const isPinned = prev.some(t => t.id === tool.id);
      let updated;
      if (isPinned) {
        updated = prev.filter(t => t.id !== tool.id);
      } else {
        // Limit to 5 pinned tools
        updated = [...prev, tool].slice(-5);
      }
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      if (user) {
        syncPreferencesToCloud(user.uid, { pinnedTools: updated });
      }
      return updated;
    });
  }, [user]);

  const isPinned = useCallback((toolId: string) => {
    return pinnedTools.some(t => t.id === toolId);
  }, [pinnedTools]);

  return {
    pinnedTools,
    togglePin,
    isPinned,
  };
}
