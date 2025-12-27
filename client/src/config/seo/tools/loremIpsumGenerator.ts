import { ToolSEOConfig } from '../types';

export const loremIpsumConfig: ToolSEOConfig = {
  slug: 'lorem-ipsum-generator',
  category: 'text',
  title: 'Lorem Ipsum Generator - Placeholder Text Generator | DapsiWow',
  metaDescription: 'Generate custom Lorem Ipsum placeholder text for your design and development projects. Customize paragraphs, sentences, and words instantly.',
  keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator', 'lorem ipsum creator', 'filler text'],
  schema: {
    name: 'Lorem Ipsum Generator',
    description: 'A fast and customizable placeholder text generator for designers and developers.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Design Tools',
    featureList: [
      'Custom paragraph count',
      'Sentence or word-based generation',
      'HTML tag options (p, li, etc.)',
      'One-click copy to clipboard',
      'Fast and lightweight'
    ]
  },
  howTo: {
    name: 'How to generate Lorem Ipsum text',
    description: 'Follow these steps to generate custom placeholder text for your project.',
    totalTime: 'PT10S',
    steps: [
      {
        position: 1,
        name: 'Set Requirements',
        text: 'Choose whether you want paragraphs, sentences, or words and specify the quantity.'
      },
      {
        position: 2,
        name: 'Customize Options',
        text: 'Optionally enable HTML tags or start with the standard "Lorem ipsum dolor sit amet".'
      },
      {
        position: 3,
        name: 'Generate and Copy',
        text: 'Click generate to view your placeholder text and use the copy button to use it.'
      }
    ]
  },
  faq: [
    {
      question: 'What is Lorem Ipsum?',
      answer: 'Lorem Ipsum is standard placeholder text used in the design and publishing industries to demonstrate the visual form of a document without relying on meaningful content.'
    },
    {
      question: 'Is this generator free to use?',
      answer: 'Yes, our Lorem Ipsum generator is completely free for all your design and development projects.'
    }
  ],
  relatedTools: ['word-counter', 'base64-encoder', 'password-generator'],
  content: {
    introduction: 'Need filler text for your next layout? Our Lorem Ipsum Generator helps you create perfectly sized blocks of placeholder text instantly.',
    examples: [
      {
        title: '3 Paragraphs for Web Design',
        description: 'Quickly generate 3 paragraphs of dummy text to test a blog post layout.'
      },
      {
        title: 'Single Sentence for Headlines',
        description: 'Generate a single sentence to test typography and font sizes in your design.'
      }
    ]
  }
};
