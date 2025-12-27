import { ToolSEOConfig } from '../types';

export const unitConverterConfig: ToolSEOConfig = {
  slug: 'unit-converter',
  category: 'text',
  title: 'Unit Converter - Convert Length, Weight, Area & More | DapsiWow',
  metaDescription: 'Free online unit converter. Convert between metric and imperial units for length, weight, area, volume, and temperature. Fast and 100% client-side.',
  keywords: ['unit converter', 'metric to imperial', 'measurement converter', 'online converter', 'unit conversion tool'],
  schema: {
    name: 'Universal Unit Converter',
    description: 'A comprehensive tool for converting measurements between different units and systems.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Measurement Tools',
    featureList: [
      'Length and distance conversion',
      'Weight and mass translation',
      'Area and volume calculations',
      'Temperature unit conversion',
      'Instant real-time results'
    ]
  },
  howTo: {
    name: 'How to convert units online',
    description: 'Follow these steps to transform measurements between different units.',
    totalTime: 'PT15S',
    steps: [
      {
        position: 1,
        name: 'Select Category',
        text: 'Choose the type of measurement you want to convert (e.g., Length, Weight).'
      },
      {
        position: 2,
        name: 'Choose Units',
        text: 'Select your "From" and "To" units from the dropdown menus.'
      },
      {
        position: 3,
        name: 'Enter Value',
        text: 'Type the value you want to convert, and the result will appear instantly.'
      }
    ]
  },
  faq: [
    {
      question: 'Does this converter support both metric and imperial systems?',
      answer: 'Yes, our tool supports a wide range of units from both the International System of Units (Metric) and the United States Customary System (Imperial).'
    },
    {
      question: 'How accurate is the conversion?',
      answer: 'Our conversion factors are based on standard international definitions to ensure high precision for all your calculations.'
    }
  ],
  relatedTools: ['word-counter', 'base64-encoder', 'binary-converter'],
  content: {
    introduction: 'Whether you are working on a DIY project, studying for an exam, or traveling abroad, our Unit Converter provides quick and accurate answers to all your measurement questions.',
    examples: [
      {
        title: 'Kilometers to Miles',
        description: 'Convert a running distance from kilometers to miles for international race planning.'
      },
      {
        title: 'Celsius to Fahrenheit',
        description: 'Quickly check what 25°C is in Fahrenheit for weather reports.'
      }
    ]
  }
};
