import { Link } from 'wouter';
import { useRecentTools } from '@/hooks/use-recent-tools';
import ToolCard from './ToolCard';
import { Clock } from 'lucide-react';

const RecentToolsSection = () => {
  const { recentTools } = useRecentTools();

  // Don't render section if there are no recent tools
  if (recentTools.length === 0) {
    return null;
  }

  // Show up to 6 recent tools
  const displayTools = recentTools.slice(0, 6).map(rt => rt.tool);

  return (
    <section className="py-16 bg-neutral-50 dark:bg-neutral-900" data-testid="recent-tools-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 dark:text-neutral-100" data-testid="text-recent-tools-title">
                Recently Used Tools
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1" data-testid="text-recent-tools-subtitle">
                Pick up where you left off
              </p>
            </div>
          </div>
          
          {recentTools.length > 6 && (
            <Link 
              href="/recently-used-tools"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
              data-testid="link-view-all-recent"
            >
              View All Recent
            </Link>
          )}
        </div>
        
        {/* Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="grid-recent-tools">
          {displayTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Mobile View All Button */}
        {recentTools.length > 6 && (
          <div className="mt-8 text-center md:hidden">
            <Link 
              href="/recently-used-tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
              data-testid="link-view-all-recent-mobile"
            >
              View All Recent
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentToolsSection;
