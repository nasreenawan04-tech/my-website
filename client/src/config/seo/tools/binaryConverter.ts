import { ToolSEOConfig } from '../types';

export const binaryConverterConfig: ToolSEOConfig = {
  slug: 'binary-converter',
  category: 'text',
  title: 'Binary Converter - Text to Binary & Back | DapsiWow',
  metaDescription: 'Convert text to binary and binary to text instantly. Free online binary translator with secure, client-side processing.',
  keywords: ['binary converter', 'text to binary', 'binary to text', 'binary translator', 'binary code'],
  schema: {
    name: 'Binary Code Converter',
    description: 'A fast and secure tool for translating between plain text and binary code (0s and 1s).',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Data Conversion',
    featureList: [
      'Text to binary conversion',
      'Binary to text translation',
      'Real-time processing',
      'One-click copy and clear',
      '100% private client-side tool'
    ]
  },
  howTo: {
    name: 'How to convert text to binary',
    description: 'Follow these simple steps to translate your text into binary code.',
    totalTime: 'PT10S',
    steps: [
      {
        position: 1,
        name: 'Input Data',
        text: 'Paste your text or binary code into the input area.'
      },
      {
        position: 2,
        name: 'Auto-Translate',
        text: 'The tool will automatically detect the input type and show the conversion result.'
      },
      {
        position: 3,
        name: 'Copy Result',
        text: 'Click the copy button to save the binary code or translated text to your clipboard.'
      }
    ]
  },
  faq: [
    {
      question: 'What is binary code?',
      answer: 'Binary is a base-2 numbering system that uses only two digits: 0 and 1. It is the fundamental language of computers.'
    },
    {
      question: 'How does text to binary work?',
      answer: 'Each character in your text is converted to its ASCII/Unicode numerical value, which is then represented as an 8-bit binary string.'
    }
  ],
  relatedTools: ['base64-encoder', 'password-generator', 'word-counter'],
  content: {
    introduction: 'Understanding how computers communicate can be fascinating. Our binary converter bridge the gap between human language and machine code.',
    examples: [
      {
        title: 'Binary "ABC"',
        description: 'The letters "ABC" in binary are represented as: "01000001 01000010 01000011".'
      },
      {
        title: 'Binary Secret Message',
        description: 'Encode a short note into binary for a fun and educational technical exercise.'
      }
    ]
  }
};
