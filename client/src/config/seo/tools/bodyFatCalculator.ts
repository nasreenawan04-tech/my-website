import { ToolSEOConfig } from '../types';

export const bodyFatCalculatorSEO: ToolSEOConfig = {
  slug: 'body-fat-calculator',
  category: 'health',
  title: 'Body Fat Calculator - Accurate Body Fat Percentage | DapsiWow',
  metaDescription: 'Calculate your body fat percentage using the US Navy method. Get health insights and understand your body composition for free and instantly.',
  keywords: [
    'body fat calculator',
    'body fat percentage calculator',
    'calculate body fat',
    'us navy body fat method',
    'body composition calculator'
  ],
  schema: {
    name: 'Body Fat Calculator',
    alternateName: ['Body Fat Percentage Calculator'],
    description: 'Free online body fat calculator using the US Navy method to estimate body fat percentage and body composition.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Fitness Tool',
    featureList: [
      'US Navy method calculation',
      'Body fat percentage estimate',
      'Body fat category classification',
      'Metric and Imperial units',
      'Privacy-first local calculation'
    ]
  },
  howTo: {
    name: 'How to Calculate Body Fat',
    description: 'Learn how to estimate your body fat percentage in 3 simple steps.',
    totalTime: 'PT2M',
    steps: [
      {
        position: 1,
        name: 'Enter Gender and Measurements',
        text: 'Select your gender and enter measurements for height, neck, waist, and hips (for women).'
      },
      {
        position: 2,
        name: 'Select Unit System',
        text: 'Choose between Metric (cm/kg) or Imperial (in/lbs) units for your measurements.'
      },
      {
        position: 3,
        name: 'Calculate Results',
        text: 'Click calculate to see your estimated body fat percentage and how it compares to healthy ranges.'
      }
    ]
  },
  faq: [
    {
      question: 'How accurate is the US Navy body fat method?',
      answer: 'The US Navy method is a reliable estimate for most people, typically within 3-4% accuracy compared to hydrostatic weighing. It is widely used because it only requires a measuring tape.'
    },
    {
      question: 'What is a healthy body fat percentage?',
      answer: 'Healthy ranges vary by gender and age. Generally, 10-20% is considered healthy for men, and 18-28% for women. Athletes often have lower percentages.'
    },
    {
      question: 'Does muscle affect the body fat calculator?',
      answer: 'Yes, because muscle is denser than fat, very muscular individuals might receive a slightly higher estimate than their actual body fat percentage using tape measurements.'
    }
  ],
  relatedTools: ['bmi-calculator', 'calorie-calculator', 'tdee-calculator'],
  content: {
    introduction: 'Understanding your body fat percentage is often more useful than weight alone. Our calculator helps you track your fitness progress accurately.',
    formula: 'Uses the US Navy circumference-based equations for men and women.',
    comparison: 'Unlike simple BMI, this tool considers body measurements to distinguish between fat and lean mass.',
    examples: []
  }
};
