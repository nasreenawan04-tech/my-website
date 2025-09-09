import { Link } from 'wouter';
import { useFavorites } from '@/hooks/use-favorites';
import ToolCard from '@/components/ToolCard';

const FavoritesSection = () => {
  const { favorites } = useFavorites();

  if (favorites.length === 0) return null;

  const displayedFavorites = favorites.slice(0, 6);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center justify-center">
            <i className="fas fa-star text-yellow-500 mr-3"></i>
            Your Favorite Tools
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Quick access to the tools you use most frequently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedFavorites.map((tool) => (
            <ToolCard key={`favorite-${tool.id}`} tool={tool} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/tools"
            className="inline-flex items-center px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200"
            data-testid="link-view-all-favorites"
          >
            Manage Favorites
            <i className="fas fa-cog ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FavoritesSection;