import { ToolSEOConfig, CategoryDefaults } from '@/config/seo/types';

/**
 * Generates an AggregateOffer schema for pricing information
 * Used for finance tools and tools with multiple pricing tiers
 */
export function generateAggregateOfferSchema() {
  return {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: '0',
    highPrice: '0',
    offerCount: '1',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    ]
  };
}

/**
 * Generates a WebApplication schema with optional AggregateOffer for pricing
 * Includes application details, ratings, and features
 */
export function generateWebApplicationSchema(config: ToolSEOConfig, categoryDefaults: CategoryDefaults) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.schema.name,
    alternateName: config.schema.alternateName || [],
    description: config.schema.description,
    url: `https://dapsiwow.com/${config.slug}`,
    // SEO PERFECT FIX: Adding specialized software attributes for Rich Snippets
    // This helps search engines understand the tool's inputs/outputs
    applicationCategory: config.schema.applicationCategory || "FinancialApplication",
    countriesSupported: "US",
    contentRating: "General",
    
    // Add interaction data for richer Search Console performance
    interactionStatistic: {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/WriteAction",
      "userInteractionCount": "10000"
    },
    
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
    },
    
    // Adding SoftwareApplication specific fields for better SEO
    storageRequirements: 'None',
    memoryRequirements: 'None'
  };

  return baseSchema;
}

/**
 * Generates a Question schema for calculator rich snippets
 * Used to provide structured data for calculator tools in search results
 * Generates multiple Question schemas if FAQs are available
 */
export function generateQuestionSchemas(config: ToolSEOConfig) {
  if (!config.faq || config.faq.length === 0) return [];
  
  return config.faq.map(item => ({
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }));
}

/**
 * Generates a HowTo schema for step-by-step instructions
 * Helps search engines understand tutorial and instructional content
 */
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

/**
 * Generates a FAQPage schema with multiple Question entries
 * Enables rich snippets for FAQ content in search results
 */
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

/**
 * Generates a BreadcrumbList schema for navigation hierarchy
 * Improves SERP display and user navigation understanding
 */
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
