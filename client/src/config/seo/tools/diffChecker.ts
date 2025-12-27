import { ToolSEOConfig } from '../types';

export const diffCheckerConfig: ToolSEOConfig = {
  slug: 'diff-checker',
  category: 'text',
  title: 'Diff Checker - Compare Text & Find Differences | DapsiWow',
  metaDescription: 'Free online text comparison tool. Find differences between two blocks of text or code instantly with side-by-side highlighting.',
  keywords: ['diff checker', 'text compare', 'compare text online', 'code diff', 'difference checker'],
  schema: {
    name: 'Professional Diff Checker',
    description: 'A powerful tool for identifying differences and similarities between two text or code files.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Text Processing',
    featureList: [
      'Side-by-side text comparison',
      'Inline difference highlighting',
      'Line-by-line analysis',
      'Large text support',
      '100% private client-side comparison'
    ]
  },
  howTo: {
    name: 'How to compare text online',
    description: 'Find differences between two texts in seconds.',
    totalTime: 'PT30S',
    steps: [
      {
        position: 1,
        name: 'Enter Original Text',
        text: 'Paste your original or "before" text into the left editor window.'
      },
      {
        position: 2,
        name: 'Enter Modified Text',
        text: 'Paste the modified or "after" text into the right editor window.'
      },
      {
        position: 3,
        name: 'Analyze Diff',
        text: 'The tool will automatically highlight added, removed, and modified lines for easy review.'
      }
    ]
  },
  faq: [
    {
      question: 'Can I compare source code?',
      answer: 'Yes, our diff checker works perfectly with any plain text, including programming languages like JavaScript, Python, and HTML.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. The comparison logic runs entirely in your browser session. Your texts are never uploaded to our servers.'
    }
  ],
  relatedTools: ['word-counter', 'json-formatter', 'case-converter'],
  content: {
    introduction: 'Manually looking for changes in long documents is error-prone and tedious. Our Diff Checker automates the process with clear visual feedback.',
    examples: [
      {
        title: 'Code Review',
        description: 'Compare two versions of a function to see exactly what changes were made during a refactor.'
      },
      {
        title: 'Document Revision',
        description: 'Check a new draft of an article against the previous version to track edits and removals.'
      }
    ]
  }
};
