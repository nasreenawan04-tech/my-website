import { useState, useEffect, useCallback } from 'react';
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
  renameFavoriteCategory as localRenameFavoriteCategory,
  deleteFavoriteCategory as localDeleteFavoriteCategory,
  updateFavoriteCategory as localUpdateFavoriteCategory,
  FavoriteTool,
  FavoriteCategory
} from '@/lib/userPreferences';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteTool[]>(getFavorites());
  const [categories, setCategories] = useState<FavoriteCategory[]>(getFavoriteCategories());
  const [isLoading, setIsLoading] = useState(false);

  // Load cloud data when user logs in
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getPreferencesFromCloud(user.uid).then(prefs => {
        if (prefs?.favorites && Array.isArray(prefs.favorites)) {
          setFavorites(prefs.favorites as FavoriteTool[]);
          localStorage.setItem('dapsiwow-favorites', JSON.stringify(prefs.favorites));
        }
        if (prefs?.categories && Array.isArray(prefs.categories)) {
          setCategories(prefs.categories as FavoriteCategory[]);
          localStorage.setItem('dapsiwow-favorite-categories', JSON.stringify(prefs.categories));
        }
        setIsLoading(false);
      }).catch(error => {
        console.error('Failed to load cloud preferences:', error);
        setIsLoading(false);
      });
    }
  }, [user?.uid]);

  // Sync favorites and categories to cloud whenever they change
  useEffect(() => {
    if (user && !isLoading) {
      // Debounce cloud sync to avoid too many writes
      const syncTimer = setTimeout(() => {
        syncPreferencesToCloud(user.uid, { favorites, categories }).catch(error => {
          console.error('Failed to sync favorites to cloud:', error);
        });
      }, 500);
      
      return () => clearTimeout(syncTimer);
    }
  }, [favorites, categories, user?.uid, isLoading]);

  const toggleFavorite = useCallback((tool: Tool, categoryId?: string) => {
    const isFav = favorites.some(t => t.id === tool.id);
    if (isFav) {
      setFavorites(prev => prev.filter(t => t.id !== tool.id));
      localRemoveFromFavorites(tool.id);
    } else {
      const newFavorite: FavoriteTool = { ...tool, categoryId };
      setFavorites(prev => [...prev, newFavorite]);
      localAddToFavorites(tool, categoryId);
    }
  }, [favorites]);

  const checkIsFavorite = useCallback((toolId: string): boolean => {
    return favorites.some(tool => tool.id === toolId);
  }, [favorites]);

  const addFavoriteCategory = useCallback((name: string) => {
    const category = localAddCategory(name);
    setCategories(prev => [...prev, category]);
    return category;
  }, []);

  const renameFavoriteCategory = useCallback((id: string, name: string) => {
    localRenameFavoriteCategory(id, name);
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name } : cat));
  }, []);

  const deleteFavoriteCategory = useCallback((id: string) => {
    localDeleteFavoriteCategory(id);
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setFavorites(prev => prev.map(fav => fav.categoryId === id ? { ...fav, categoryId: undefined } : fav));
  }, []);

  const updateFavoriteCategory = useCallback((toolId: string, categoryId?: string) => {
    localUpdateFavoriteCategory(toolId, categoryId);
    setFavorites(prev => prev.map(fav => fav.id === toolId ? { ...fav, categoryId } : fav));
  }, []);

  return {
    favorites,
    categories,
    isLoading,
    toggleFavorite,
    isFavorite: checkIsFavorite,
    addToFavorites: localAddToFavorites,
    removeFromFavorites: localRemoveFromFavorites,
    addFavoriteCategory,
    renameFavoriteCategory,
    deleteFavoriteCategory,
    updateFavoriteCategory
  };
};