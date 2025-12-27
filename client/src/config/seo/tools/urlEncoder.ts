import { ToolSEOConfig } from '../types';

export const urlEncoderConfig: ToolSEOConfig = {
  slug: 'url-encoder',
  category: 'text',
  title: 'URL Encoder/Decoder - Percent-Encoding Tool | DapsiWow',
  metaDescription: 'Free online URL encoder and decoder. Convert special characters to percent-encoded format or decode URLs instantly. Safe and secure.',
  keywords: ['url encoder', 'url decoder', 'percent encoding', 'encode url', 'decode url online'],
  schema: {
    name: 'URL Encoder & Decoder',
    description: 'A essential tool for encoding and decoding URLs and URI components safely for web development.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Web Development',
    featureList: [
      'One-click URL encoding',
      'Instant URL decoding',
      'Supports special characters',
      'Copy to clipboard feature',
      '100% client-side processing'
    ]
  },
  howTo: {
    name: 'How to encode or decode a URL',
    description: 'Follow these simple steps to process your URLs.',
    totalTime: 'PT15S',
    steps: [
      {
        position: 1,
        name: 'Paste URL',
        text: 'Enter the URL or text you want to encode/decode into the input field.'
      },
      {
        position: 2,
        name: 'Select Action',
        text: 'Click "Encode" to safely mask special characters, or "Decode" to return to original text.'
      },
      {
        position: 3,
        name: 'Get Results',
        text: 'The processed URL will appear in the result box. Copy it for use in your code or browser.'
      }
    ]
  },
  faq: [
    {
      question: 'Why do URLs need encoding?',
      answer: 'URLs can only contain a limited set of ASCII characters. Special characters like spaces or symbols must be "percent-encoded" to be safely transmitted.'
    },
    {
      question: 'Is it safe to use this tool for sensitive links?',
      answer: 'Yes, because the conversion happens locally in your browser. We never store or transmit your URLs to any server.'
    }
  ],
  relatedTools: ['base64-encoder', 'json-formatter', 'word-counter'],
  content: {
    introduction: 'Percent-encoding, also known as URL encoding, is a mechanism for encoding information in a Uniform Resource Identifier (URI). This tool makes the process effortless.',
    examples: [
      {
        title: 'Encoding a Search Query',
        description: '"hello world!" becomes "hello%20world%21" for safe use in a URL.'
      },
      {
        title: 'Decoding a Tracking Link',
        description: 'Decode a complex marketing link to see its original destination and parameters.'
      }
    ]
  }
};
