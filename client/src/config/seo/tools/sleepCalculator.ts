import { ToolSEOConfig } from '../types';

export const sleepCalculatorSEO: ToolSEOConfig = {
  slug: 'sleep-calculator',
  category: 'health',
  title: 'Sleep Calculator - Wake Up Refreshed | DapsiWow',
  metaDescription: 'Calculate the best time to wake up or go to bed based on natural sleep cycles. Improve your sleep quality with our free online tool.',
  keywords: [
    'sleep calculator',
    'sleep cycle calculator',
    'what time should i go to bed',
    'optimal wake up time',
    'bedtime calculator'
  ],
  schema: {
    name: 'Sleep Calculator',
    description: 'Free online tool to calculate optimal sleep and wake times based on 90-minute sleep cycles.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Wellness Tool',
    featureList: [
      'Sleep cycle optimization',
      'Wake up time calculation',
      'Bedtime calculation',
      'Power nap guides',
      'Simple results'
    ]
  },
  howTo: {
    name: 'How to Use the Sleep Calculator',
    description: 'Optimize your rest in 2 simple steps.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: 'Choose Your Mode',
        text: 'Decide if you want to know when to wake up (based on bedtime) or when to go to bed (based on wake time).'
      },
      {
        position: 2,
        name: 'Set the Time',
        text: 'Enter the relevant time and click calculate to see your optimal sleep windows.'
      }
    ]
  },
  faq: [
    {
      question: 'What is a sleep cycle?',
      answer: 'A typical sleep cycle lasts about 90 minutes. Waking up at the end of a cycle, rather than in the middle, helps you feel more refreshed.'
    },
    {
      question: 'How many hours of sleep do I need?',
      answer: 'Most adults need 7-9 hours of quality sleep, which translates to about 5 or 6 full sleep cycles.'
    },
    {
      question: 'What happens if I wake up mid-cycle?',
      answer: 'Waking up during deep sleep (mid-cycle) can cause sleep inertia, leaving you feeling groggy and tired for hours.'
    }
  ],
  relatedTools: ['water-intake-calculator', 'bmi-calculator', 'calorie-calculator'],
  content: {
    introduction: 'Quality is just as important as quantity when it comes to sleep. Our calculator helps you time your rest to match your body\'s natural rhythms.',
    formula: 'Uses the standard 90-minute sleep cycle duration with a 15-minute average time to fall asleep.',
    comparison: 'Focused on cycle timing rather than just total hours, providing a more practical guide to feeling rested.',
    examples: []
  }
};
