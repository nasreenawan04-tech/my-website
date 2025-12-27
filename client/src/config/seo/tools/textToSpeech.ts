import { ToolSEOConfig } from '../types';

export const textToSpeechConfig: ToolSEOConfig = {
  slug: 'text-to-speech',
  category: 'text',
  title: 'Text to Speech - Online TTS Reader | DapsiWow',
  metaDescription: 'Convert text to natural-sounding speech instantly. Free online text-to-speech reader with multiple voices and playback control. 100% browser-based.',
  keywords: ['text to speech', 'tts reader', 'online voice reader', 'convert text to audio', 'speech synthesizer'],
  schema: {
    name: 'Online Text to Speech Reader',
    description: 'A high-quality text-to-speech engine that converts written content into spoken audio using browser-native voices.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Accessibility Tools',
    featureList: [
      'Natural-sounding voices',
      'Adjustable reading speed',
      'Voice selection options',
      'Highlighting of current text',
      '100% private client-side tool'
    ]
  },
  howTo: {
    name: 'How to use text to speech',
    description: 'Follow these steps to listen to your text.',
    totalTime: 'PT20S',
    steps: [
      {
        position: 1,
        name: 'Paste Content',
        text: 'Enter or paste the text you want to hear into the main editor.'
      },
      {
        position: 2,
        name: 'Select Voice',
        text: 'Choose your preferred voice and adjust the reading speed from the settings menu.'
      },
      {
        position: 3,
        name: 'Play Audio',
        text: 'Click the "Play" button to start the text-to-speech conversion and listen to the output.'
      }
    ]
  },
  faq: [
    {
      question: 'Are there different language voices available?',
      answer: 'Yes, our tool uses your browser\'s native speech synthesis engine, which typically includes multiple languages and regional accents.'
    },
    {
      question: 'Is there a limit to the text length?',
      answer: 'While browsers have varying limits, our tool is optimized for reading articles, documents, and long passages of text efficiently.'
    }
  ],
  relatedTools: ['word-counter', 'markdown-editor', 'case-converter'],
  content: {
    introduction: 'Need to proofread an essay or listen to an article while multitasking? Our Text to Speech tool provides an accessible way to consume written content.',
    examples: [
      {
        title: 'Proofreading via Listening',
        description: 'Listen to your own writing to catch awkward phrasing and grammatical errors that are easier to hear than see.'
      },
      {
        title: 'Accessibility Support',
        description: 'Provide an alternative way for users with visual impairments or reading difficulties to access text content.'
      }
    ]
  }
};
