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
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3">
        <Breadcrumb data-testid="breadcrumb-navigation">
          <BreadcrumbList className="flex-wrap gap-1 sm:gap-1.5">
            <BreadcrumbItem className="flex items-center">
              <BreadcrumbLink asChild>
                <Link 
                  href="/" 
                  data-testid="breadcrumb-home"
                  className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm hover-elevate active-elevate-2 px-1 py-0.5 rounded-sm"
                >
                  <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="hidden xs:inline">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-xs sm:text-sm mx-0 sm:mx-0.5" />
            <BreadcrumbItem className="flex items-center min-w-0">
              <BreadcrumbLink asChild>
                <Link 
                  href={categoryPath} 
                  data-testid="breadcrumb-category"
                  className="text-xs sm:text-sm truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-none hover-elevate active-elevate-2 px-1 py-0.5 rounded-sm block"
                >
                  {category}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-xs sm:text-sm mx-0 sm:mx-0.5" />
            <BreadcrumbItem className="min-w-0 flex-1 flex items-center">
              <BreadcrumbPage 
                data-testid="breadcrumb-current"
                className="text-xs sm:text-sm truncate block max-w-full px-1 py-0.5"
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
