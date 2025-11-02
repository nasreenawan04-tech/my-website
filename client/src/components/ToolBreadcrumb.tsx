import { Link } from 'wouter';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface ToolBreadcrumbProps {
  category?: string;
  categoryName?: string;
  categoryHref?: string;
  toolName: string;
}

const ToolBreadcrumb = ({ category, categoryName, categoryHref, toolName }: ToolBreadcrumbProps) => {
  return (
    <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Breadcrumb data-testid="breadcrumb-navigation">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-testid="breadcrumb-home">
                  <Home className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only sm:inline">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {category && categoryName && categoryHref ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={categoryHref} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-testid={`breadcrumb-${category}`}>
                      {categoryName}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/all-tools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" data-testid="breadcrumb-all-tools">
                      All Tools
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="text-neutral-900 dark:text-neutral-100 font-medium" data-testid="breadcrumb-current-tool">
                {toolName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default ToolBreadcrumb;
