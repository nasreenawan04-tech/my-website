import { ToolSEOConfig } from '../types';

export const simpleInterestCalculatorSEO: ToolSEOConfig = {
  slug: 'simple-interest-calculator',
  category: 'finance',
  title: 'Simple Interest Calculator - Fast & Accurate | DapsiWow',
  metaDescription: 'Calculate simple interest on any principal amount instantly. Easy to use tool for loans and investments. Get accurate results with our free calculator.',
  keywords: [
    'simple interest calculator',
    'interest rate calculator',
    'principal interest calculator',
    'simple interest formula',
    'free interest calculator'
  ],
  schema: {
    name: 'Simple Interest Calculator',
    alternateName: ['Basic Interest Calculator'],
    description: 'Free online simple interest calculator for quick interest calculations on principal amounts for fixed periods.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Interest Calculator',
    featureList: [
      'Instant interest calculation',
      'Total amount calculation',
      'Daily, monthly, and yearly options',
      'No registration required',
      'Completely free'
    ]
  },
  howTo: {
    name: 'How to Calculate Simple Interest',
    description: 'Calculate simple interest in seconds using our free online tool.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: 'Enter Principal',
        text: 'Input the initial amount you are investing or borrowing.'
      },
      {
        position: 2,
        name: 'Enter Interest Rate',
        text: 'Input the annual interest rate percentage.'
      },
      {
        position: 3,
        name: 'Select Duration',
        text: 'Choose the time period in days, months, or years.'
      }
    ]
  },
  faq: [
    {
      question: 'What is the formula for simple interest?',
      answer: 'The formula for simple interest is I = P × R × T / 100, where I is Interest, P is Principal, R is Rate, and T is Time.'
    },
    {
      question: 'How does simple interest differ from compound interest?',
      answer: 'Simple interest is only calculated on the original amount, while compound interest is calculated on the original amount plus previous interest.'
    },
    {
      question: 'When should I use simple interest?',
      answer: 'Simple interest is commonly used for short-term loans, bonds, and some types of savings accounts.'
    }
  ],
  relatedTools: ['compound-interest-calculator', 'interest-calculator', 'loan-calculator'],
  content: {
    introduction: 'Quickly find out how much interest you will earn or owe with our simple interest calculator. Perfect for straightforward financial planning.',
    formula: 'Interest = Principal × Rate × Time.',
    comparison: 'Our tool is faster and more intuitive than manual calculations or complex spreadsheets.',
    examples: []
  }
};
