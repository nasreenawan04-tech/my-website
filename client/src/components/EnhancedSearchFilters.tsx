import { useState } from 'react';
import { tools, categories } from '@/data/tools';
import { Filter, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  category: string;
  sortBy: 'name' | 'category' | 'popularity';
  showPopularOnly: boolean;
  showFavoritesOnly: boolean;
}

const EnhancedSearchFilters = ({ onFiltersChange, className = '' }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    sortBy: 'name',
    showPopularOnly: false,
    showFavoritesOnly: false,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      category: 'all',
      sortBy: 'name',
      showPopularOnly: false,
      showFavoritesOnly: false,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const categoryStats = Object.keys(categories).reduce((acc, key) => {
    acc[key] = tools.filter(tool => tool.category === key).length;
    return acc;
  }, {} as Record<string, number>);

  const hasActiveFilters = filters.category !== 'all' || 
                          filters.sortBy !== 'name' || 
                          filters.showPopularOnly || 
                          filters.showFavoritesOnly;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
          data-testid="button-toggle-filters"
        >
          <div className="flex items-center space-x-2">
            <Filter className="text-blue-600" size={16} />
            <span className="font-medium text-neutral-800">
              Advanced Filters
            </span>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="text-neutral-400" size={16} /> : <ChevronDown className="text-neutral-400" size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="select-category-filter"
            >
              <option value="all">All Categories ({tools.length})</option>
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({categoryStats[key]})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="select-sort-filter"
            >
              <option value="name">Name (A-Z)</option>
              <option value="category">Category</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Quick Filters
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showPopularOnly}
                  onChange={(e) => handleFilterChange({ showPopularOnly: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  data-testid="checkbox-popular-only"
                />
                <span className="ml-2 text-sm text-neutral-700">
                  Show popular tools only
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showFavoritesOnly}
                  onChange={(e) => handleFilterChange({ showFavoritesOnly: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  data-testid="checkbox-favorites-only"
                />
                <span className="ml-2 text-sm text-neutral-700">
                  Show favorite tools only
                </span>
              </label>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="button-reset-filters"
              >
                <RotateCcw className="mr-2" size={16} />
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchFilters;