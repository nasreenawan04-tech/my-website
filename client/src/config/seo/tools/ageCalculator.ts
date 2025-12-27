import { ToolSEOConfig } from '../types';

export const ageCalculatorConfig: ToolSEOConfig = {
  slug: 'age-calculator',
  category: 'finance',
  title: 'Age Calculator - Calculate Exact Age Online | DapsiWow',
  metaDescription: 'Free online age calculator. Find your exact age in years, months, days, hours, and minutes. Calculate the time between two dates instantly.',
  keywords: ['age calculator', 'calculate age', 'how old am i', 'date of birth calculator', 'age in days'],
  schema: {
    name: 'Professional Age Calculator',
    description: 'A precise tool for calculating age and time intervals between dates.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Calculator Tools',
    featureList: [
      'Exact age in years, months, days',
      'Total age in weeks, hours, minutes',
      'Time until next birthday',
      'Difference between two dates',
      'Zodiac sign detection'
    ]
  },
  howTo: {
    name: 'How to calculate your age',
    description: 'Follow these steps to find your exact age.',
    totalTime: 'PT10S',
    steps: [
      {
        position: 1,
        name: 'Enter Birth Date',
        text: 'Select your date of birth from the calendar or type it in.'
      },
      {
        position: 2,
        name: 'Set Current Date',
        text: 'The tool defaults to today, but you can choose any date to see your age at that time.'
      },
      {
        position: 3,
        name: 'View Results',
        text: 'Get your detailed age breakdown and next birthday countdown instantly.'
      }
    ]
  },
  faq: [
    {
      question: 'How is the age calculated?',
      answer: 'We use standard Gregorian calendar logic, accounting for leap years and varying month lengths to ensure 100% accuracy.'
    },
    {
      question: 'Can I calculate the age of a past event?',
      answer: 'Yes, you can input any two dates to find the exact duration between them.'
    }
  ],
  relatedTools: ['loan-calculator', 'roi-calculator', 'mortgage-calculator'],
  content: {
    introduction: 'Ever wondered exactly how many days old you are? Our Age Calculator provides a detailed breakdown of your life in time, down to the minute.',
    examples: [
      {
        title: 'Finding Your Exact Age',
        description: 'See your age in years, months, and days for official documents or personal interest.'
      },
      {
        title: 'Birthday Countdown',
        description: 'Check exactly how many days are left until your next big celebration.'
      }
    ]
  }
};
