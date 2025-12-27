import { ToolSEOConfig } from '../types';

export const qrScannerConfig: ToolSEOConfig = {
  slug: 'qr-scanner',
  category: 'text',
  title: 'Online QR Code Scanner - Scan QR Codes from Images | DapsiWow',
  metaDescription: 'Free online QR code scanner. Scan and decode QR codes from images, webcams, or your phone gallery. 100% private and secure client-side scanning.',
  keywords: ['qr code scanner', 'scan qr code', 'online qr scanner', 'qr code reader', 'decode qr code'],
  schema: {
    name: 'Online QR Code Scanner',
    description: 'A powerful and secure QR code scanner that works entirely in your browser, allowing you to decode QR codes from files or live cameras.',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Scanning Tools',
    featureList: [
      'Scan from image files',
      'Real-time webcam scanning',
      'Supports all standard QR formats',
      'Instant URL detection',
      '100% client-side processing'
    ]
  },
  howTo: {
    name: 'How to scan a QR code online',
    description: 'Quickly decode any QR code using your device camera or an image file.',
    totalTime: 'PT20S',
    steps: [
      {
        position: 1,
        name: 'Choose Input Method',
        text: 'Select either "Upload Image" to scan a file from your device or "Use Camera" for real-time scanning.'
      },
      {
        position: 2,
        name: 'Point or Upload',
        text: 'Either upload your QR code image or point your camera at the code until it is recognized.'
      },
      {
        position: 3,
        name: 'View Result',
        text: 'The decoded information or link will appear instantly. You can click links directly or copy the text.'
      }
    ]
  },
  faq: [
    {
      question: 'Is it safe to scan QR codes here?',
      answer: 'Yes. Our scanner processes images locally on your device. We do not store or transmit your camera feed or uploaded images to any server.'
    },
    {
      question: 'Can I scan a QR code from my phone?',
      answer: 'Absolutely. DapsiWow is fully responsive and works perfectly on mobile browsers to scan QR codes using your phone\'s camera.'
    },
    {
      question: 'What types of data can be decoded?',
      answer: 'Our scanner can decode URLs, plain text, contact information (vCards), Wi-Fi credentials, and more.'
    }
  ],
  relatedTools: ['password-generator', 'base64-encoder', 'word-counter'],
  content: {
    introduction: 'QR codes are everywhere, from menus to marketing. Our Online QR Code Scanner provides a frictionless way to access the information behind them without needing to download a dedicated app.',
    examples: [
      {
        title: 'Scanning a Menu',
        description: 'Upload a photo of a restaurant QR code to instantly view their online menu link.'
      },
      {
        title: 'Connecting to Wi-Fi',
        description: 'Scan a Wi-Fi QR code to quickly see the network name and password.'
      }
    ]
  }
};
