import { useMemo } from 'react';
import { Link } from 'wouter';
import { Tool, tools } from '@/data/tools';
import FavoriteButton from '@/components/FavoriteButton';

interface ToolRecommendationsProps {
  currentTool: Tool;
  maxRecommendations?: number;
}

const ToolRecommendations = ({ currentTool, maxRecommendations = 4 }: ToolRecommendationsProps) => {
  const recommendations = useMemo(() => {
    // Get tools from the same category (excluding current tool)
    const sameCategory = tools
      .filter(tool => tool.category === currentTool.category && tool.id !== currentTool.id)
      .slice(0, maxRecommendations);

    // If we need more recommendations, get popular tools from other categories
    if (sameCategory.length < maxRecommendations) {
      const otherPopular = tools
        .filter(tool => 
          tool.isPopular && 
          tool.category !== currentTool.category && 
          tool.id !== currentTool.id
        )
        .slice(0, maxRecommendations - sameCategory.length);
      
      return [...sameCategory, ...otherPopular];
    }

    return sameCategory;
  }, [currentTool, maxRecommendations]);

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
        You might also like
      </h3>
      
      <div className="grid gap-3">
        {recommendations.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className={`${tool.icon} text-white text-sm`}></i>
            </div>
            
            <Link 
              href={tool.href}
              className="flex-1 min-w-0 hover:text-blue-600 transition-colors"
              data-testid={`recommendation-${tool.id}`}
            >
              <div className="font-medium text-neutral-800 text-sm truncate">
                {tool.name}
              </div>
              <div className="text-xs text-neutral-500 truncate">
                {tool.description}
              </div>
            </Link>
            
            <FavoriteButton tool={tool} size="sm" />
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/tools"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          data-testid="link-browse-all-tools"
        >
          Browse all {tools.length}+ tools →
        </Link>
      </div>
    </div>
  );
};

export default ToolRecommendations;