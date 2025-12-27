import { ToolSEOConfig } from "../types";

export const bmiCalculatorSEO: ToolSEOConfig = {
  slug: 'bmi-calculator',
  category: 'health',
  title: "BMI Calculator - Calculate Your Body Mass Index | DapsiWow",
  metaDescription: "Check your Body Mass Index (BMI) with our free calculator. Understand your weight category and maintain a healthy lifestyle instantly with no registration.",
  keywords: ["bmi calculator", "body mass index", "weight category", "health calculator", "free bmi tool"],
  schema: {
    name: 'BMI Calculator',
    alternateName: ['Body Mass Index Calculator'],
    description: 'Free online BMI calculator to determine weight category based on height and weight for adults.',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Health Tool',
    featureList: [
      'Instant BMI calculation',
      'Weight category classification',
      'Healthy weight range estimation',
      'Metric and Imperial unit support',
      'Privacy-focused calculation'
    ]
  },
  faq: [
    {
      question: "What is a healthy BMI range?",
      answer: "For most adults, a healthy BMI is between 18.5 and 24.9. Ranges below 18.5 are underweight, and above 25 are overweight."
    },
    {
      question: "How accurate is BMI for athletes?",
      answer: "BMI can be less accurate for athletes with high muscle mass, as muscle weighs more than fat. It may categorize a muscular person as overweight when they are healthy."
    },
    {
      question: "Is BMI the same for men and women?",
      answer: "The BMI formula is the same for men and women, but the interpretation of body fatness can vary slightly by gender at the same BMI."
    }
  ],
  howTo: {
    name: "How to Check Your BMI",
    description: 'Determine your Body Mass Index in seconds with our free tool.',
    totalTime: 'PT1M',
    steps: [
      {
        position: 1,
        name: "Select Unit System",
        text: "Choose between Metric (kg/cm) or Imperial (lb/in) units."
      },
      {
        position: 2,
        name: "Enter Height",
        text: "Input your current height accurately."
      },
      {
        position: 3,
        name: "Enter Weight",
        text: "Input your current weight."
      }
    ]
  },
  relatedTools: ['body-fat-calculator', 'calorie-calculator', 'tdee-calculator'],
  content: {
    introduction: 'BMI is a standard screening tool used by healthcare providers. Our free calculator makes it easy to monitor your weight status from home.',
    formula: 'BMI = weight (kg) / [height (m)]^2.',
    comparison: 'Provides a simple, fast, and data-private alternative to medical office screenings.',
    examples: []
  }
};
