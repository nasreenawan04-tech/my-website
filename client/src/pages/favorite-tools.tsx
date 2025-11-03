import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { useFavorites } from '@/hooks/use-favorites';
import { Star, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { clearAllFavorites } from '@/lib/userPreferences';
import { useToast } from '@/hooks/use-toast';

const FavoriteTools = () => {
  const { favorites } = useFavorites();
  const { toast } = useToast();

  const handleClearFavorites = () => {
    if (confirm('Are you sure you want to remove all favorite tools?')) {
      clearAllFavorites();
      toast({
        title: "Favorites cleared",
        description: "All favorite tools have been removed.",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Favorite Tools - Your Saved Tools | DapsiWow</title>
        <meta name="description" content="Access your favorite tools quickly. Save and manage the tools you use most frequently." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://dapsiwow.com/favorite-tools" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950" data-testid="page-favorite-tools">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-pink-600 text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back Button */}
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
                data-testid="link-back-home"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Back to Home</span>
              </Link>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                  <Star className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-current" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-page-title">
                    Favorite Tools
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-yellow-100 mt-2">
                    Quick access to your saved tools
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold mb-1" data-testid="text-favorite-tools-count">{favorites.length}</div>
                  <div className="text-yellow-100 text-xs sm:text-sm" data-testid="text-favorite-tools-count-label">Favorite Tools</div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Content */}
          <section className="py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {favorites.length > 0 ? (
                <>
                  {/* Clear Favorites Button */}
                  <div className="flex justify-between items-center mb-8">
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Showing {favorites.length} favorite {favorites.length === 1 ? 'tool' : 'tools'}
                    </p>
                    <Button
                      onClick={handleClearFavorites}
                      variant="outline"
                      className="gap-2"
                      data-testid="button-clear-favorites"
                    >
                      <Trash2 size={16} />
                      Clear All
                    </Button>
                  </div>

                  {/* Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="grid-favorite-tools">
                    {favorites.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full mb-6">
                    <Star className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-3" data-testid="text-empty-state-title">
                    No Favorite Tools Yet
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                    Click the star icon on any tool card to add it to your favorites for quick access later.
                  </p>
                  <Link 
                    href="/tools"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                    data-testid="link-browse-tools"
                  >
                    Browse All Tools
                  </Link>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FavoriteTools;
