import { ToolSEOConfig } from '../types';

export const mortgageCalculatorSEO: ToolSEOConfig = {
  slug: 'mortgage-calculator',
  category: 'finance',
  title: 'Mortgage Calculator - Estimate Your Monthly Payments | DapsiWow',
  metaDescription: 'Calculate mortgage payments instantly with our free calculator. Estimate monthly payments, principal, interest, taxes, and insurance. Plan your home purchase today.',
  keywords: [
    'mortgage calculator',
    'home loan calculator',
    'monthly mortgage payment calculator',
    'house payment estimator',
    'mortgage payment calculator',
    'home payment calculator'
  ],

  schema: {
    name: 'Mortgage Calculator - Free Home Payment Estimator',
    alternateName: ['Home Loan Calculator', 'House Payment Calculator', 'Mortgage Payment Estimator'],
    description: 'Free mortgage calculator to estimate monthly house payments, including principal, interest, property taxes, and homeowners insurance. Plan your home purchase with confidence.',
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'Mortgage Calculator',
    featureList: [
      'Instant mortgage payment calculation',
      'Principal and interest breakdown',
      'Property tax and insurance estimation',
      'Complete amortization schedule',
      'Down payment adjustment',
      'Multiple loan term options',
      'Compare different scenarios',
      'Print and download results',
      'No registration required'
    ]
  },

  howTo: {
    name: 'How to Calculate Your Mortgage Payment',
    description: 'Learn how to estimate your monthly mortgage payment in 4 simple steps.',
    totalTime: 'PT3M',
    steps: [
      {
        position: 1,
        name: 'Enter Home Price',
        text: 'Input the total purchase price of the home you are considering buying.'
      },
      {
        position: 2,
        name: 'Specify Down Payment',
        text: 'Enter the amount of cash you plan to pay upfront. Standard down payments range from 5-20% of the home price.'
      },
      {
        position: 3,
        name: 'Set Interest Rate and Term',
        text: 'Enter the annual mortgage interest rate and select your loan term (15, 20, or 30 years). Current rates vary by lender and credit score.'
      },
      {
        position: 4,
        name: 'View Your Payment',
        text: 'Click calculate to see your monthly mortgage payment, total interest paid, and complete amortization schedule for your loan term.'
      }
    ]
  },

  faq: [
    {
      question: 'How do I calculate my monthly mortgage payment?',
      answer: 'Monthly mortgage payments are calculated using the amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1], where M is monthly payment, P is loan amount (home price minus down payment), r is monthly interest rate (APR ÷ 12), and n is total number of payments (years × 12). Our calculator applies this formula instantly.'
    },
    {
      question: 'What is included in a mortgage payment?',
      answer: 'A complete mortgage payment typically includes Principal (P), Interest (I), Taxes (T), and Insurance (I) - known as PITI. Principal reduces your loan balance, interest is the cost of borrowing, property taxes fund local services, and homeowners insurance protects your property. Our calculator helps estimate each component.'
    },
    {
      question: 'What is a good mortgage interest rate in 2025?',
      answer: 'Mortgage interest rates in 2025 typically range from 5.5% to 7.5% depending on loan term, credit score, and economic conditions. 30-year fixed mortgages average around 6.5%, while 15-year mortgages are typically 0.5-1% lower. Your credit score, down payment size, and lender significantly impact your rate.'
    },
    {
      question: 'Should I choose a 15-year or 30-year mortgage?',
      answer: 'A 15-year mortgage has higher monthly payments but you pay much less total interest and own your home sooner. A 30-year mortgage has lower monthly payments but costs significantly more in total interest. For example, a $300,000 mortgage at 6% costs $1,799/month for 15 years versus $1,199/month for 30 years, but totals $323,820 in interest over 30 years versus $123,720 over 15 years.'
    },
    {
      question: 'Does this calculator include taxes and insurance?',
      answer: 'Yes, our calculator allows you to input estimated property taxes and homeowners insurance amounts to get a complete PITI (Principal, Interest, Taxes, Insurance) monthly payment. Property taxes vary by location and represent 0.5-2% of property value annually. Homeowners insurance typically costs $1,000-$2,000 per year depending on home value and location.'
    }
  ],

  relatedTools: [
    'loan-calculator',
    'home-loan-calculator',
    'emi-calculator',
    'compound-interest-calculator',
    'roi-calculator'
  ],

  content: {
    introduction: 'Planning to buy a home? Our free mortgage calculator helps you understand your financing options and monthly costs. Whether you\'re a first-time homebuyer or refinancing, calculate monthly payments, compare loan terms, and see complete amortization schedules. Make confident real estate decisions with accurate calculations.',
    
    formula: 'Mortgage payments use the amortization formula: M = P × [r(1+r)^n] / [(1+r)^n - 1], where M is your monthly payment, P is the loan amount (home price minus down payment), r is your monthly interest rate (APR ÷ 12), and n is the total number of payments (loan term in months × 12).',
    
    examples: [
      {
        title: '$400,000 Home with $80,000 Down at 6.5% for 30 Years',
        description: 'For a $400,000 home with 20% down ($80,000), financing $320,000 at 6.5% annual interest over 30 years: Monthly payment = $2,023.77, Total amount paid = $729,157, Total interest = $409,157. This shows a typical mortgage scenario.'
      },
      {
        title: '$300,000 Home with $60,000 Down at 6% for 15 Years',
        description: 'For a $300,000 home with 20% down ($60,000), financing $240,000 at 6% annual interest over 15 years: Monthly payment = $1,799.29, Total amount paid = $323,872, Total interest = $83,872. The 15-year mortgage significantly reduces total interest paid.'
      }
    ]
  }
};
