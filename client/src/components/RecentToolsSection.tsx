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
    <section className="py-8 sm:py-12 md:py-16 bg-neutral-50 dark:bg-neutral-900" data-testid="recent-tools-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-800 dark:text-neutral-100 leading-tight" data-testid="text-recent-tools-title">
                Recently Used Tools
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-0.5 sm:mt-1" data-testid="text-recent-tools-subtitle">
                Pick up where you left off
              </p>
            </div>
          </div>

          {/* Desktop View All Button */}
          {recentTools.length > 6 && (
            <Link 
              href="/recently-used-tools"
              className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg sm:rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 text-sm sm:text-base whitespace-nowrap flex-shrink-0"
              data-testid="link-view-all-recent"
            >
              View All Recent
            </Link>
          )}
        </div>

        {/* Tools Grid - Single column on mobile for list view */}
        <div className="grid grid-cols-1 gap-3">
          {displayTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Mobile View All Button */}
        {recentTools.length > 6 && (
          <div className="mt-6 sm:mt-8 text-center sm:hidden">
            <Link 
              href="/recently-used-tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700 w-full sm:w-auto justify-center"
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