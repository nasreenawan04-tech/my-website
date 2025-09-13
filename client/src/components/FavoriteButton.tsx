import { useFavorites } from '@/hooks/use-favorites';
import { Tool } from '@/data/tools';
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  tool: Tool;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton = ({ 
  tool, 
  className = '', 
  showLabel = false, 
  size = 'md' 
}: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isToolFavorite = isFavorite(tool.id);

  const sizeClasses = {
    sm: 'p-1 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(tool);
      }}
      className={`
        ${sizeClasses[size]} 
        ${isToolFavorite 
          ? 'text-yellow-500 hover:text-yellow-600' 
          : 'text-neutral-400 hover:text-yellow-500'
        } 
        transition-colors duration-200 
        ${className}
      `}
      title={isToolFavorite ? 'Remove from favorites' : 'Add to favorites'}
      data-testid={`button-favorite-${tool.id}`}
    >
      <Star 
        size={iconSizes[size]} 
        className={isToolFavorite ? 'fill-current' : ''}
      />
      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {isToolFavorite ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;