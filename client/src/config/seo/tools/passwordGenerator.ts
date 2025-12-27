import { ToolSEOConfig } from '../types';

export const passwordGeneratorConfig: ToolSEOConfig = {
  slug: 'password-generator',
  category: 'text',
  title: 'Password Generator - Create Secure Random Passwords | DapsiWow',
  metaDescription: 'Generate strong, secure, and random passwords instantly. Customize length, include symbols, numbers, and uppercase letters. 100% private and client-side.',
  keywords: ['password generator', 'secure password', 'random password', 'strong password', 'password creator'],
  schema: {
    name: 'Secure Password Generator',
    description: 'A professional-grade random password generator that creates highly secure passwords based on your specific requirements.',
    applicationCategory: 'SecurityApplication',
    applicationSubCategory: 'Privacy Tools',
    featureList: [
      'Customizable password length',
      'Toggle symbols, numbers, and casing',
      'Password strength indicator',
      'One-click copy to clipboard',
      'Bulk password generation'
    ]
  },
  howTo: {
    name: 'How to generate a secure password',
    description: 'Create a strong password in seconds with our easy-to-use generator.',
    totalTime: 'PT15S',
    steps: [
      {
        position: 1,
        name: 'Set Preferences',
        text: 'Select your desired password length and choose which characters to include (uppercase, lowercase, numbers, symbols).'
      },
      {
        position: 2,
        name: 'Generate',
        text: 'Click the "Generate Password" button to create a new unique and secure password.'
      },
      {
        position: 3,
        name: 'Copy and Use',
        text: 'Check the password strength and click the copy icon to use it for your account.'
      }
    ]
  },
  faq: [
    {
      question: 'What makes a password strong?',
      answer: 'A strong password is at least 12 characters long and includes a mix of uppercase letters, lowercase letters, numbers, and special symbols.'
    },
    {
      question: 'Are the passwords stored on your server?',
      answer: 'No. All passwords are generated locally in your browser using cryptographically secure random number generators. We never see or store your passwords.'
    },
    {
      question: 'Why should I use a password generator?',
      answer: 'Humans are poor at creating truly random patterns. A generator ensures your password is unpredictable and resistant to brute-force attacks.'
    }
  ],
  relatedTools: ['base64-encoder', 'qr-scanner', 'word-counter'],
  content: {
    introduction: 'In an era of increasing cyber threats, using a unique, complex password for every account is essential. Our Password Generator helps you maintain your digital security with ease.',
    examples: [
      {
        title: 'Strong Password Example',
        description: 'A 16-character password with all options enabled might look like: "k9#Vp2$mR8xL!nQ5".'
      },
      {
        title: 'Simple Secure Password',
        description: 'An alphanumeric password without symbols for legacy systems: "G7t2W9v4M1xP".'
      }
    ]
  }
};
