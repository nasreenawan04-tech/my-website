import { ToolSEOConfig } from '../types';

export const caseConverterConfig: ToolSEOConfig = {
  slug: 'case-converter',
  category: 'text',
  title: 'Case Converter - Change Text Case Online | DapsiWow',
  metaDescription: 'Easily convert text between different cases: UPPERCASE, lowercase, Title Case, Sentence case, and more. Free online text transformation tool.',
  keywords: ['case converter', 'uppercase to lowercase', 'title case converter', 'sentence case', 'text converter'],
  schema: {
    name: 'Online Case Converter',
    description: 'A versatile text tool for changing the capitalization of any text string instantly.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Text Processing',
    featureList: [
      'Convert to UPPERCASE',
      'Convert to lowercase',
      'Convert to Title Case',
      'Convert to Sentence case',
      'Toggle case and Inverse case'
    ]
  },
  howTo: {
    name: 'How to change text case',
    description: 'Follow these steps to transform your text casing.',
    totalTime: 'PT10S',
    steps: [
      {
        position: 1,
        name: 'Enter Text',
        text: 'Paste your text into the input field.'
      },
      {
        position: 2,
        name: 'Select Conversion',
        text: 'Click the button for the case you want (e.g., UPPERCASE, Title Case).'
      },
      {
        position: 3,
        name: 'Copy Result',
        text: 'The text will be transformed instantly. Use the copy button to save it.'
      }
    ]
  },
  faq: [
    {
      question: 'What does Title Case do?',
      answer: 'Title Case capitalizes the first letter of every word in your text, which is ideal for headings and titles.'
    },
    {
      question: 'Can I undo a conversion?',
      answer: 'Yes, most of our tools keep your original input until you clear it, so you can try different casing options.'
    }
  ],
  relatedTools: ['word-counter', 'base64-encoder', 'password-generator'],
  content: {
    introduction: 'Don\'t waste time manually retyping text that was written with the wrong casing. Our Case Converter handles everything from caps lock mistakes to professional title formatting.',
    examples: [
      {
        title: 'Sentence case for paragraphs',
        description: 'Transform ALL CAPS text into properly formatted sentences.'
      },
      {
        title: 'UPPERCASE for emphasis',
        description: 'Quickly convert a list of items to all uppercase for better visibility.'
      }
    ]
  }
};
