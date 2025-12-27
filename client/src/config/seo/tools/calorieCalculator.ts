import { ToolSEOConfig } from '../types';

export const calorieCalculatorSEO: ToolSEOConfig = {
  slug: 'calorie-calculator',
  category: 'health',
  title: 'Calorie Calculator - Daily Calorie Needs | DapsiWow',
  metaDescription: 'Estimate how many calories you need each day to maintain, lose, or gain weight. Free online calorie calculator with macro breakdown.',
  keywords: [
    'calorie calculator',
    'daily calorie needs',
    'weight loss calculator',
    'calorie intake calculator',
    'how many calories should i eat'
  ],
  schema: {
    name: 'Calorie Calculator',
    alternateName: ['Daily Calorie Intake Calculator'],
    description: 'Free online calorie calculator to determine daily energy requirements for weight management.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Nutrition Tool',
    featureList: [
      'Weight goal setting',
      'Daily calorie requirement',
      'Macro distribution',
      'BMR and TDEE integration',
      'Support for various activity levels'
    ]
  },
  howTo: {
    name: 'How to Calculate Calorie Needs',
    description: 'Determine your daily calorie intake in 3 simple steps.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: 'Input Stats',
        text: 'Enter your age, height, weight, and gender.'
      },
      {
        position: 2,
        name: 'Select Activity',
        text: 'Choose how active you are during a typical week.'
      },
      {
        position: 3,
        name: 'Choose Goal',
        text: 'Specify if you want to maintain, lose, or gain weight to see your daily target.'
      }
    ]
  },
  faq: [
    {
      question: 'How many calories should I eat to lose weight?',
      answer: 'Generally, a deficit of 500 calories from your maintenance level (TDEE) is recommended for sustainable weight loss of about 1 lb per week.'
    },
    {
      question: 'What is BMR vs TDEE?',
      answer: 'BMR is the energy your body needs at rest, while TDEE is BMR plus the energy used for physical activity and digestion.'
    },
    {
      question: 'Are all calories equal for weight loss?',
      answer: 'While "calories in vs calories out" determines weight change, the quality of calories (macros) affects satiety, muscle retention, and overall health.'
    }
  ],
  relatedTools: ['tdee-calculator', 'bmi-calculator', 'protein-intake-calculator'],
  content: {
    introduction: 'Take the guesswork out of your diet with our scientific calorie calculator. Plan your meals with confidence based on your unique metabolic needs.',
    formula: 'Utilizes the Mifflin-St Jeor equation, considered the most accurate for healthy adults.',
    comparison: 'Provides specific targets for weight loss, maintenance, and muscle gain in one view.',
    examples: []
  }
};
