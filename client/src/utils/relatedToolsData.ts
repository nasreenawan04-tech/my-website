export interface RelatedToolData {
  slug: string;
  name: string;
  description: string;
  category: string;
}

export const RELATED_TOOLS_MAP: Record<string, RelatedToolData> = {
  'mortgage-calculator': {
    slug: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    description: 'Calculate monthly mortgage payments including taxes, insurance, and PMI',
    category: 'finance'
  },
  'car-loan-calculator': {
    slug: 'car-loan-calculator',
    name: 'Car Loan Calculator',
    description: 'Calculate auto loan payments and total interest for vehicle financing',
    category: 'finance'
  },
  'personal-loan-calculator': {
    slug: 'personal-loan-calculator',
    name: 'Personal Loan Calculator',
    description: 'Estimate payments for unsecured personal loans and debt consolidation',
    category: 'finance'
  },
  'debt-payoff-calculator': {
    slug: 'debt-payoff-calculator',
    name: 'Debt Payoff Calculator',
    description: 'Create a debt payoff strategy with snowball or avalanche methods',
    category: 'finance'
  },
  'compound-interest-calculator': {
    slug: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    description: 'See how your money grows with compound interest over time',
    category: 'finance'
  },
  'loan-calculator': {
    slug: 'loan-calculator',
    name: 'Loan Calculator',
    description: 'Calculate monthly payments and total interest for any type of loan',
    category: 'finance'
  },
  'bmi-calculator': {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    description: 'Calculate your Body Mass Index and get health insights',
    category: 'health'
  },
  'calorie-calculator': {
    slug: 'calorie-calculator',
    name: 'Calorie Calculator',
    description: 'Calculate daily caloric needs based on your activity level',
    category: 'health'
  },
  'tdee-calculator': {
    slug: 'tdee-calculator',
    name: 'TDEE Calculator',
    description: 'Calculate total daily energy expenditure for weight management',
    category: 'health'
  },
  'body-fat-calculator': {
    slug: 'body-fat-calculator',
    name: 'Body Fat Calculator',
    description: 'Estimate body fat percentage using multiple measurement methods',
    category: 'health'
  },
  'word-counter': {
    slug: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs in your text',
    category: 'text'
  },
  'case-converter': {
    slug: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text to uppercase, lowercase, title case, and more',
    category: 'text'
  },
  'character-counter': {
    slug: 'character-counter',
    name: 'Character Counter',
    description: 'Count characters with or without spaces for social media and writing',
    category: 'text'
  }
};

export function getRelatedToolsData(slugs: string[]): RelatedToolData[] {
  return slugs
    .map(slug => RELATED_TOOLS_MAP[slug])
    .filter((tool): tool is RelatedToolData => tool !== undefined);
}
