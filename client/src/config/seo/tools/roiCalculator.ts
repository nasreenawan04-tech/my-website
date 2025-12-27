import { ToolSEOConfig } from '../types';

export const roiCalculatorSEO: ToolSEOConfig = {
  slug: 'roi-calculator',
  category: 'finance',
  title: 'ROI Calculator - Return on Investment | DapsiWow',
  metaDescription: 'Calculate your Return on Investment (ROI) quickly and easily. Determine profit and efficiency of your investments with our free online tool.',
  keywords: [
    'roi calculator',
    'return on investment calculator',
    'investment profit calculator',
    'business roi calculator',
    'marketing roi calculator'
  ],
  schema: {
    name: 'ROI Calculator',
    alternateName: ['Investment Performance Calculator'],
    description: 'Free online ROI calculator to measure the profitability and efficiency of any investment.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Business Tool',
    featureList: [
      'Instant ROI percentage',
      'Total profit calculation',
      'Investment gain analysis',
      'Annualized ROI options',
      'Clean, simple interface'
    ]
  },
  howTo: {
    name: 'How to Calculate ROI',
    description: 'Measure your investment success in 3 easy steps.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: 'Enter Amount Invested',
        text: 'Input the total initial cost of the investment.'
      },
      {
        position: 2,
        name: 'Enter Amount Returned',
        text: 'Input the final value or total return received from the investment.'
      },
      {
        position: 3,
        name: 'View ROI Result',
        text: 'The calculator will instantly show your ROI percentage and total gain or loss.'
      }
    ]
  },
  faq: [
    {
      question: 'What is ROI?',
      answer: 'ROI (Return on Investment) is a performance measure used to evaluate the efficiency of an investment or compare the efficiency of several different investments.'
    },
    {
      question: 'How do you calculate ROI?',
      answer: 'The ROI formula is: ROI = (Net Profit / Cost of Investment) × 100.'
    },
    {
      question: 'What is a good ROI?',
      answer: 'A "good" ROI depends on the type of investment and risk level. Generally, an ROI above 7-10% is considered decent for stock market investments.'
    }
  ],
  relatedTools: ['compound-interest-calculator', 'loan-calculator', 'business-loan-calculator'],
  content: {
    introduction: 'Make smarter investment decisions by knowing your ROI. Our calculator helps you quickly assess the performance of any business or personal venture.',
    formula: 'ROI = ((Final Value - Initial Value) / Initial Value) × 100.',
    comparison: 'Our ROI tool is designed for clarity and speed, removing the need for manual calculations or complex spreadsheets.',
    examples: []
  }
};
