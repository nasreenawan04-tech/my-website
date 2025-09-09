import { useState, useEffect } from 'react';
import { Tool } from '@/data/tools';
import { 
  getRecentTools, 
  addToRecentTools, 
  clearRecentTools,
  RecentTool 
} from '@/lib/userPreferences';

export const useRecentTools = () => {
  const [recentTools, setRecentTools] = useState<RecentTool[]>(getRecentTools());

  useEffect(() => {
    const handleRecentToolsChange = (event: CustomEvent) => {
      setRecentTools(event.detail.recentTools);
    };

    window.addEventListener('recentToolsChanged', handleRecentToolsChange as EventListener);
    return () => {
      window.removeEventListener('recentToolsChanged', handleRecentToolsChange as EventListener);
    };
  }, []);

  const addRecent = (tool: Tool) => {
    addToRecentTools(tool);
  };

  const clearRecent = () => {
    clearRecentTools();
  };

  return {
    recentTools,
    addRecent,
    clearRecent
  };
};