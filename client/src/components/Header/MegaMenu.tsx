import { Link } from 'wouter';
import { tools, categories } from '@/data/tools';
import { BarChart3, PieChart, FileText, Grid3x3 } from 'lucide-react';

const categoryIcons = {
  finance: BarChart3,
  text: FileText,
  health: PieChart,
};

export const MegaMenu = ({ onClose }: { onClose: () => void }) => {
  const getToolsByCategory = (category: keyof typeof categories) => {
    return tools.filter(tool => tool.category === category);
  };

  const popularTools = tools.filter(tool => tool.isPopular).slice(0, 8);
  const financeCount = getToolsByCategory('finance').length;
  const textCount = getToolsByCategory('text').length;
  const healthCount = getToolsByCategory('health').length;

  const categoryList = [
    { key: 'finance' as const, count: financeCount },
    { key: 'text' as const, count: textCount },
    { key: 'health' as const, count: healthCount },
  ];

  return (
    <div 
      className="absolute left-0 right-0 top-full mt-0 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 shadow-xl z-40"
      onMouseLeave={onClose}
      data-testid="mega-menu"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Left Column - Categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {categoryList.map(cat => {
                const Icon = categoryIcons[cat.key];
                const label = categories[cat.key];
                return (
                  <Link
                    key={cat.key}
                    href={`/${cat.key}-tools`}
                    onClick={onClose}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <span>{label}</span>
                    <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                      {cat.count}
                    </span>
                  </Link>
                );
              })}
              <Link
                href="/all-tools"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors mt-2 pt-3 border-t border-gray-200 dark:border-gray-700"
              >
                <Grid3x3 className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span>All Tools</span>
              </Link>
            </div>
          </div>

          {/* Middle Columns - Popular Tools */}
          <div className="col-span-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Popular Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              {popularTools.map(tool => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  onClick={onClose}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {tool.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Access</h3>
            <Link
              href="/favorite-tools"
              onClick={onClose}
              className="block p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors"
            >
              <div className="font-medium text-sm text-blue-900 dark:text-blue-100">Your Favorites</div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">Access saved tools</div>
            </Link>
            <Link
              href="/recently-used-tools"
              onClick={onClose}
              className="block p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
            >
              <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">Recently Used</div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">Your calculation history</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
