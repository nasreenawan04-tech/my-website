import { ToolSEOConfig } from '../types';

export const base64EncoderConfig: ToolSEOConfig = {
  slug: 'base64-encoder',
  category: 'text',
  title: 'Base64 Encoder/Decoder - Encode & Decode Online | DapsiWow',
  metaDescription: 'Free online Base64 encoder and decoder. Convert text to Base64 format or decode Base64 strings instantly. Secure, fast, and 100% client-side tool.',
  keywords: ['base64 encoder', 'base64 decoder', 'base64 convert', 'online base64', 'text to base64'],
  schema: {
    name: 'Base64 Encoder/Decoder',
    description: 'A versatile tool for encoding text to Base64 and decoding Base64 strings back to plain text.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Text Processing',
    featureList: [
      'Instant Base64 encoding',
      'One-click Base64 decoding',
      'Copy to clipboard functionality',
      '100% browser-based security',
      'Support for multiple character sets'
    ]
  },
  howTo: {
    name: 'How to use Base64 Encoder/Decoder',
    description: 'Follow these simple steps to encode or decode your text using our Base64 tool.',
    totalTime: 'PT30S',
    steps: [
      {
        position: 1,
        name: 'Enter Text',
        text: 'Type or paste the text you want to encode or the Base64 string you want to decode into the input area.'
      },
      {
        position: 2,
        name: 'Choose Action',
        text: 'Click on the "Encode" button to convert text to Base64, or the "Decode" button to convert Base64 back to text.'
      },
      {
        position: 3,
        name: 'Get Results',
        text: 'The result will appear instantly in the output field. Use the copy button to save it to your clipboard.'
      }
    ]
  },
  faq: [
    {
      question: 'What is Base64 encoding?',
      answer: 'Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format by translating it into a radix-64 representation.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, our Base64 tool works entirely in your browser. No data is sent to our servers, ensuring your information remains private.'
    },
    {
      question: 'Can I decode any Base64 string?',
      answer: 'As long as the string is a valid Base64 encoded format, our tool can decode it back to its original text form.'
    }
  ],
  relatedTools: ['password-generator', 'word-counter', 'qr-scanner'],
  content: {
    introduction: 'Base64 encoding is widely used when there is a need to encode binary data that needs to be stored and transferred over media that are designed to deal with textual data. This encoder/decoder makes the process simple and secure.',
    examples: [
      {
        title: 'Encoding "Hello World"',
        description: 'Encoding the string "Hello World" results in "SGVsbG8gV29ybGQ=".'
      },
      {
        title: 'Decoding "RGFwc2lXb3c="',
        description: 'Decoding the Base64 string "RGFwc2lXb3c=" results in "DapsiWow".'
      }
    ]
  }
};
