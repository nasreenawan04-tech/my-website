import { Tool } from '@/data/tools';
import { PersistentStorage, STORAGE_KEYS } from './utils/precision-engine';

// Use the registry keys from PrecisionMath where possible for consistency
const FAVORITES_KEY = STORAGE_KEYS.FAVORITES;
const FAVORITE_CATEGORIES_KEY = STORAGE_KEYS.FAVORITE_CATEGORIES;
const RECENT_TOOLS_KEY = 'dapsiwow-recent'; // Not in registry yet
const USER_PREFERENCES_KEY = STORAGE_KEYS.USER_PREFS;

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
  return PersistentStorage.load<FavoriteCategory[]>(FAVORITE_CATEGORIES_KEY, []);
};

export const addFavoriteCategory = (name: string): FavoriteCategory => {
  const categories = getFavoriteCategories();
  const newCategory = { id: Math.random().toString(36).substr(2, 9), name };
  const updated = [...categories, newCategory];
  PersistentStorage.save(FAVORITE_CATEGORIES_KEY, updated);
  window.dispatchEvent(new CustomEvent('favoritesCategoriesChanged', { detail: { categories: updated } }));
  return newCategory;
};

export const renameFavoriteCategory = (id: string, newName: string): void => {
  const categories = getFavoriteCategories();
  const updated = categories.map(cat => cat.id === id ? { ...cat, name: newName } : cat);
  PersistentStorage.save(FAVORITE_CATEGORIES_KEY, updated);
  window.dispatchEvent(new CustomEvent('favoritesCategoriesChanged', { detail: { categories: updated } }));
};

export const deleteFavoriteCategory = (id: string): void => {
  const categories = getFavoriteCategories();
  const updated = categories.filter(cat => cat.id !== id);
  PersistentStorage.save(FAVORITE_CATEGORIES_KEY, updated);
  
  // Also remove category from tools
  const favorites = getFavorites();
  const updatedFavorites = favorites.map(fav => fav.categoryId === id ? { ...fav, categoryId: undefined } : fav);
  PersistentStorage.save(FAVORITES_KEY, updatedFavorites);
  
  window.dispatchEvent(new CustomEvent('favoritesCategoriesChanged', { detail: { categories: updated } }));
  window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: { favorites: updatedFavorites } }));
};

// Favorites Management
export const getFavorites = (): FavoriteTool[] => {
  return PersistentStorage.load<FavoriteTool[]>(FAVORITES_KEY, []);
};

export const addToFavorites = (tool: Tool, categoryId?: string): void => {
  try {
    const favorites = getFavorites();
    if (!favorites.some(fav => fav.id === tool.id)) {
      const updated = [...favorites, { ...tool, categoryId }];
      PersistentStorage.save(FAVORITES_KEY, updated);
      
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
    PersistentStorage.save(FAVORITES_KEY, updated);
    window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: { favorites: updated } }));
  } catch (error) {
    console.error('Failed to update favorite category:', error);
  }
};

export const removeFromFavorites = (toolId: string): void => {
  try {
    const favorites = getFavorites();
    const updated = favorites.filter(tool => tool.id !== toolId);
    PersistentStorage.save(FAVORITES_KEY, updated);
    
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
    PersistentStorage.remove(FAVORITES_KEY);
    window.dispatchEvent(new CustomEvent('favoritesChanged', { 
      detail: { favorites: [], action: 'clear' } 
    }));
  } catch (error) {
    console.error('Failed to clear favorites:', error);
  }
};

// Recent Tools Management
export const getRecentTools = (): RecentTool[] => {
  const recent = PersistentStorage.load<RecentTool[]>(RECENT_TOOLS_KEY, []);
  
  // Sort by timestamp (most recent first) and limit to prevent memory issues
  return recent
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20);
};

export const addToRecentTools = (tool: Tool): void => {
  try {
    const recent = getRecentTools();
    
    // Remove existing entry for this tool
    const filtered = recent.filter(item => item.tool.id !== tool.id);
    
    // Add new entry at the beginning
    const updated = [{ tool, timestamp: Date.now() }, ...filtered].slice(0, 15);
    
    PersistentStorage.save(RECENT_TOOLS_KEY, updated);
    
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
    PersistentStorage.remove(RECENT_TOOLS_KEY);
    window.dispatchEvent(new CustomEvent('recentToolsChanged', { 
      detail: { recentTools: [], action: 'clear' } 
    }));
  } catch (error) {
    console.error('Failed to clear recent tools:', error);
  }
};

// User Preferences Management
export const getUserPreferences = (): UserPreferences => {
  return PersistentStorage.load<UserPreferences>(USER_PREFERENCES_KEY, {
    showRecentTools: true,
    maxRecentTools: 10
  });
};

export const updateUserPreferences = (preferences: Partial<UserPreferences>): void => {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    PersistentStorage.save(USER_PREFERENCES_KEY, updated);
    
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