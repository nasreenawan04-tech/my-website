
import { useLocation } from 'wouter';
import { type Tool, categories } from '@/data/tools';
import FavoriteButton from '@/components/FavoriteButton';
import { useRecentTools } from '@/hooks/use-recent-tools';
import { ArrowRight, TrendingUp } from 'lucide-react';

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
      className="group relative bg-white dark:bg-neutral-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${tool.name} - ${tool.description}`}
      data-testid={`card-tool-${tool.id}`}
    >
      {/* Gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryGradients[tool.category]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Card content */}
      <div className="relative p-4 sm:p-5 md:p-6">
        {/* Header with favorite button */}
        <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200" data-testid={`text-tool-name-${tool.id}`}>
              {tool.name}
            </h3>
          </div>
          
          {/* Favorite button - always visible on mobile, hover on desktop */}
          <div className="flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <FavoriteButton tool={tool} size="sm" />
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 sm:line-clamp-3" data-testid={`text-tool-description-${tool.id}`}>
          {tool.description}
        </p>
        
        {/* Footer with category and badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span 
              className={`inline-flex items-center px-2.5 sm:px-3 py-1 ${categoryColors[tool.category]} text-xs sm:text-sm rounded-full font-medium whitespace-nowrap`}
              data-testid={`text-tool-category-${tool.id}`}
            >
              {categories[tool.category]}
            </span>
            
            {tool.isPopular && (
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 sm:px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                <TrendingUp size={12} className="hidden xs:block" />
                <span>Popular</span>
              </div>
            )}
          </div>
          
          {/* Action indicator */}
          <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Open</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ToolCard;
