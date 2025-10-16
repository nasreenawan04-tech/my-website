
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
      className="group relative bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${tool.name} - ${tool.description}`}
      data-testid={`card-tool-${tool.id}`}
    >
      {/* Card content - Mobile list layout */}
      <div className="relative p-4 flex items-start gap-3">
        {/* Left side - Content */}
        <div className="flex-1 min-w-0">
          {/* Tool name */}
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5 line-clamp-1 group-hover:text-primary transition-colors duration-200" data-testid={`text-tool-name-${tool.id}`}>
            {tool.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-1 leading-relaxed" data-testid={`text-tool-description-${tool.id}`}>
            {tool.description}
          </p>
          
          {/* Footer with category and badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 ${categoryColors[tool.category]} text-xs rounded-full font-medium`}
              data-testid={`text-tool-category-${tool.id}`}
            >
              {categories[tool.category]}
            </span>
            
            {tool.isPopular && (
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                <span>Popular</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Favorite button & Arrow */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <FavoriteButton tool={tool} size="sm" />
          <ArrowRight size={16} className="text-primary group-hover:translate-x-0.5 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
