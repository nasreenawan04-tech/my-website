import { ToolSEOConfig } from '../types';

export const wordCounterConfig: ToolSEOConfig = {
  slug: 'word-counter',
  category: 'text',
  title: 'Word Counter - Real-time Word & Character Count | DapsiWow',
  metaDescription: 'Free online word counter tool. Count words, characters, sentences, and paragraphs in real-time. Analyze text density and estimated reading time.',
  keywords: ['word counter', 'character counter', 'word count', 'text analyzer', 'reading time calculator'],
  schema: {
    name: 'Professional Word Counter',
    description: 'A comprehensive text analysis tool for counting words, characters, and other metrics in real-time.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Text Processing',
    featureList: [
      'Real-time word and character counting',
      'Sentence and paragraph detection',
      'Estimated reading and speaking time',
      'Keyword density analysis',
      'One-click clear and copy'
    ]
  },
  howTo: {
    name: 'How to use Word Counter',
    description: 'Get detailed metrics about your text in seconds.',
    totalTime: 'PT10S',
    steps: [
      {
        position: 1,
        name: 'Input Text',
        text: 'Paste or type your content into the main text area.'
      },
      {
        position: 2,
        name: 'Review Metrics',
        text: 'Watch the word, character, and sentence counts update instantly above or below the text box.'
      },
      {
        position: 3,
        name: 'Analyze Details',
        text: 'Check advanced metrics like reading time and top keywords in the side panels.'
      }
    ]
  },
  faq: [
    {
      question: 'Does word count include spaces?',
      answer: 'Our tool provides both "Characters with spaces" and "Characters without spaces" so you have the exact metric you need.'
    },
    {
      question: 'How is reading time calculated?',
      answer: 'Estimated reading time is based on an average reading speed of 275 words per minute.'
    },
    {
      question: 'Is there a limit to how much text I can paste?',
      answer: 'There is no hard limit. Our tool can handle large documents, including essays and long-form articles, efficiently.'
    }
  ],
  relatedTools: ['base64-encoder', 'password-generator', 'qr-scanner'],
  content: {
    introduction: 'Whether you are a student writing an essay, a blogger drafting a post, or a professional following strict character limits, our Word Counter provides the precision you need.',
    examples: [
      {
        title: 'Social Media Limits',
        description: 'Use the character counter to ensure your posts fit within Twitter or Instagram bio limits.'
      },
      {
        title: 'Academic Writing',
        description: 'Track your word count progress to meet specific assignment requirements.'
      }
    ]
  }
};
