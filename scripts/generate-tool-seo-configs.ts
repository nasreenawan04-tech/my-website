import fs from 'fs';
import path from 'path';
import { tools } from '../client/src/data/tools.js';

type Tool = typeof tools[0];

interface ContentLibrary {
  titles: string[];
  metaHooks: string[];
  howToTemplates: Array<{
    name: string;
    description: string;
    steps: Array<{ name: string; text: string }>;
  }>;
  faqTemplates: Array<{ question: string; answer: string }>;
  features: string[];
  examples: Array<{ title: string; description: string }>;
}

const FINANCE_LIBRARY: ContentLibrary = {
  titles: [
    '{name} - Calculate {metric} Instantly | DapsiWow',
    '{name} - Free {metric} Calculator | DapsiWow',
    '{name} - {metric} Estimation Tool | DapsiWow',
  ],
  metaHooks: [
    'Calculate {metric} instantly with our free {toolType}.',
    'Free {toolType} for accurate {metric} calculation.',
    'Get precise {metric} estimates with our {toolType}.',
  ],
  howToTemplates: [
    {
      name: 'How to Use the {name}',
      description: 'Calculate {metric} in just 3 simple steps using our free online tool.',
      steps: [
        {
          name: 'Enter Your Values',
          text: 'Input the required values for your calculation. All fields are clearly labeled to help you understand what information is needed.'
        },
        {
          name: 'Review Options',
          text: 'Adjust any additional settings or options that apply to your specific situation. Our tool provides flexible parameters to match your exact needs.'
        },
        {
          name: 'View Results',
          text: 'Click "Calculate" to instantly see your results. Get detailed breakdowns, charts, and actionable insights based on your inputs.'
        }
      ]
    }
  ],
  faqTemplates: [
    {
      question: 'How accurate is this {toolType}?',
      answer: 'Our {toolType} uses industry-standard formulas and calculations to provide highly accurate results. However, actual outcomes may vary based on your specific situation and market conditions. Always consult with a financial professional for personalized advice.'
    },
    {
      question: 'Is this {toolType} really free to use?',
      answer: 'Yes! Our {toolType} is completely free with no hidden fees, registration requirements, or premium tiers. We believe financial tools should be accessible to everyone.'
    },
    {
      question: 'Do you store my financial data?',
      answer: 'No. All calculations happen locally in your browser. We do not transmit, store, or share any of your financial information. Your privacy and security are our top priorities.'
    },
    {
      question: 'Can I use this {toolType} on my mobile device?',
      answer: 'Absolutely! Our {toolType} is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Calculate {metric} anywhere, anytime.'
    },
    {
      question: 'How often is this {toolType} updated?',
      answer: 'We regularly update our tools to ensure accuracy and incorporate the latest financial regulations, formulas, and best practices. Our {toolType} reflects current industry standards.'
    },
  ],
  features: [
    'Instant calculations with real-time results',
    'Detailed breakdowns and visual charts',
    'Print and share functionality',
    'No registration or sign-up required',
    'Completely free - no hidden fees',
    'Works on all devices',
    'Privacy-first - no data storage',
    'Professional-grade accuracy',
  ],
  examples: [],
};

const TEXT_LIBRARY: ContentLibrary = {
  titles: [
    '{name} - Free Online {function} | DapsiWow',
    '{name} - {function} Tool | DapsiWow',
    'Free {name} - {function} Online | DapsiWow',
  ],
  metaHooks: [
    '{function} instantly with our free online {toolType}.',
    'Professional {toolType} for {function}.',
    'Free {function} tool - no signup required.',
  ],
  howToTemplates: [
    {
      name: 'How to Use the {name}',
      description: '{function} in seconds with our simple, intuitive tool.',
      steps: [
        {
          name: 'Input Your Text',
          text: 'Paste or type the text you want to process into the input area. Our tool handles any length of text efficiently.'
        },
        {
          name: 'Select Options',
          text: 'Choose any formatting or processing options that apply to your needs. Customize the output to match your requirements.'
        },
        {
          name: 'Get Results',
          text: 'Click the action button to instantly process your text. Copy, download, or share your results with ease.'
        }
      ]
    }
  ],
  faqTemplates: [
    {
      question: 'Is this {toolType} free to use?',
      answer: 'Yes! Our {toolType} is completely free with no limits, registration, or hidden charges. Use it as many times as you need.'
    },
    {
      question: 'What is the maximum text length I can process?',
      answer: 'Our {toolType} can handle large amounts of text efficiently. For optimal performance, we support text up to 1 million characters.'
    },
    {
      question: 'Do you save or store my text?',
      answer: 'No. All text processing happens locally in your browser. We do not upload, store, or have access to any text you process. Your content remains completely private.'
    },
    {
      question: 'Can I use this tool offline?',
      answer: 'Our {toolType} requires an internet connection to load initially, but once loaded, most processing happens in your browser. This means processing is fast and your data stays private.'
    },
    {
      question: 'What browsers are supported?',
      answer: 'Our {toolType} works on all modern browsers including Chrome, Firefox, Safari, and Edge. It also works perfectly on mobile devices.'
    },
  ],
  features: [
    'Instant processing - no waiting',
    'No file size limits',
    'Copy results with one click',
    'Download processed text',
    'No registration required',
    'Completely free forever',
    'Privacy-first - no data upload',
    'Works on all devices',
  ],
  examples: [],
};

const HEALTH_LIBRARY: ContentLibrary = {
  titles: [
    '{name} - Track Your {metric} | DapsiWow',
    '{name} - Calculate {metric} | DapsiWow',
    'Free {name} - {metric} Analysis | DapsiWow',
  ],
  metaHooks: [
    'Calculate your {metric} with our free, science-based {toolType}.',
    'Track your {metric} and get personalized insights.',
    'Free {toolType} based on scientific research and medical guidelines.',
  ],
  howToTemplates: [
    {
      name: 'How to Calculate {metric}',
      description: 'Get your {metric} results in 3 easy steps using our scientifically-validated calculator.',
      steps: [
        {
          name: 'Enter Your Information',
          text: 'Provide the required measurements and details. All inputs are kept private and processed locally in your browser.'
        },
        {
          name: 'Review Your Profile',
          text: 'Confirm your information is accurate. Adjust any settings or parameters that apply to your specific situation.'
        },
        {
          name: 'View Your Results',
          text: 'Get instant results with detailed explanations, health ranges, and personalized recommendations based on scientific guidelines.'
        }
      ]
    }
  ],
  faqTemplates: [
    {
      question: 'How accurate is this {toolType}?',
      answer: 'Our {toolType} uses scientifically validated formulas and follows current medical guidelines. However, results are estimates and should not replace professional medical advice. Always consult with a healthcare provider for personalized health assessments.'
    },
    {
      question: 'Is my health data kept private?',
      answer: 'Absolutely. All calculations happen locally in your browser. We do not collect, store, or transmit any of your personal health information. Your privacy is completely protected.'
    },
    {
      question: 'Should I consult a doctor about my results?',
      answer: 'Yes. While our {toolType} provides accurate estimates based on standard formulas, only a qualified healthcare professional can give you personalized medical advice. Use these results as a starting point for discussions with your doctor.'
    },
    {
      question: 'How often should I recalculate my {metric}?',
      answer: 'This depends on your health goals. Generally, recalculating monthly or quarterly can help you track progress. However, for specific guidance, consult with a healthcare professional.'
    },
    {
      question: 'Is this {toolType} suitable for children?',
      answer: 'Some health calculators use different formulas for children and adults. Check the tool description to see if it includes pediatric calculations. For children\'s health assessments, always consult with a pediatrician.'
    },
  ],
  features: [
    'Science-based calculations',
    'Instant results with explanations',
    'Health range comparisons',
    'Personalized recommendations',
    'No registration needed',
    'Completely free',
    'Privacy-protected - no data collection',
    'Mobile-friendly',
  ],
  examples: [],
};

function getLibraryForCategory(category: string): ContentLibrary {
  switch (category) {
    case 'finance':
      return FINANCE_LIBRARY;
    case 'text':
      return TEXT_LIBRARY;
    case 'health':
      return HEALTH_LIBRARY;
    default:
      return FINANCE_LIBRARY;
  }
}

function extractMetric(toolName: string, category: string): string {
  const name = toolName.toLowerCase();
  
  if (category === 'finance') {
    if (name.includes('loan') || name.includes('mortgage')) return 'monthly payments';
    if (name.includes('interest')) return 'interest';
    if (name.includes('roi') || name.includes('return')) return 'return on investment';
    if (name.includes('tax')) return 'tax amount';
    if (name.includes('tip')) return 'tip amount';
    if (name.includes('savings')) return 'savings goals';
    if (name.includes('debt')) return 'debt payoff time';
    if (name.includes('retirement')) return 'retirement needs';
    return 'financial metrics';
  }
  
  if (category === 'health') {
    if (name.includes('bmi')) return 'BMI';
    if (name.includes('calorie')) return 'calorie needs';
    if (name.includes('body fat')) return 'body fat percentage';
    if (name.includes('bmr')) return 'BMR';
    if (name.includes('tdee')) return 'TDEE';
    if (name.includes('water')) return 'water intake';
    if (name.includes('protein')) return 'protein needs';
    return 'health metrics';
  }
  
  return 'results';
}

function extractFunction(toolName: string): string {
  const name = toolName.toLowerCase();
  
  if (name.includes('counter')) return 'Count text elements';
  if (name.includes('converter') || name.includes('convert')) return 'Convert text format';
  if (name.includes('generator') || name.includes('generate')) return 'Generate text';
  if (name.includes('encoder') || name.includes('decoder')) return 'Encode/decode text';
  if (name.includes('formatter') || name.includes('beautifier')) return 'Format text';
  if (name.includes('case')) return 'Change text case';
  if (name.includes('reverse')) return 'Reverse text';
  if (name.includes('remove')) return 'Remove duplicates';
  
  return 'Process text';
}

function getRelatedTools(tool: Tool, allTools: Tool[]): string[] {
  const sameCategoryTools = allTools
    .filter(t => t.category === tool.category && t.id !== tool.id);
  
  const shuffled = sameCategoryTools.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6).map(t => t.id);
}

