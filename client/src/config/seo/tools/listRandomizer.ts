import { ToolSEOConfig } from '../types';

export const listRandomizerConfig: ToolSEOConfig = {
  slug: 'list-randomizer',
  category: 'text',
  title: 'List Randomizer - Shuffle Lists Online | DapsiWow',
  metaDescription: 'Free online list shuffler and randomizer. Shuffle names, items, or any list instantly. Perfect for giveaways, team sorting, and decision making.',
  keywords: ['list randomizer', 'shuffle list', 'random name picker', 'list shuffler', 'randomize items'],
  schema: {
    name: 'Online List Randomizer',
    description: 'A simple and effective tool for shuffling lists and picking items randomly.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Decision Tools',
    featureList: [
      'Instant list shuffling',
      'Random item picker',
      'Handle large lists efficiently',
      'One-click copy to clipboard',
      '100% private client-side tool'
    ]
  },
  howTo: {
    name: 'How to randomize a list',
    description: 'Follow these steps to shuffle your items.',
    totalTime: 'PT10S',
    steps: [
      {
        position: 1,
        name: 'Input List',
        text: 'Paste your list into the input area, with one item per line.'
      },
      {
        position: 2,
        name: 'Shuffle',
        text: 'Click the "Shuffle List" button to randomize the order of your items.'
      },
      {
        position: 3,
        name: 'Copy or Pick',
        text: 'Copy the entire randomized list or use the picker to select a single random winner.'
      }
    ]
  },
  faq: [
    {
      question: 'How random is the shuffling?',
      answer: 'We use the Fisher-Yates shuffle algorithm combined with cryptographically secure random numbers to ensure true randomness.'
    },
    {
      question: 'Can I use this for contest winners?',
      answer: 'Yes, our tool is perfect for randomly selecting names or items for giveaways and contests fairly.'
    }
  ],
  relatedTools: ['password-generator', 'text-reverse', 'word-counter'],
  content: {
    introduction: 'Eliminate bias and save time with our List Randomizer. Whether you are picking a winner or organizing a team, get fair results instantly.',
    examples: [
      {
        title: 'Picking Giveaway Winners',
        description: 'Paste a list of participants and shuffle to find your winners fairly.'
      },
      {
        title: 'Creating Random Teams',
        description: 'Shuffle a list of players and split them into teams for your next event.'
      }
    ]
  }
};
