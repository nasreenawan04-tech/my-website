import { ToolSEOConfig } from '../types';

export const proteinIntakeCalculatorSEO: ToolSEOConfig = {
  slug: 'protein-intake-calculator',
  category: 'health',
  title: 'Protein Intake Calculator - Daily Protein Needs | DapsiWow',
  metaDescription: 'Calculate your daily protein requirements for muscle gain, weight loss, or maintenance. Free online tool based on scientific guidelines.',
  keywords: [
    'protein intake calculator',
    'daily protein needs',
    'calculate protein for muscle gain',
    'how much protein should i eat',
    'protein requirement calculator'
  ],
  schema: {
    name: 'Protein Intake Calculator',
    description: 'Free online tool to estimate daily protein needs based on body weight, activity, and fitness goals.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Nutrition Tool',
    featureList: [
      'Goal-based protein targets',
      'Activity level integration',
      'Muscle gain and fat loss modes',
      'Simple, intuitive interface',
      'Privacy-first'
    ]
  },
  howTo: {
    name: 'How to Calculate Protein Needs',
    description: 'Determine your daily protein target in 3 steps.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: 'Enter Stats',
        text: 'Input your current weight and age.'
      },
      {
        position: 2,
        name: 'Set Goal',
        text: 'Choose your primary goal (e.g., muscle gain, weight loss, or maintenance).'
      },
      {
        position: 3,
        name: 'Select Activity',
        text: 'Choose your weekly exercise frequency to refine the calculation.'
      }
    ]
  },
  faq: [
    {
      question: 'How much protein is needed for muscle gain?',
      answer: 'For muscle hypertrophy, guidelines typically recommend 1.6 to 2.2 grams of protein per kilogram of body weight.'
    },
    {
      question: 'Can you eat too much protein?',
      answer: 'For healthy individuals, higher protein intake is generally safe, but extremely high amounts are unnecessary and may lack other essential nutrients.'
    },
    {
      question: 'What are the best protein sources?',
      answer: 'Lean meats, fish, eggs, dairy, beans, lentils, and tofu are all excellent sources of high-quality protein.'
    }
  ],
  relatedTools: ['calorie-calculator', 'tdee-calculator', 'bmi-calculator'],
  content: {
    introduction: 'Protein is the building block of your body. Ensure you are getting enough to support your recovery and goals with our free tool.',
    formula: 'Based on RDA and ACSM guidelines for various populations.',
    comparison: 'Provides a range of intake levels based on specific athletic and health goals.',
    examples: []
  }
};
