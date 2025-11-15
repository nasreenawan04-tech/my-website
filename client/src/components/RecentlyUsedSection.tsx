import { Link } from 'wouter';
import { useRecentTools } from '@/hooks/use-recent-tools';
import ToolCard from '@/components/ToolCard';

const RecentlyUsedSection = () => {
  const { recentTools } = useRecentTools();

  if (recentTools.length === 0) return null;

  const displayedTools = recentTools.slice(0, 6);

  return (
    <section className="py-16 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
            Recently Used Tools
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Quick access to tools you've used recently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedTools.map((recentTool) => (
            <ToolCard 
              key={`recent-${recentTool.tool.id}-${recentTool.timestamp}`}
              tool={recentTool.tool} 
            />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/tools"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            data-testid="link-browse-all-tools"
          >
            Browse All Tools
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentlyUsedSection;