import { CategoryDefaults } from './types';

export const CATEGORY_DEFAULTS: Record<string, CategoryDefaults> = {
  finance: {
    titlePattern: '{toolName} - {action} {benefit} | DapsiWow',
    metaDescriptionPattern: '{hook} {description} {features} {social} {cta}',
    schemaDefaults: {
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any (Web-based)',
      browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      }
    }
  },
  health: {
    titlePattern: '{toolName} - {metric} {purpose} | DapsiWow',
    metaDescriptionPattern: '{hook} {description} {features} {social} {cta}',
    schemaDefaults: {
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Any (Web-based)',
      browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      }
    }
  },
  text: {
    titlePattern: '{toolName} - Free Online {function} | DapsiWow',
    metaDescriptionPattern: '{hook} {description} {features} {social} {cta}',
    schemaDefaults: {
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (Web-based)',
      browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
      offers: {
        price: '0',
        priceCurrency: 'USD'
      }
    }
  }
};

export const COMMON_META_TAGS = {
  author: 'DapsiWow Team',
  publisher: 'DapsiWow',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  distribution: 'global',
  language: 'English',
  rating: 'General',
  copyright: '© 2025 DapsiWow. All rights reserved.',
  themeColor: '#3b82f6',
  applicationName: 'DapsiWow Tools'
};

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DapsiWow',
  url: 'https://dapsiwow.com/',
  logo: 'https://dapsiwow.com/logo.svg',
  description: 'Professional online tools platform offering 23 free utilities for business and personal use including finance calculators, text converters, and health trackers.',
  foundingDate: '2025',
  slogan: 'Free Finance, Text, Health and other Online Tools',
  knowsAbout: [
    'Financial Calculators',
    'Text Processing Tools',
    'Health Calculators',
    'Online Utilities',
    'Productivity Tools'
  ],
  sameAs: [
    'https://dapsiwow.com/about',
    'https://dapsiwow.com/contact'
  ]
};
