import { Link } from 'wouter';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ToolBreadcrumbsProps {
  currentLabel: string;
  category?: string;
  categoryPath?: string;
}

export default function ToolBreadcrumbs({ 
  currentLabel, 
  category = 'Finance Tools',
  categoryPath = '/tools/finance'
}: ToolBreadcrumbsProps) {
  return (
    <div className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
        <Breadcrumb data-testid="breadcrumb-navigation">
          <BreadcrumbList className="flex-wrap gap-1 sm:gap-1.5">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  href="/" 
                  data-testid="breadcrumb-home"
                  className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm"
                >
                  <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-xs sm:text-sm" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  href={categoryPath} 
                  data-testid="breadcrumb-category"
                  className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] md:max-w-none"
                >
                  {category}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-xs sm:text-sm" />
            <BreadcrumbItem className="min-w-0 flex-1">
              <BreadcrumbPage 
                data-testid="breadcrumb-current"
                className="text-xs sm:text-sm truncate block"
              >
                {currentLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
