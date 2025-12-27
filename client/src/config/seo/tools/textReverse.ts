import { ToolSEOConfig } from '../types';

export const textReverseConfig: ToolSEOConfig = {
  slug: 'text-reverse',
  category: 'text',
  title: 'Text Reverser - Reverse Text, Words, & Sentences | DapsiWow',
  metaDescription: 'Free online tool to flip your text backwards. Reverse entire strings, word order, or individual words instantly. Secure and client-side.',
  keywords: ['text reverser', 'reverse text', 'backwards text', 'flip text', 'reverse words'],
  schema: {
    name: 'Online Text Reverser',
    description: 'A fun and useful tool for reversing text strings, words, and sentences for various creative purposes.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Text Processing',
    featureList: [
      'Reverse entire strings',
      'Flip word order only',
      'Reverse each word individually',
      'One-click copy to clipboard',
      'Instant real-time results'
    ]
  },
  howTo: {
    name: 'How to reverse text',
    description: 'Follow these steps to flip your text in multiple ways.',
    totalTime: 'PT10S',
    steps: [
      {
        position: 1,
        name: 'Input Text',
        text: 'Type or paste your text into the main input field.'
      },
      {
        position: 2,
        name: 'Select Reverse Type',
        text: 'Choose between "Reverse All", "Reverse Words", or "Flip Word Order".'
      },
      {
        position: 3,
        name: 'Copy Backwards Text',
        text: 'The result appears instantly. Click the copy icon to use your reversed text.'
      }
    ]
  },
  faq: [
    {
      question: 'What is the "Reverse All" option?',
      answer: 'This option flips the entire string, so the last character becomes the first and the first becomes the last.'
    },
    {
      question: 'Can I use this for social media bios?',
      answer: 'Yes, reversed text is a popular way to create unique looking profiles on platforms like Instagram and Twitter.'
    }
  ],
  relatedTools: ['case-converter', 'word-counter', 'base64-encoder'],
  content: {
    introduction: 'Need to flip something around? Whether it is for a creative project, a secret message, or testing code, our Text Reverser makes it simple.',
    examples: [
      {
        title: 'Full String Reversal',
        description: '"DapsiWow" becomes "woWispaD".'
      },
      {
        title: 'Word Order Flip',
        description: '"Hello World" becomes "World Hello".'
      }
    ]
  }
};
