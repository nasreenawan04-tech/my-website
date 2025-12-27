import { ToolSEOConfig } from "../types";

export const interestCalculatorSEO: ToolSEOConfig = {
  slug: 'interest-calculator',
  category: 'finance',
  title: "Simple & Compound Interest Calculator | DapsiWow",
  metaDescription: "Calculate simple and compound interest easily. Understand how your savings grow over time with our accurate interest rate tool. Free and instant.",
  keywords: ["interest calculator", "simple interest", "compound interest", "savings calculator", "investment growth"],
  schema: {
    name: 'Simple & Compound Interest Calculator',
    alternateName: ['Interest Rate Calculator', 'Savings Growth Calculator'],
    description: 'Free online tool to calculate simple and compound interest. See how your investments grow over time with detailed projections.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Interest Calculator',
    featureList: [
      'Simple interest calculation',
      'Compound interest calculation',
      'Investment growth projections',
      'Flexible compounding frequencies',
      'Visual charts and graphs'
    ]
  },
  faq: [
    {
      question: "What is the difference between simple and compound interest?",
      answer: "Simple interest is calculated only on the principal amount, while compound interest is calculated on the principal plus any accumulated interest."
    },
    {
      question: "How often can interest be compounded?",
      answer: "Interest can be compounded daily, weekly, monthly, quarterly, semi-annually, or annually. More frequent compounding leads to higher growth."
    },
    {
      question: "Why is compound interest important?",
      answer: "Compound interest allows your savings to grow exponentially over time, as you earn interest on your previous interest."
    }
  ],
  howTo: {
    name: "How to Calculate Interest",
    description: "Calculate your potential interest earnings in three easy steps.",
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: "Enter Principal",
        text: "Input the initial amount of money deposited or borrowed."
      },
      {
        position: 2,
        name: "Set Interest Rate",
        text: "Enter the annual interest rate percentage."
      },
      {
        position: 3,
        name: "Define Time Period",
        text: "Specify how long the money will be invested or borrowed."
      }
    ]
  },
  relatedTools: ['loan-calculator', 'compound-interest-calculator', 'simple-interest-calculator'],
  content: {
    introduction: 'Understanding interest is key to growing your wealth. Our calculator makes it simple to compare different interest scenarios and see your future savings.',
    formula: 'Simple Interest = P × r × t. Compound Interest = P × (1 + r/n)^(nt) - P.',
    comparison: 'Our tool provides clear, visual comparisons between simple and compound growth, unlike basic static tables.',
    examples: []
  }
};
