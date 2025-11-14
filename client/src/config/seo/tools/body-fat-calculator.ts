import { ToolSEOConfig } from '../types';

export const bodyFatCalculatorSEO: ToolSEOConfig = {
  slug: 'body-fat-calculator',
  category: 'health',
  title: 'Body Fat Calculator - body fat percentage Calculator | DapsiWow',
  metaDescription: 'Calculate your body fat percentage with our free, science-based calculator. Get instant results, detailed insights, and professional-grade accuracy. No registration required. Try now!',
  keywords: [
    "body fat calculator",
    "body fat calculator online",
    "free body fat calculator",
    "body fat percentage",
    "calculator"
],
  
  schema: {
    name: 'Body Fat Calculator',
    alternateName: [
      "Body Fat Calculator",
      "Online Body Fat Calculator",
      "Free Body Fat Calculator"
],
    description: 'Calculate body fat percentage using US Navy method. Free online calculator with instant results.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Body Fat Calculator',
    featureList: [
      "Science-based calculations",
      "Instant results with explanations",
      "Health range comparisons",
      "Personalized recommendations",
      "No registration needed",
      "Completely free",
      "Privacy-protected - no data collection",
      "Mobile-friendly"
]
  },
  
  howTo: {
    name: 'How to Calculate body fat percentage',
    description: 'Get your body fat percentage results in 3 easy steps using our scientifically-validated calculator.',
    totalTime: 'PT2M',
    steps: [
      {
        position: 1,
        name: 'Enter Your Information',
        text: 'Provide the required measurements and details. All inputs are kept private and processed locally in your browser.'
      },
      {
        position: 2,
        name: 'Review Your Profile',
        text: 'Confirm your information is accurate. Adjust any settings or parameters that apply to your specific situation.'
      },
      {
        position: 3,
        name: 'View Your Results',
        text: 'Get instant results with detailed explanations, health ranges, and personalized recommendations based on scientific guidelines.'
      }
    ]
  },
  
  faq: [
    {
        "question": "How accurate is this calculator?",
        "answer": "Our calculator uses scientifically validated formulas and follows current medical guidelines. However, results are estimates and should not replace professional medical advice. Always consult with a healthcare provider for personalized health assessments."
    },
    {
        "question": "Is my health data kept private?",
        "answer": "Absolutely. All calculations happen locally in your browser. We do not collect, store, or transmit any of your personal health information. Your privacy is completely protected."
    },
    {
        "question": "Should I consult a doctor about my results?",
        "answer": "Yes. While our calculator provides accurate estimates based on standard formulas, only a qualified healthcare professional can give you personalized medical advice. Use these results as a starting point for discussions with your doctor."
    },
    {
        "question": "How often should I recalculate my body fat percentage?",
        "answer": "This depends on your health goals. Generally, recalculating monthly or quarterly can help you track progress. However, for specific guidance, consult with a healthcare professional."
    },
    {
        "question": "Is this calculator suitable for children?",
        "answer": "Some health calculators use different formulas for children and adults. Check the tool description to see if it includes pediatric calculations. For children's health assessments, always consult with a pediatrician."
    }
],
  
  relatedTools: [
    "cholesterol-risk-calculator",
    "sleep-quality-calculator",
    "pregnancy-due-date-calculator",
    "lean-body-mass-calculator",
    "stress-level-calculator",
    "max-heart-rate-calculator"
],
  
  content: {
    introduction: 'Calculate body fat percentage using US Navy method. Our free body fat calculator provides instant, accurate results with no registration required.',
    formula: 'Uses industry-standard calculations and formulas.',
    comparison: 'Unlike other tools, ours is completely free, requires no registration, and prioritizes your privacy.',
    examples: []
  }
};
