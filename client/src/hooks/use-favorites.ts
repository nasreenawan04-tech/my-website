import { useState, useEffect } from 'react';
import { Tool } from '@/data/tools';
import { 
  getFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  isFavorite 
} from '@/lib/userPreferences';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Tool[]>(getFavorites());

  useEffect(() => {
    const handleFavoritesChange = (event: CustomEvent) => {
      setFavorites(event.detail.favorites);
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange as EventListener);
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChange as EventListener);
    };
  }, []);

  const toggleFavorite = (tool: Tool) => {
    if (isFavorite(tool.id)) {
      removeFromFavorites(tool.id);
    } else {
      addToFavorites(tool);
    }
  };

  const checkIsFavorite = (toolId: string): boolean => {
    return favorites.some(tool => tool.id === toolId);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite: checkIsFavorite,
    addToFavorites,
    removeFromFavorites
  };
};