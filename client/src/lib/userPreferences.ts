import { Tool } from '@/data/tools';

// Local storage keys
const FAVORITES_KEY = 'dapsiwow-favorites';
const FAVORITE_CATEGORIES_KEY = 'dapsiwow-favorite-categories';
const RECENT_TOOLS_KEY = 'dapsiwow-recent';
const USER_PREFERENCES_KEY = 'dapsiwow-preferences';

export interface FavoriteTool extends Tool {
  categoryId?: string;
}

export interface FavoriteCategory {
  id: string;
  name: string;
}

export interface RecentTool {
  tool: Tool;
  timestamp: number;
}

export interface UserPreferences {
  favoriteCalculationPresets?: Record<string, any>;
  preferredTheme?: 'light' | 'dark' | 'system';
  showRecentTools?: boolean;
  maxRecentTools?: number;
}

// Category Management
export const getFavoriteCategories = (): FavoriteCategory[] => {
  try {
    const stored = localStorage.getItem(FAVORITE_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addFavoriteCategory = (name: string): FavoriteCategory => {
  const categories = getFavoriteCategories();
  const newCategory = { id: Math.random().toString(36).substr(2, 9), name };
  const updated = [...categories, newCategory];
  localStorage.setItem(FAVORITE_CATEGORIES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('favoritesCategoriesChanged', { detail: { categories: updated } }));
  return newCategory;
};

export const renameFavoriteCategory = (id: string, newName: string): void => {
  const categories = getFavoriteCategories();
  const updated = categories.map(cat => cat.id === id ? { ...cat, name: newName } : cat);
  localStorage.setItem(FAVORITE_CATEGORIES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('favoritesCategoriesChanged', { detail: { categories: updated } }));
};

export const deleteFavoriteCategory = (id: string): void => {
  const categories = getFavoriteCategories();
  const updated = categories.filter(cat => cat.id !== id);
  localStorage.setItem(FAVORITE_CATEGORIES_KEY, JSON.stringify(updated));
  
  // Also remove category from tools
  const favorites = getFavorites();
  const updatedFavorites = favorites.map(fav => fav.categoryId === id ? { ...fav, categoryId: undefined } : fav);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
  
  window.dispatchEvent(new CustomEvent('favoritesCategoriesChanged', { detail: { categories: updated } }));
  window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: { favorites: updatedFavorites } }));
};

// Favorites Management
export const getFavorites = (): FavoriteTool[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addToFavorites = (tool: Tool, categoryId?: string): void => {
  try {
    const favorites = getFavorites();
    if (!favorites.some(fav => fav.id === tool.id)) {
      const updated = [...favorites, { ...tool, categoryId }];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('favoritesChanged', { 
        detail: { favorites: updated, action: 'add', tool } 
      }));
    }
  } catch (error) {
    console.error('Failed to add to favorites:', error);
  }
};

export const updateFavoriteCategory = (toolId: string, categoryId?: string): void => {
  try {
    const favorites = getFavorites();
    const updated = favorites.map(fav => fav.id === toolId ? { ...fav, categoryId } : fav);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: { favorites: updated } }));
  } catch (error) {
    console.error('Failed to update favorite category:', error);
  }
};

export const removeFromFavorites = (toolId: string): void => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(tool => tool.id !== toolId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('favoritesChanged', { 
      detail: { favorites: updated, action: 'remove', toolId } 
    }));
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
  }
};

export const isFavorite = (toolId: string): boolean => {
  return getFavorites().some(tool => tool.id === toolId);
};

export const clearAllFavorites = (): void => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    window.dispatchEvent(new CustomEvent('favoritesChanged', { 
      detail: { favorites: [], action: 'clear' } 
    }));
  } catch (error) {
    console.error('Failed to clear favorites:', error);
  }
};

// Recent Tools Management
export const getRecentTools = (): RecentTool[] => {
  try {
    const stored = localStorage.getItem(RECENT_TOOLS_KEY);
    const recent = stored ? JSON.parse(stored) : [];
    
    // Sort by timestamp (most recent first) and limit to prevent memory issues
    return recent
      .sort((a: RecentTool, b: RecentTool) => b.timestamp - a.timestamp)
      .slice(0, 20);
  } catch {
    return [];
  }
};

export const addToRecentTools = (tool: Tool): void => {
  try {
    const recent = getRecentTools();
    
    // Remove existing entry for this tool
    const filtered = recent.filter(item => item.tool.id !== tool.id);
    
    // Add new entry at the beginning
    const updated = [{ tool, timestamp: Date.now() }, ...filtered].slice(0, 15);
    
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated));
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('recentToolsChanged', { 
      detail: { recentTools: updated, tool } 
    }));
  } catch (error) {
    console.error('Failed to add to recent tools:', error);
  }
};

export const clearRecentTools = (): void => {
  try {
    localStorage.removeItem(RECENT_TOOLS_KEY);
    window.dispatchEvent(new CustomEvent('recentToolsChanged', { 
      detail: { recentTools: [], action: 'clear' } 
    }));
  } catch (error) {
    console.error('Failed to clear recent tools:', error);
  }
};

// User Preferences Management
export const getUserPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(USER_PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {
      showRecentTools: true,
      maxRecentTools: 10
    };
  } catch {
    return {
      showRecentTools: true,
      maxRecentTools: 10
    };
  }
};

export const updateUserPreferences = (preferences: Partial<UserPreferences>): void => {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updated));
    
    window.dispatchEvent(new CustomEvent('userPreferencesChanged', { 
      detail: { preferences: updated } 
    }));
  } catch (error) {
    console.error('Failed to update user preferences:', error);
  }
};

// Export utilities for sharing calculation results
export const generateShareableLink = (toolId: string, params: Record<string, any>): string => {
  const baseUrl = window.location.origin;
  const toolUrl = `${baseUrl}/tools/${toolId}`;
  
  // Encode parameters for URL
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString() ? `${toolUrl}?${searchParams.toString()}` : toolUrl;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};