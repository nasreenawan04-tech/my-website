
import { useLocation } from 'wouter';
import { type Tool, categories } from '@/data/tools';
import FavoriteButton from '@/components/FavoriteButton';
import { useRecentTools } from '@/hooks/use-recent-tools';
import { useFavorites } from '@/hooks/use-favorites';
import { ArrowRight, TrendingUp, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ToolCardProps {
  tool: Tool;
  onClick?: () => void;
}

const categoryColors = {
  finance: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  text: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  health: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
};

const categoryGradients = {
  finance: 'from-blue-500 to-indigo-600',
  text: 'from-yellow-500 to-orange-600',
  health: 'from-pink-500 to-rose-600'
};

const ToolCard = ({ tool, onClick }: ToolCardProps) => {
  const [, setLocation] = useLocation();
  const { addRecent } = useRecentTools();
  const { categories: favCategories, updateFavoriteCategory, isFavorite } = useFavorites();
  const isToolFavorite = isFavorite(tool.id);

  const handleClick = () => {
    const targetPath = tool.href || `/tools/${tool.id}`;
    addRecent(tool);
    setLocation(targetPath);
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div 
      className="group relative bg-white dark:bg-neutral-800 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={`Open ${tool.name} tool. ${tool.description}`}
      data-testid={`card-tool-${tool.id}`}
    >
      {/* Gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r ${categoryGradients[tool.category]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Card content */}
      <div className="relative p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
        {/* Header with favorite button */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-tight" data-testid={`text-tool-name-${tool.id}`}>
              {tool.name}
            </h3>
          </div>
          
          {/* Favorite button - always visible on mobile, hover on desktop */}
          <div className="flex flex-shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 -mt-0.5">
            {isToolFavorite && favCategories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-neutral-500 hover:text-primary"
                    aria-label="Move favorite to category"
                    title="Move to category"
                  >
                    <FolderPlus size={16} aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    updateFavoriteCategory(tool.id, undefined);
                  }}>
                    Uncategorized
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {favCategories.map((cat) => (
                    <DropdownMenuItem 
                      key={cat.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateFavoriteCategory(tool.id, cat.id);
                      }}
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <FavoriteButton tool={tool} size="sm" />
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-4 line-clamp-2 leading-relaxed flex-1" data-testid={`text-tool-description-${tool.id}`}>
          {tool.description}
        </p>
        
        {/* Footer with category and badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 md:gap-3 mt-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span 
              className={`inline-flex items-center px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 ${categoryColors[tool.category]} text-xs sm:text-sm rounded-full font-bold whitespace-nowrap shadow-sm`}
              data-testid={`text-tool-category-${tool.id}`}
            >
              {categories[tool.category]}
            </span>
            
            {tool.isPopular && (
              <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 rounded-full font-bold whitespace-nowrap shadow-sm">
                <TrendingUp size={10} className="hidden sm:block sm:w-3 sm:h-3" />
                <span>Popular</span>
              </div>
            )}
          </div>
          
          {/* Action indicator - always visible on mobile, hover on desktop */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs sm:text-sm font-medium hidden md:inline">Open</span>
            <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ToolCard;
