import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { X, Pin } from 'lucide-react';
import { usePinnedTools } from '@/hooks/use-pinned-tools';
import { cn } from '@/lib/utils';

export function QuickAccessBar() {
  const { pinnedTools, togglePin } = usePinnedTools();

  if (pinnedTools.length === 0) return null;

  return (
    <div className="w-full bg-white/50 backdrop-blur-md border-b border-slate-200 py-1.5 overflow-x-auto scrollbar-none dark:bg-slate-900/50 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mr-2">
          <Pin className="h-3.5 w-3.5 rotate-45" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Quick Access</span>
        </div>
        
        <div className="flex items-center gap-2">
          {pinnedTools.map((tool) => (
            <div key={tool.id} className="group relative flex items-center">
              <Link href={tool.url}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-3 text-xs font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                >
                  {tool.name}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  togglePin(tool);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
