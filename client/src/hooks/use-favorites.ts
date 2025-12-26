import { useState, useEffect } from 'react';
import { Tool } from '@/data/tools';
import { 
  getFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite,
  getFavoriteCategories,
  addFavoriteCategory,
  renameFavoriteCategory,
  deleteFavoriteCategory,
  updateFavoriteCategory,
  FavoriteTool,
  FavoriteCategory
} from '@/lib/userPreferences';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteTool[]>(getFavorites());
  const [categories, setCategories] = useState<FavoriteCategory[]>(getFavoriteCategories());

  useEffect(() => {
    const handleFavoritesChange = (event: CustomEvent) => {
      setFavorites(event.detail.favorites);
    };

    const handleCategoriesChange = (event: CustomEvent) => {
      setCategories(event.detail.categories);
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange as EventListener);
    window.addEventListener('favoritesCategoriesChanged', handleCategoriesChange as EventListener);
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChange as EventListener);
      window.removeEventListener('favoritesCategoriesChanged', handleCategoriesChange as EventListener);
    };
  }, []);

  const toggleFavorite = (tool: Tool, categoryId?: string) => {
    if (isFavorite(tool.id)) {
      removeFromFavorites(tool.id);
    } else {
      addToFavorites(tool, categoryId);
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
    addToFavorites,
    removeFromFavorites,
    addFavoriteCategory,
    renameFavoriteCategory,
    deleteFavoriteCategory,
    updateFavoriteCategory
  };
};