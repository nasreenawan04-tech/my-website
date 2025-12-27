import { ToolSEOConfig } from '../types';

export const compoundInterestCalculatorSEO: ToolSEOConfig = {
  slug: 'compound-interest-calculator',
  category: 'finance',
  title: 'Compound Interest Calculator - Grow Your Savings | DapsiWow',
  metaDescription: 'Visualize how your money grows with our compound interest calculator. Calculate future value with different compounding frequencies. Free and easy.',
  keywords: [
    'compound interest calculator',
    'investment calculator',
    'savings growth calculator',
    'compounding interest',
    'future value calculator'
  ],
  schema: {
    name: 'Compound Interest Calculator',
    alternateName: ['Investment Growth Calculator', 'Savings Compounder'],
    description: 'Free online compound interest calculator with visual charts to track your investment growth over time.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Interest Calculator',
    featureList: [
      'Multiple compounding frequencies',
      'Visual growth charts',
      'Monthly contribution analysis',
      'Inflation adjustment options',
      'Detailed growth table'
    ]
  },
  howTo: {
    name: 'How to Use the Compound Interest Calculator',
    description: 'Project your savings growth in 3 simple steps.',
    totalTime: 'PT2M',
    steps: [
      {
        position: 1,
        name: 'Enter Initial Deposit',
        text: 'Enter the starting amount of your investment or savings.'
      },
      {
        position: 2,
        name: 'Set Contributions and Rates',
        text: 'Enter any monthly additions and the expected annual interest rate.'
      },
      {
        position: 3,
        name: 'Select Compounding Frequency',
        text: 'Choose how often the interest is added back (monthly, quarterly, etc.) and see the results.'
      }
    ]
  },
  faq: [
    {
      question: 'What is compound interest?',
      answer: 'Compound interest is interest calculated on the initial principal and also on the accumulated interest of previous periods.'
    },
    {
      question: 'How often should I compound interest?',
      answer: 'More frequent compounding (like daily or monthly) results in higher total interest earned over time compared to annual compounding.'
    },
    {
      question: 'What is the "Rule of 72"?',
      answer: 'The Rule of 72 is a simple way to estimate how many years it will take for your money to double, calculated by dividing 72 by your annual interest rate.'
    }
  ],
  relatedTools: ['simple-interest-calculator', 'interest-calculator', 'roi-calculator'],
  content: {
    introduction: 'Compound interest is the eighth wonder of the world. Use our calculator to see how small regular investments can grow into significant wealth over time.',
    formula: 'A = P(1 + r/n)^(nt).',
    comparison: 'Our calculator offers a more user-friendly interface and detailed charting compared to standard financial tables.',
    examples: []
  }
};
