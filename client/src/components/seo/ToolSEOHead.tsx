import { Helmet } from 'react-helmet-async';
import { ToolSEOConfig } from '@/config/seo/types';
import { CATEGORY_DEFAULTS, COMMON_META_TAGS, ORGANIZATION_SCHEMA } from '@/config/seo/categoryDefaults';
import { 
  generateWebApplicationSchema, 
  generateHowToSchema, 
  generateFAQSchema, 
  generateBreadcrumbSchema,
  generateQuestionSchema
} from '@/utils/schemaGenerators';

interface ToolSEOHeadProps {
  config: ToolSEOConfig;
}

export function ToolSEOHead({ config }: ToolSEOHeadProps) {
  const baseUrl = 'https://dapsiwow.com';
  const toolUrl = config.canonicalPath 
    ? `${baseUrl}${config.canonicalPath}` 
    : `${baseUrl}/${config.slug}`;
  const categoryDefaults = CATEGORY_DEFAULTS[config.category];
  
  const ogImage = `${baseUrl}/images/tools/${config.slug}-og.jpg`;
  const twitterImage = `${baseUrl}/images/tools/${config.slug}-twitter.jpg`;
  
  const questionSchema = config.slug.includes('calculator') ? generateQuestionSchema(config) : null;
  
  return (
    <Helmet>
      <title>{config.title}</title>
      <meta name="description" content={config.metaDescription} />
      <meta name="keywords" content={config.keywords.join(', ')} />
      <meta name="author" content={COMMON_META_TAGS.author} />
      <meta name="publisher" content={COMMON_META_TAGS.publisher} />
      <meta name="robots" content={COMMON_META_TAGS.robots} />
      <link rel="canonical" href={toolUrl} />
      
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={toolUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${config.schema.name} - DapsiWow Tool`} />
      <meta property="og:site_name" content="DapsiWow" />
      <meta property="og:locale" content="en_US" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@DapsiWow" />
      <meta name="twitter:creator" content="@DapsiWow" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.metaDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:image:alt" content={config.schema.name} />
      
      <meta name="pinterest-rich-pin" content="true" />
      <meta name="pinterest:description" content={config.metaDescription} />
      
      <meta name="distribution" content={COMMON_META_TAGS.distribution} />
      <meta name="language" content={COMMON_META_TAGS.language} />
      <meta name="rating" content={COMMON_META_TAGS.rating} />
      <meta name="copyright" content={COMMON_META_TAGS.copyright} />
      <meta name="theme-color" content={COMMON_META_TAGS.themeColor} />
      <meta name="application-name" content={COMMON_META_TAGS.applicationName} />
      
      <link rel="alternate" hrefLang="en" href={toolUrl} />
      <link rel="alternate" hrefLang="en-US" href={toolUrl} />
      <link rel="alternate" hrefLang="x-default" href={toolUrl} />
      
      <script type="application/ld+json">
        {JSON.stringify(generateWebApplicationSchema(config, categoryDefaults))}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(generateHowToSchema(config, toolUrl))}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(generateFAQSchema(config))}
      </script>
      
      {questionSchema && (
        <script type="application/ld+json">
          {JSON.stringify(questionSchema)}
        </script>
      )}
      
      <script type="application/ld+json">
        {JSON.stringify(generateBreadcrumbSchema(config, baseUrl))}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(ORGANIZATION_SCHEMA)}
      </script>
    </Helmet>
  );
}
