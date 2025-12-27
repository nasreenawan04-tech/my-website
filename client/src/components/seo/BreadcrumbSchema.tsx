import { Helmet } from 'react-helmet-async';
import { ToolSEOConfig } from '@/config/seo/types';
import { generateBreadcrumbSchema } from '@/utils/schemaGenerators';

interface BreadcrumbSchemaProps {
  config: ToolSEOConfig;
  baseUrl?: string;
}

/**
 * BreadcrumbSchema Component
 * 
 * Renders BreadcrumbList JSON-LD for the tool page
 */
export function BreadcrumbSchema({ config, baseUrl = 'https://dapsiwow.com' }: BreadcrumbSchemaProps) {
  const schema = generateBreadcrumbSchema(config, baseUrl);
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
