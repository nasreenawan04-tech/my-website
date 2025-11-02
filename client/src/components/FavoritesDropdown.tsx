import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useFavorites } from '@/hooks/use-favorites';

const FavoritesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { favorites } = useFavorites();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-neutral-600 hover:text-blue-500 transition-colors relative"
        data-testid="button-favorites"
        title="Favorites"
      >
        <i className="fas fa-star text-lg"></i>
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {favorites.length > 9 ? '9+' : favorites.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-neutral-800 flex items-center">
              <i className="fas fa-star text-yellow-500 mr-2"></i>
              Favorite Tools
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {favorites.length > 0 ? (
              favorites.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => setIsOpen(false)}
                  data-testid={`favorite-tool-${tool.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${tool.icon} text-white text-xs`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-800 text-sm truncate">
                        {tool.name}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500">
                <i className="fas fa-star text-3xl mb-3 text-neutral-300"></i>
                <p className="text-sm">No favorite tools yet</p>
                <p className="text-xs mt-1">Click the star icon on any tool to add it here</p>
              </div>
            )}
          </div>

          {favorites.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <Link
                href="/tools"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setIsOpen(false)}
                data-testid="link-view-all-tools"
              >
                View all tools →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesDropdown;