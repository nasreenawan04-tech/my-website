import { useState } from 'react';
import { tools, categories } from '@/data/tools';

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
    <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
          data-testid="button-toggle-filters"
        >
          <div className="flex items-center space-x-2">
            <i className="fas fa-filter text-blue-600 dark:text-blue-400"></i>
            <span className="font-medium text-neutral-800 dark:text-neutral-100">
              Advanced Filters
            </span>
            {hasActiveFilters && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-neutral-400`}></i>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="select-sort-filter"
            >
              <option value="name">Name (A-Z)</option>
              <option value="category">Category</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
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
                <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
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
                <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                  Show favorite tools only
                </span>
              </label>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-gray-200 dark:border-neutral-600">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                data-testid="button-reset-filters"
              >
                <i className="fas fa-undo mr-2"></i>
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