import { ToolSEOConfig } from '../types';

export const jsonFormatterConfig: ToolSEOConfig = {
  slug: 'json-formatter',
  category: 'text',
  title: 'JSON Formatter & Validator - Pretty Print JSON | DapsiWow',
  metaDescription: 'Free online JSON formatter, validator, and pretty-printer. Clean up messy JSON, find syntax errors, and export formatted code instantly.',
  keywords: ['json formatter', 'json validator', 'pretty print json', 'json cleaner', 'format json online'],
  schema: {
    name: 'Professional JSON Formatter',
    description: 'A robust tool for developers to format, validate, and beautify JSON data in real-time.',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Data Tools',
    featureList: [
      'One-click JSON beautification',
      'Real-time syntax validation',
      'Customizable indentation levels',
      'Minification and cleanup',
      '100% private client-side tool'
    ]
  },
  howTo: {
    name: 'How to format JSON online',
    description: 'Follow these steps to clean and validate your JSON data.',
    totalTime: 'PT20S',
    steps: [
      {
        position: 1,
        name: 'Paste JSON',
        text: 'Paste your raw or messy JSON string into the editor window.'
      },
      {
        position: 2,
        name: 'Auto-Format',
        text: 'The tool will instantly identify syntax errors and format the data for readability.'
      },
      {
        position: 3,
        name: 'Adjust and Copy',
        text: 'Choose your preferred indentation level and click copy to use the formatted JSON.'
      }
    ]
  },
  faq: [
    {
      question: 'Is my JSON data kept private?',
      answer: 'Yes. Our formatter works entirely in your browser. Your sensitive JSON data never leaves your computer.'
    },
    {
      question: 'Can it detect syntax errors?',
      answer: 'Absolutely. If your JSON is invalid, the validator will highlight the exact line and character where the error occurred.'
    },
    {
      question: 'What is pretty printing?',
      answer: 'Pretty printing is the process of adding indentation and line breaks to raw data to make it readable for humans.'
    }
  ],
  relatedTools: ['base64-encoder', 'password-generator', 'word-counter'],
  content: {
    introduction: 'Wrestling with unreadable API responses? Our JSON Formatter turns single-line minified code into clear, hierarchical data structures.',
    examples: [
      {
        title: 'Formatting API Results',
        description: 'Turn a complex API response into a readable format to better understand the data structure.'
      },
      {
        title: 'Validating Configurations',
        description: 'Ensure your JSON configuration files are syntax-error free before deploying your code.'
      }
    ]
  }
};
