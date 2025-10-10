
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { useRecentTools } from '@/hooks/use-recent-tools';
import { Button } from '@/components/ui/button';

const RecentlyUsed = () => {
  const { recentTools, clearRecent } = useRecentTools();

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <>
      <Helmet>
        <title>Recently Used Tools - DapsiWow</title>
        <meta name="description" content="Quick access to your recently used tools. Track your calculation history and easily return to tools you've used before." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen flex flex-col" data-testid="page-recently-used">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-16 lg:py-20 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Recently Used Tools
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                  Quick access to tools you've used recently. Pick up where you left off.
                </p>
              </div>
            </div>
          </section>

          {/* Recently Used Tools Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {recentTools.length > 0 ? (
                <>
                  {/* Header with Clear Button */}
                  <div className="flex justify-between items-center mb-8">
                    <p className="text-neutral-600">
                      Showing {recentTools.length} recently used {recentTools.length === 1 ? 'tool' : 'tools'}
                    </p>
                    <Button
                      variant="outline"
                      onClick={clearRecent}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Clear History
                    </Button>
                  </div>

                  {/* Tools Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentTools.map((recentTool) => (
                      <div key={`${recentTool.tool.id}-${recentTool.timestamp}`} className="relative">
                        <ToolCard tool={recentTool.tool} />
                        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeAgo(recentTool.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-neutral-100 rounded-full mb-6">
                    <Clock className="w-10 h-10 text-neutral-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-4">No Recent Tools</h3>
                  <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                    You haven't used any tools yet. Start exploring our collection of 150+ professional tools.
                  </p>
                  <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Browse All Tools
                    <ArrowRight size={18} />
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Browse All Tools CTA */}
          {recentTools.length > 0 && (
            <section className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                  Looking for more tools?
                </h2>
                <p className="text-neutral-600 mb-6">
                  Explore our complete collection of 150+ professional tools
                </p>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Browse All Tools
                  <ArrowRight size={18} />
                </Link>
              </div>
            </section>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default RecentlyUsed;
