import { ToolSEOConfig } from '../types';

export const heartRateCalculatorSEO: ToolSEOConfig = {
  slug: 'heart-rate-calculator',
  category: 'health',
  title: 'Heart Rate Calculator - Target Training Zones | DapsiWow',
  metaDescription: 'Calculate your maximum and target heart rate zones for optimal exercise. Free online tool using Karvonen and other standard formulas. Train smarter.',
  keywords: [
    'heart rate calculator',
    'target heart rate zones',
    'maximum heart rate calculator',
    'karvonen formula calculator',
    'fitness heart rate zones'
  ],
  schema: {
    name: 'Heart Rate Calculator',
    description: 'Free online tool to calculate target heart rate zones for safe and effective cardiovascular training.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Fitness Tool',
    featureList: [
      'Maximum heart rate estimation',
      'Karvonen formula zones',
      'Fat burn and cardio zones',
      'Resting heart rate integration',
      'Age-based guidelines'
    ]
  },
  howTo: {
    name: 'How to Calculate Heart Rate Zones',
    description: 'Find your ideal training intensity in 3 simple steps.',
    totalTime: 'PT2M',
    steps: [
      {
        position: 1,
        name: 'Enter Age and Resting Heart Rate',
        text: 'Input your current age and your resting heart rate (measured when you first wake up).'
      },
      {
        position: 2,
        name: 'Select Formula',
        text: 'Choose between the standard 220-age formula or the more precise Karvonen method.'
      },
      {
        position: 3,
        name: 'View Training Zones',
        text: 'Instantly see your heart rate targets for fat burning, aerobic fitness, and peak performance.'
      }
    ]
  },
  faq: [
    {
      question: 'What is a healthy resting heart rate?',
      answer: 'For most adults, a healthy resting heart rate is between 60 and 100 beats per minute. Highly trained athletes may have rates as low as 40-50 bpm.'
    },
    {
      question: 'How do I find my maximum heart rate?',
      answer: 'A common estimate is 220 minus your age. However, individual variation is significant, and our calculator provides more nuanced methods like Karvonen.'
    },
    {
      question: 'What is the "Fat Burn Zone"?',
      answer: 'The fat burn zone is typically between 60% and 70% of your maximum heart rate. At this intensity, your body burns a higher percentage of calories from fat.'
    }
  ],
  relatedTools: ['calorie-calculator', 'tdee-calculator', 'bmi-calculator'],
  content: {
    introduction: 'Optimizing your heart rate ensures you are training at the right intensity for your goals. Use our tool to calculate your personalized fitness zones.',
    formula: 'Supports 220-Age, Karvonen, and Tanaka formulas.',
    comparison: 'Our tool provides a more detailed breakdown of zones than basic gym equipment consoles.',
    examples: []
  }
};
