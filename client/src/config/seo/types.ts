export interface ToolSEOConfig {
  slug: string;
  category: 'finance' | 'health' | 'text';
  canonicalPath?: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  
  schema: {
    name: string;
    alternateName?: string[];
    description: string;
    applicationCategory: string;
    applicationSubCategory?: string;
    featureList: string[];
  };
  
  howTo: {
    name: string;
    description: string;
    totalTime: string;
    steps: Array<{
      position: number;
      name: string;
      text: string;
    }>;
  };
  
  faq: Array<{
    question: string;
    answer: string;
  }>;
  
  relatedTools: string[];
  
  content: {
    introduction: string;
    formula?: string;
    comparison?: string;
    examples: Array<{
      title: string;
      description: string;
    }>;
  };
}

export interface CategoryDefaults {
  titlePattern: string;
  metaDescriptionPattern: string;
  schemaDefaults: {
    applicationCategory: string;
    operatingSystem: string;
    browserRequirements: string;
    offers: {
      price: string;
      priceCurrency: string;
    };
  };
}
