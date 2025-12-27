import { ToolSEOConfig } from '../types';

export const markdownEditorConfig: ToolSEOConfig = {
  slug: 'markdown-editor',
  category: 'text',
  title: 'Markdown Editor - Real-time Preview & Editor | DapsiWow',
  metaDescription: 'Free online Markdown editor with live preview. Write, format, and export Markdown text instantly. Secure and client-side processing.',
  keywords: ['markdown editor', 'online markdown', 'markdown preview', 'write markdown', 'md editor'],
  schema: {
    name: 'Live Markdown Editor',
    description: 'A professional-grade Markdown editor with side-by-side live preview and formatting tools.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Text Processing',
    featureList: [
      'Side-by-side live preview',
      'Common formatting toolbar',
      'Export to HTML',
      'One-click copy to clipboard',
      'Secure local-only editing'
    ]
  },
  howTo: {
    name: 'How to use Markdown Editor',
    description: 'Follow these steps to write and preview Markdown.',
    totalTime: 'PT15S',
    steps: [
      {
        position: 1,
        name: 'Start Writing',
        text: 'Type your Markdown content into the editor on the left side.'
      },
      {
        position: 2,
        name: 'Check Preview',
        text: 'Watch the rendered HTML preview update in real-time on the right side.'
      },
      {
        position: 3,
        name: 'Export or Copy',
        text: 'Use the toolbar to copy the raw Markdown or export the final HTML.'
      }
    ]
  },
  faq: [
    {
      question: 'Is my data saved?',
      answer: 'We don\'t save your data on our servers. Your content stays in your browser session for maximum privacy.'
    },
    {
      question: 'Can I export to PDF?',
      answer: 'Yes, you can copy the HTML output or use your browser\'s print-to-PDF feature from the preview window.'
    }
  ],
  relatedTools: ['word-counter', 'base64-encoder', 'case-converter'],
  content: {
    introduction: 'Markdown is the web\'s most popular formatting language. Our editor makes it easy to write and preview your content before publishing to GitHub, Reddit, or your blog.',
    examples: [
      {
        title: 'Creating a README',
        description: 'Format headings, lists, and code blocks for your project documentation.'
      },
      {
        title: 'Blog Post Drafting',
        description: 'Draft your next article with simple syntax and see how it will look when published.'
      }
    ]
  }
};
