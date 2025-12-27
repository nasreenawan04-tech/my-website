import { ToolSEOConfig } from '../types';

export const homeLoanCalculatorSEO: ToolSEOConfig = {
  slug: 'home-loan-calculator',
  category: 'finance',
  title: 'Home Loan Calculator - Calculate Mortgage EMI | DapsiWow',
  metaDescription: 'Calculate home loan EMI and monthly mortgage payments. Free online calculator for home loans with amortization schedule. Simple, instant, accurate results.',
  keywords: [
    'home loan calculator',
    'home loan emi calculator',
    'mortgage emi calculator',
    'housing loan calculator',
    'home financing calculator',
    'property loan calculator'
  ],

  schema: {
    name: 'Home Loan Calculator - EMI and Mortgage Calculator',
    alternateName: ['Housing Loan Calculator', 'Home Finance Calculator', 'Property Loan Calculator'],
    description: 'Free home loan calculator to calculate EMI (Equated Monthly Installment), monthly mortgage payments, and complete amortization schedules for home financing.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Home Loan Calculator',
    featureList: [
      'Calculate monthly home loan EMI',
      'Complete amortization schedule',
      'Principal and interest breakdown',
      'Multiple loan term options',
      'Flexible interest rate input',
      'Down payment calculator',
      'Total interest calculation',
      'Print-friendly results',
      'Privacy-first calculations'
    ]
  },

  howTo: {
    name: 'How to Calculate Your Home Loan EMI',
    description: 'Learn how to calculate your monthly home loan EMI (Equated Monthly Installment) using our simple online calculator.',
    totalTime: 'PT3M',
    steps: [
      {
        position: 1,
        name: 'Enter Property Price',
        text: 'Input the total purchase price of the property or home you are planning to buy. Include the full market value.'
      },
      {
        position: 2,
        name: 'Set Down Payment and Loan Term',
        text: 'Enter your down payment amount (typically 10-30% of property price) and select your loan term in years. Home loans commonly range from 10 to 30 years.'
      },
      {
        position: 3,
        name: 'Enter Interest Rate',
        text: 'Input your annual interest rate (ROI) as provided by your lender. Click calculate to see your monthly EMI, total interest, and complete amortization schedule.'
      }
    ]
  },

  faq: [
    {
      question: 'What is EMI and how is it calculated?',
      answer: 'EMI (Equated Monthly Installment) is the fixed monthly payment amount for a home loan. It\'s calculated using the formula: EMI = P × [r(1+r)^n] / [(1+r)^n - 1], where P is the loan amount, r is the monthly interest rate, and n is the number of months. Our calculator applies this formula instantly to show your exact EMI.'
    },
    {
      question: 'What is the current home loan interest rate?',
      answer: 'Home loan interest rates vary by lender, location, and market conditions. As of 2025, home loan rates typically range from 6.5% to 8.5% depending on your credit profile, loan amount, and loan term. Government-backed and subsidized schemes may offer lower rates. Check with multiple lenders for the best rate.'
    },
    {
      question: 'How much of my income should go toward home loan EMI?',
      answer: 'Financial experts recommend keeping your home loan EMI below 30-40% of your gross monthly income. For example, if your monthly income is ₹100,000, your EMI should ideally be below ₹30,000-40,000. This ensures sufficient funds for other expenses, utilities, and savings.'
    },
    {
      question: 'Can I make extra EMI payments to reduce the home loan duration?',
      answer: 'Yes, most home loans allow extra or accelerated payments without penalties. Making extra payments reduces your principal balance, thereby reducing the total interest paid and shortening your loan term significantly. Use our calculator to see how extra payments impact your total loan cost.'
    },
    {
      question: 'What is the difference between home loan and mortgage?',
      answer: 'Home loan and mortgage are similar terms used interchangeably. A home loan is borrowed money for purchasing property, with EMI as the fixed monthly payment. A mortgage involves the property as security for the loan. Both involve monthly payments calculated using the same amortization formula.'
    }
  ],

  relatedTools: [
    'mortgage-calculator',
    'loan-calculator',
    'car-loan-calculator',
    'emi-calculator',
    'compound-interest-calculator'
  ],

  content: {
    introduction: 'Planning to buy a home? Our free home loan calculator helps you understand your monthly EMI (Equated Monthly Installment) and total financing costs. Whether you\'re a first-time homebuyer or refinancing, instantly calculate your monthly payment, view complete amortization schedules, and compare different loan terms and interest rates. Make informed decisions about your home purchase with accurate, instant calculations. No registration needed, completely free.',
    
    formula: 'Home loan EMI is calculated using: EMI = P × [r(1+r)^n] / [(1+r)^n - 1], where EMI is your monthly payment, P is the loan amount (property price minus down payment), r is your monthly interest rate (annual rate ÷ 12), and n is the total number of monthly payments (loan term in years × 12).',
    
    examples: [
      {
        title: '₹50 Lakhs Home Loan at 7% Interest for 20 Years',
        description: 'For a ₹50,00,000 home with ₹10,00,000 down payment (loan = ₹40,00,000) at 7% annual interest over 20 years: Monthly EMI = ₹33,193, Total amount paid = ₹79,66,320, Total interest = ₹39,66,320. This illustrates a typical middle-class home purchase scenario.'
      },
      {
        title: '₹100 Lakhs Home Loan at 6.5% Interest for 30 Years',
        description: 'For a ₹1,00,00,000 property with ₹30,00,000 down payment (loan = ₹70,00,000) at 6.5% annual interest over 30 years: Monthly EMI = ₹41,998, Total amount paid = ₹1,51,19,200, Total interest = ₹81,19,200. Longer terms mean lower payments but significantly higher total interest.'
      }
    ]
  }
};
