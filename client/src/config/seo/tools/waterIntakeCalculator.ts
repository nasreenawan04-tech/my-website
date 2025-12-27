import { ToolSEOConfig } from '../types';

export const waterIntakeCalculatorSEO: ToolSEOConfig = {
  slug: 'water-intake-calculator',
  category: 'health',
  title: 'Water Intake Calculator - Daily Hydration Needs | DapsiWow',
  metaDescription: 'Calculate how much water you should drink daily based on your weight and activity level. Stay hydrated with our free online calculator.',
  keywords: [
    'water intake calculator',
    'daily hydration needs',
    'how much water to drink',
    'hydration calculator',
    'daily water requirement'
  ],
  schema: {
    name: 'Water Intake Calculator',
    description: 'Free online tool to calculate personalized daily water intake requirements for optimal hydration.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Wellness Tool',
    featureList: [
      'Weight-based calculation',
      'Activity level adjustment',
      'Daily hydration goal',
      'Metric and Imperial support',
      'Privacy-focused'
    ]
  },
  howTo: {
    name: 'How to Calculate Water Needs',
    description: 'Find your daily hydration goal in seconds.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: 'Enter Weight',
        text: 'Input your current body weight.'
      },
      {
        position: 2,
        name: 'Select Activity',
        text: 'Enter how many minutes of exercise you do daily.'
      },
      {
        position: 3,
        name: 'Get Results',
        text: 'The tool will show your recommended daily water intake in ounces or liters.'
      }
    ]
  },
  faq: [
    {
      question: 'How much water do I really need?',
      answer: 'While the "8 glasses a day" rule is common, actual needs depend on weight, activity, and climate. Our calculator provides a more personalized estimate.'
    },
    {
      question: 'Do other drinks count toward water intake?',
      answer: 'Yes, most non-alcoholic beverages contribute to hydration, though pure water is usually the best choice for zero-calorie hydration.'
    },
    {
      question: 'What are signs of dehydration?',
      answer: 'Common signs include thirst, dark yellow urine, fatigue, dizziness, and dry mouth.'
    }
  ],
  relatedTools: ['calorie-calculator', 'protein-intake-calculator', 'sleep-calculator'],
  content: {
    introduction: 'Proper hydration is essential for every bodily function. Use our calculator to ensure you are drinking enough to perform at your best.',
    formula: 'Uses body weight and activity-based hydration guidelines.',
    comparison: 'Fast, simple, and accurate without requiring any personal data storage.',
    examples: []
  }
};
