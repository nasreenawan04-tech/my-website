import { ToolSEOConfig } from '../types';

export const emiCalculatorSEO: ToolSEOConfig = {
  slug: 'emi-calculator',
  category: 'finance',
  title: 'EMI Calculator - Equated Monthly Installment | DapsiWow',
  metaDescription: 'Calculate your Equated Monthly Installment (EMI) for home, car, or personal loans instantly. View detailed breakdown and amortization schedule for free.',
  keywords: [
    'emi calculator',
    'loan emi calculator',
    'monthly installment calculator',
    'home loan emi',
    'car loan emi',
    'personal loan emi',
    'free emi calculator'
  ],
  schema: {
    name: 'EMI Calculator - Free Monthly Installment Estimator',
    alternateName: ['Loan EMI Calculator', 'Monthly Installment Calculator'],
    description: 'Free online EMI calculator to estimate your monthly loan payments, total interest, and complete repayment schedule for any type of loan.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'EMI Calculator',
    featureList: [
      'Instant EMI calculation',
      'Detailed monthly breakdown',
      'Total interest cost analysis',
      'Amortization schedule display',
      'Multiple currency support',
      'Responsive mobile design'
    ]
  },
  howTo: {
    name: 'How to Calculate EMI',
    description: 'Follow these 3 simple steps to calculate your loan EMI instantly.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: 'Enter Principal Amount',
        text: 'Input the total amount you wish to borrow from the bank or lender.'
      },
      {
        position: 2,
        name: 'Input Interest Rate',
        text: 'Enter the annual interest rate (APR) offered by your financial institution.'
      },
      {
        position: 3,
        name: 'Select Loan Tenure',
        text: 'Choose the duration of the loan in months or years to see your monthly EMI.'
      }
    ]
  },
  faq: [
    {
      question: 'What is EMI?',
      answer: 'EMI stands for Equated Monthly Installment. It is the fixed amount of money you pay back to a lender every month until the loan is fully repaid.'
    },
    {
      question: 'How is EMI calculated?',
      answer: 'EMI is calculated using the formula: E = P × r × (1 + r)^n / ((1 + r)^n - 1), where E is EMI, P is Principal, r is monthly interest rate, and n is number of months.'
    },
    {
      question: 'Can I change my EMI amount?',
      answer: 'You can lower your EMI by extending the loan tenure or making a larger down payment to reduce the principal amount.'
    }
  ],
  relatedTools: ['loan-calculator', 'mortgage-calculator', 'car-loan-calculator'],
  content: {
    introduction: 'Planning your finances is easier with our free EMI calculator. Get instant results for any type of loan including home, auto, or personal credit.',
    formula: 'The standard EMI formula uses principal, monthly interest rate, and tenure to determine the fixed monthly repayment amount.',
    comparison: 'Our tool offers a more detailed amortization schedule compared to basic bank calculators, helping you see exactly where your money goes.',
    examples: []
  }
};
