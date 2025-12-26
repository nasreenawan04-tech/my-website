import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { syncPreferencesToCloud, getPreferencesFromCloud } from '@/lib/cloudSync';
import { Tool } from '@/data/tools';
import { 
  getFavorites, 
  addToFavorites as localAddToFavorites, 
  removeFromFavorites as localRemoveFromFavorites, 
  isFavorite,
  getFavoriteCategories,
  addFavoriteCategory as localAddCategory,
  FavoriteTool,
  FavoriteCategory
} from '@/lib/userPreferences';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTool[]>(getFavorites());
  const [categories, setCategories] = useState<FavoriteCategory[]>(getFavoriteCategories());

  useEffect(() => {
    if (user) {
      getPreferencesFromCloud(user.uid).then(prefs => {
        if (prefs) {
          if (prefs.favorites) {
            // Merge logic or overwrite
            setFavorites(prefs.favorites);
          }
          if (prefs.categories) {
            setCategories(prefs.categories);
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      syncPreferencesToCloud(user.uid, { favorites, categories });
    }
  }, [favorites, categories, user]);

  const toggleFavorite = (tool: Tool, categoryId?: string) => {
    if (checkIsFavorite(tool.id)) {
      localRemoveFromFavorites(tool.id);
      setFavorites(prev => prev.filter(t => t.id !== tool.id));
    } else {
      localAddToFavorites(tool, categoryId);
      const newFavorite: FavoriteTool = { ...tool, categoryId };
      setFavorites(prev => [...prev, newFavorite]);
    }
  };

  const checkIsFavorite = (toolId: string): boolean => {
    return favorites.some(tool => tool.id === toolId);
  };

  return {
    favorites,
    categories,
    toggleFavorite,
    isFavorite: checkIsFavorite,
    addToFavorites: localAddToFavorites,
    removeFromFavorites: localRemoveFromFavorites,
    addFavoriteCategory: localAddCategory,
    renameFavoriteCategory: (id: string, name: string) => {},
    deleteFavoriteCategory: (id: string) => {},
    updateFavoriteCategory: (id: string, updates: Partial<FavoriteCategory>) => {}
  };
};