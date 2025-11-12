import { ToolSEOConfig, CategoryDefaults } from '@/config/seo/types';

export function generateWebApplicationSchema(config: ToolSEOConfig, categoryDefaults: CategoryDefaults) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.schema.name,
    alternateName: config.schema.alternateName || [],
    description: config.schema.description,
    url: `https://dapsiwow.com/${config.slug}`,
    applicationCategory: config.schema.applicationCategory || categoryDefaults.schemaDefaults.applicationCategory,
    applicationSubCategory: config.schema.applicationSubCategory,
    operatingSystem: categoryDefaults.schemaDefaults.operatingSystem,
    browserRequirements: categoryDefaults.schemaDefaults.browserRequirements,
    softwareVersion: '2.0.0',
    datePublished: '2024-01-15',
    dateModified: new Date().toISOString().split('T')[0],
    
    offers: {
      '@type': 'Offer',
      price: categoryDefaults.schemaDefaults.offers.price,
      priceCurrency: categoryDefaults.schemaDefaults.offers.priceCurrency,
      availability: 'https://schema.org/InStock',
      validFrom: '2024-01-15'
    },
    
    featureList: config.schema.featureList,
    
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2547',
      bestRating: '5',
      worstRating: '1'
    },
    
    creator: {
      '@type': 'Organization',
      name: 'DapsiWow',
      url: 'https://dapsiwow.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dapsiwow.com/logo.svg',
        width: 600,
        height: 60
      }
    },
    
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    
    audience: {
      '@type': 'Audience',
      audienceType: 'General Public, Professionals, Students'
    }
  };
}

export function generateHowToSchema(config: ToolSEOConfig, toolUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.howTo.name,
    description: config.howTo.description,
    totalTime: config.howTo.totalTime,
    
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    
    tool: [
      {
        '@type': 'HowToTool',
        name: config.schema.name
      }
    ],
    
    step: config.howTo.steps.map(step => ({
      '@type': 'HowToStep',
      position: step.position,
      name: step.name,
      text: step.text,
      url: `${toolUrl}#step${step.position}`
    }))
  };
}

export function generateFAQSchema(config: ToolSEOConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

export function generateBreadcrumbSchema(config: ToolSEOConfig, baseUrl: string) {
  const categoryMap: Record<string, string> = {
    finance: 'Finance Tools',
    health: 'Health Tools',
    text: 'Text Tools'
  };
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryMap[config.category],
        item: `${baseUrl}/${config.category}-tools`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.schema.name,
        item: `${baseUrl}/${config.slug}`
      }
    ]
  };
}
