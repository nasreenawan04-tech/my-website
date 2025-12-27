import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { syncPreferencesToCloud, getPreferencesFromCloud } from '@/lib/cloudSync';
import { PersistentStorage, STORAGE_KEYS } from '@/lib/utils/precision-engine';

export interface PinnedTool {
  id: string;
  name: string;
  url: string;
}

const MAX_PINNED = 5;

export function usePinnedTools() {
  const { user } = useAuth();
  const [pinnedTools, setPinnedTools] = useState<PinnedTool[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load local and cloud pinned tools on mount and when user changes
  useEffect(() => {
    // Load from local storage first
    const saved = PersistentStorage.load<PinnedTool[]>(STORAGE_KEYS.PINNED_TOOLS, []);
    setPinnedTools(saved);

    // Load from cloud if user is logged in
    if (user) {
      setIsLoading(true);
      getPreferencesFromCloud(user.uid).then(prefs => {
        if (prefs?.pinnedTools) {
          setPinnedTools(prefs.pinnedTools);
          PersistentStorage.save(STORAGE_KEYS.PINNED_TOOLS, prefs.pinnedTools);
        }
        setIsLoading(false);
      }).catch(error => {
        console.error('Failed to load cloud pinned tools:', error);
        setIsLoading(false);
      });
    }
  }, [user?.uid]);

  // Sync pinned tools to cloud with debounce
  useEffect(() => {
    if (user && !isLoading) {
      const syncTimer = setTimeout(() => {
        syncPreferencesToCloud(user.uid, { pinnedTools }).catch(error => {
          console.error('Failed to sync pinned tools to cloud:', error);
        });
      }, 500);

      return () => clearTimeout(syncTimer);
    }
  }, [pinnedTools, user?.uid, isLoading]);

  const togglePin = useCallback((tool: PinnedTool) => {
    setPinnedTools(prev => {
      const isPinned = prev.some(t => t.id === tool.id);
      let updated;
      if (isPinned) {
        updated = prev.filter(t => t.id !== tool.id);
      } else {
        // Limit to MAX_PINNED tools, keep the most recent
        updated = [...prev, tool].slice(-MAX_PINNED);
      }
      PersistentStorage.save(STORAGE_KEYS.PINNED_TOOLS, updated);
      return updated;
    });
  }, []);

  const isPinned = useCallback((toolId: string) => {
    return pinnedTools.some(t => t.id === toolId);
  }, [pinnedTools]);

  return {
    pinnedTools,
    isLoading,
    togglePin,
    isPinned,
  };
}
