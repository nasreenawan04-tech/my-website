import { ToolSEOConfig } from '../types';

export const businessLoanCalculatorSEO: ToolSEOConfig = {
  slug: 'business-loan-calculator',
  category: 'finance',
  title: 'Business Loan Calculator - Calculate Monthly Payments | DapsiWow',
  metaDescription: 'Calculate business loan payments, repayment terms, and total interest. Free online calculator for small business loans. Instant results, no fees. Get started!',
  keywords: [
    'business loan calculator',
    'small business loan calculator',
    'business loan payment calculator',
    'business financing calculator',
    'term loan calculator',
    'business credit calculator'
  ],

  schema: {
    name: 'Business Loan Calculator - Monthly Payment Calculator',
    alternateName: ['Small Business Loan Calculator', 'Business Financing Calculator', 'Term Loan Calculator'],
    description: 'Free business loan calculator to calculate monthly payments, repayment schedules, and total interest for small business loans and financing options.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Business Loan Calculator',
    featureList: [
      'Calculate monthly business loan payments',
      'Complete repayment schedule generation',
      'Total interest and principal breakdown',
      'Multiple loan term options',
      'Customizable interest rates',
      'Business expense projection',
      'Print-friendly results',
      'No registration needed',
      'Completely free to use'
    ]
  },

  howTo: {
    name: 'How to Calculate Business Loan Payments',
    description: 'Learn how to calculate your business loan payments in minutes with our simple calculator.',
    totalTime: 'PT3M',
    steps: [
      {
        position: 1,
        name: 'Enter Loan Amount',
        text: 'Input the total amount you need to borrow for your business. This could be for equipment, inventory, working capital, or expansion.'
      },
      {
        position: 2,
        name: 'Set Interest Rate and Term',
        text: 'Enter your annual interest rate (APR) and choose your loan term in months or years. Business loans typically range from 1-10 years.'
      },
      {
        position: 3,
        name: 'View Payment Schedule',
        text: 'Click calculate to see your monthly payment, total interest costs, and complete repayment schedule for business planning.'
      }
    ]
  },

  faq: [
    {
      question: 'What is the average interest rate for a business loan?',
      answer: 'Business loan interest rates vary based on creditworthiness, loan amount, term, and lender type. In 2025, small business loan rates typically range from 6-20% APR. Traditional banks offer 6-10%, alternative lenders 10-18%, and SBA loans 2-8%. Your credit score and business revenue significantly impact the rate you qualify for.'
    },
    {
      question: 'How do I calculate the monthly payment for a business loan?',
      answer: 'Monthly business loan payments use the amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1], where P is the loan amount, r is the monthly interest rate (annual rate divided by 12), and n is the number of payments. Our calculator applies this formula instantly to show your exact payment.'
    },
    {
      question: 'What is the difference between a term loan and a line of credit?',
      answer: 'A term loan is a lump sum borrowed upfront with fixed payments over a set period. A line of credit is revolving credit you can borrow from as needed and pay back. Our calculator focuses on term loans. Lines of credit are more flexible but usually have higher interest rates.'
    },
    {
      question: 'Can I pay off a business loan early?',
      answer: 'Most business loans allow early repayment without penalties, which can save you significant interest. Our calculator helps you understand how extra payments can shorten your loan term. Always check your loan agreement for prepayment terms and conditions.'
    },
    {
      question: 'What business items can I use a loan for?',
      answer: 'Business loans can fund equipment purchases, inventory, technology upgrades, working capital, marketing campaigns, renovations, staff hiring, and expansion. Some lenders have restrictions on loan use, so verify your lender\'s requirements before applying.'
    }
  ],

  relatedTools: [
    'loan-calculator',
    'compound-interest-calculator',
    'roi-calculator',
    'mortgage-calculator',
    'car-loan-calculator'
  ],

  content: {
    introduction: 'Starting a business or expanding your operations? Our free business loan calculator helps you understand exactly what you\'ll pay each month. Whether you\'re financing equipment, building inventory, or covering operational costs, get instant calculations of your monthly payments and total interest. No registration needed, completely free, and designed for entrepreneurs and business owners.',
    
    formula: 'Business loan payments are calculated using: M = P × [r(1+r)^n] / [(1+r)^n - 1], where M is monthly payment, P is principal loan amount, r is monthly interest rate (annual rate ÷ 12), and n is the number of monthly payments. This ensures your loan is fully repaid by the maturity date.',
    
    examples: [
      {
        title: '$50,000 Equipment Loan at 8% APR for 5 Years',
        description: 'A $50,000 business equipment loan at 8% interest over 60 months results in: Monthly payment = $1,010.06, Total amount paid = $60,603.36, Total interest = $10,603.36. This shows how business financing adds to your operating costs.'
      },
      {
        title: '$100,000 Expansion Loan at 10% APR for 7 Years',
        description: 'A $100,000 business expansion loan at 10% interest over 84 months: Monthly payment = $1,544.87, Total amount paid = $129,769.08, Total interest = $29,769.08. Longer terms reduce monthly payments but increase total interest costs.'
      }
    ]
  }
};