function generateSEOConfig(tool: Tool, allTools: Tool[]): string {
  const library = getLibraryForCategory(tool.category);
  const metric = extractMetric(tool.name, tool.category);
  const toolType = tool.category === 'text' ? 'tool' : 'calculator';
  const func = tool.category === 'text' ? extractFunction(tool.name) : '';
  
  const titleTemplate = library.titles[0];
  const metaHookTemplate = library.metaHooks[0];
  const howTo = library.howToTemplates[0];
  
  const title = titleTemplate
    .replace('{name}', tool.name)
    .replace('{metric}', metric)
    .replace('{function}', func);
  
  const metaHook = metaHookTemplate
    .replace('{metric}', metric)
    .replace('{toolType}', toolType)
    .replace('{function}', func);
  
  const metaDescription = `${metaHook} Get instant results, detailed insights, and professional-grade accuracy. No registration required. Try now!`;
  
  const slug = tool.id;
  const relatedTools = getRelatedTools(tool, allTools);
  
  const keywords = [
    tool.name.toLowerCase(),
    `${tool.name.toLowerCase()} online`,
    `free ${tool.name.toLowerCase()}`,
    metric,
    toolType,
  ];
  
  const howToName = howTo.name.replace('{name}', tool.name).replace('{metric}', metric);
  const howToDesc = howTo.description.replace('{metric}', metric).replace('{function}', func);
  
  const faqs = library.faqTemplates.slice(0, 10).map(faq => ({
    question: faq.question.replace('{toolType}', toolType).replace('{metric}', metric),
    answer: faq.answer.replace('{toolType}', toolType).replace('{metric}', metric).replace('{function}', func),
  }));
  
  const features = library.features.slice(0, 10);
  
  const appCategory = tool.category === 'finance' ? 'FinanceApplication' 
    : tool.category === 'health' ? 'HealthApplication' 
    : 'UtilitiesApplication';
  
  return `import { ToolSEOConfig } from '../types';

export const ${toCamelCase(tool.id)}SEO: ToolSEOConfig = {
  slug: '${slug}',
  category: '${tool.category}',
  title: '${escapeQuotes(title)}',
  metaDescription: '${escapeQuotes(metaDescription)}',
  keywords: ${JSON.stringify(keywords, null, 4)},
  
  schema: {
    name: '${escapeQuotes(tool.name)}',
    alternateName: ${JSON.stringify([tool.name, `Online ${tool.name}`, `Free ${tool.name}`], null, 6)},
    description: '${escapeQuotes(tool.description)}. Free online ${toolType} with instant results.',
    applicationCategory: '${appCategory}',
    applicationSubCategory: '${tool.name}',
    featureList: ${JSON.stringify(features, null, 6)}
  },
  
  howTo: {
    name: '${escapeQuotes(howToName)}',
    description: '${escapeQuotes(howToDesc)}',
    totalTime: 'PT2M',
    steps: [
      {
        position: 1,
        name: '${escapeQuotes(howTo.steps[0].name)}',
        text: '${escapeQuotes(howTo.steps[0].text)}'
      },
      {
        position: 2,
        name: '${escapeQuotes(howTo.steps[1].name)}',
        text: '${escapeQuotes(howTo.steps[1].text)}'
      },
      {
        position: 3,
        name: '${escapeQuotes(howTo.steps[2].name)}',
        text: '${escapeQuotes(howTo.steps[2].text)}'
      }
    ]
  },
  
  faq: ${JSON.stringify(faqs, null, 4)},
  
  relatedTools: ${JSON.stringify(relatedTools, null, 4)},
  
  content: {
    introduction: '${escapeQuotes(tool.description)}. Our free ${tool.name.toLowerCase()} provides instant, accurate results with no registration required.',
    formula: 'Uses industry-standard calculations and formulas.',
    comparison: 'Unlike other tools, ours is completely free, requires no registration, and prioritizes your privacy.',
    examples: []
  }
};
`;
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/-/g, '');
}

function escapeQuotes(str: string): string {
  return str.replace(/'/g, "\\'");
}

function main() {
  console.log(`Found ${tools.length} tools`);
  
  const configsDir = path.join(process.cwd(), 'client/src/config/seo/tools');
  if (!fs.existsSync(configsDir)) {
    fs.mkdirSync(configsDir, { recursive: true });
  }
  
  let indexContent = '';
  
  tools.forEach((tool, index) => {
    const configContent = generateSEOConfig(tool, tools);
    const fileName = `${tool.id}.ts`;
    const filePath = path.join(configsDir, fileName);
    
    fs.writeFileSync(filePath, configContent);
    console.log(`Generated ${index + 1}/${tools.length}: ${fileName}`);
    
    const varName = toCamelCase(tool.id) + 'SEO';
    indexContent += `export { ${varName} } from './${tool.id}';\n`;
  });
  
  const indexPath = path.join(configsDir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`\nGenerated index.ts with ${tools.length} exports`);
  
  console.log('\nSEO config generation complete!');
}

main();
