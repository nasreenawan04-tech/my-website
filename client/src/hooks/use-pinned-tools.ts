import { useState, useEffect, useCallback } from 'react';

export interface PinnedTool {
  id: string;
  name: string;
  url: string;
}

export function usePinnedTools() {
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
  }, []);

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
      return updated;
    });
  }, []);

  const isPinned = useCallback((toolId: string) => {
    return pinnedTools.some(t => t.id === toolId);
  }, [pinnedTools]);

  return {
    pinnedTools,
    togglePin,
    isPinned,
  };
}
