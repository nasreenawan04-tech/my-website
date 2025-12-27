import { ToolSEOConfig } from '../types';

export const tdeeCalculatorSEO: ToolSEOConfig = {
  slug: 'tdee-calculator',
  category: 'health',
  title: 'TDEE Calculator - Total Daily Energy Expenditure | DapsiWow',
  metaDescription: 'Calculate your Total Daily Energy Expenditure (TDEE) instantly. Find out how many calories you burn per day and plan your diet for weight loss or gain.',
  keywords: [
    'tdee calculator',
    'total daily energy expenditure',
    'maintenance calories calculator',
    'burn calories calculator',
    'daily calorie burn'
  ],
  schema: {
    name: 'TDEE Calculator',
    alternateName: ['Total Daily Energy Expenditure Calculator', 'Maintenance Calorie Calculator'],
    description: 'Free online TDEE calculator to estimate how many calories you burn per day based on your activity level.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Nutrition Tool',
    featureList: [
      'BMR calculation',
      'Activity level adjustments',
      'Maintenance calorie estimation',
      'Bulking and cutting calorie targets',
      'Macronutrient breakdown'
    ]
  },
  howTo: {
    name: 'How to Calculate Your TDEE',
    description: 'Find your daily calorie burn in 3 easy steps.',
    totalTime: 'PT2M',
    steps: [
      {
        position: 1,
        name: 'Enter Personal Details',
        text: 'Enter your age, gender, height, and weight.'
      },
      {
        position: 2,
        name: 'Select Activity Level',
        text: 'Choose the activity level that best matches your lifestyle, from sedentary to extra active.'
      },
      {
        position: 3,
        name: 'Get Daily Calories',
        text: 'Click calculate to see your estimated Total Daily Energy Expenditure and maintenance calories.'
      }
    ]
  },
  faq: [
    {
      question: 'What is a healthy TDEE?',
      answer: 'A healthy TDEE is one that supports your health goals while providing enough energy for your daily activities. It varies greatly based on size, age, and activity.'
    },
    {
      question: 'How do I use TDEE for weight loss?',
      answer: 'To lose weight, you should typically consume about 500 calories less than your TDEE daily, which leads to about 1 lb of weight loss per week.'
    },
    {
      question: 'Does TDEE change as I lose weight?',
      answer: 'Yes, as you lose weight, your TDEE will generally decrease because a smaller body requires less energy to maintain and move.'
    }
  ],
  relatedTools: ['bmi-calculator', 'calorie-calculator', 'protein-intake-calculator'],
  content: {
    introduction: 'Knowing your TDEE is the foundation of any successful diet or fitness plan. Our tool provides an accurate starting point for your nutrition journey.',
    formula: 'Calculates BMR using Mifflin-St Jeor and applies activity multipliers (PAL).',
    comparison: 'Our TDEE tool includes detailed macro breakdowns for different goals, unlike basic calorie counters.',
    examples: []
  }
};
