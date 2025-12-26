import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools as allTools } from '@/data/tools';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';

interface Collection {
  id: number;
  shareId: string;
  name: string;
  toolIds: string[];
}

const CollectionPreview = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCollection = async () => {
      if (!shareId) return;

      try {
        const response = await fetch(`/api/collections/${shareId}`);
        if (!response.ok) {
          throw new Error('Collection not found');
        }
        const data = await response.json();
        setCollection(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load collection');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [shareId]);

  const handleShare = async () => {
    if (!shareId) return;

    const shareUrl = `${window.location.origin}/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link with others to show them your tools collection.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy the link. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  if (error || !collection) {
    return (
      <>
        <Helmet>
          <title>Collection Not Found | DapsiWow</title>
          <meta name="description" content="The collection you're looking for could not be found." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>

        <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950" data-testid="page-collection-preview-error">
          <Header />

          <main className="flex-1 flex items-center justify-center py-12">
            <div className="text-center px-4 max-w-md">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Collection Not Found
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                {error || 'The collection you are looking for does not exist or has been removed.'}
              </p>
              <Link href="/" asChild>
                <Button className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </main>

          <Footer />
        </div>
      </>
    );
  }

  // Get tools in this collection
  const collectionTools = collection.toolIds
    .map((id) => allTools.find((t) => t.id === id))
    .filter((tool): tool is typeof allTools[0] => tool !== undefined);

  return (
    <>
      <Helmet>
        <title>{collection.name} | DapsiWow</title>
        <meta name="description" content={`Explore this collection of ${collectionTools.length} tools from DapsiWow. Free online tools for finance, text processing, and health calculations.`} />
        <meta property="og:title" content={`${collection.name} | DapsiWow`} />
        <meta property="og:description" content={`Check out this collection of ${collectionTools.length} tools shared on DapsiWow.`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://dapsiwow.com/share/${shareId}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950" data-testid="page-collection-preview">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-600 text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent" />

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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6 sm:mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-collection-name">
                    {collection.name}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-purple-100 mt-2">
                    A curated collection of useful tools
                  </p>
                </div>

                <Button
                  variant="secondary"
                  className="gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
                  onClick={handleShare}
                  data-testid="button-share-collection"
                >
                  <Share2 size={18} />
                  Share Collection
                </Button>
              </div>

              <div className="flex items-center gap-4 mt-6 sm:mt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold mb-1" data-testid="text-tools-count">
                    {collectionTools.length}
                  </div>
                  <div className="text-purple-100 text-xs sm:text-sm" data-testid="text-tools-count-label">
                    Tools in Collection
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Content */}
          <section className="py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {collectionTools.length > 0 ? (
                <div className="space-y-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                    Collection Tools
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {collectionTools.map((tool) => (
                      <div key={tool.id} className="relative group">
                        <ToolCard tool={tool} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-3">
                    No Tools in Collection
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                    This collection doesn't contain any tools yet.
                  </p>
                  <Link href="/tools" asChild>
                    <Button className="gap-2">
                      Browse All Tools
                    </Button>
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

export default CollectionPreview;
