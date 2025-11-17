const soft404Urls = [
  '/tdee-calculator',
  '/extract-pdf-pages',
  '/swimming-calorie-calculator',
  '/organize-pdf',
  '/retirement-calculator',
  '/username-generator',
  '/pdf-form-extractor',
  '/keto-macro-calculator',
  '/unlock-pdf',
  '/stock-profit-calculator',
  '/debt-payoff-calculator',
  '/tools/currency-converter',
  '/bmr-calculator',
  '/pdf-permission-manager',
  '/text-to-qr-code',
  '/baby-growth-chart',
  '/running-pace-calculator',
  '/body-fat-calculator',
  '/reverse-text-tool',
  '/character-counter',
  '/tax-calculator',
  '/emi-calculator',
  '/savings-goal-calculator',
  '/terms-of-service',
  '/tip-calculator',
  '/daily-step-calorie-converter',
  '/all-tools',
  '/investment-return-calculator',
  '/pdf-compliance-checker',
  '/pdf-header-footer',
  '/add-page-numbers',
  '/whr-calculator',
  '/business-loan-calculator',
  '/percentage-calculator',
  '/roi-calculator',
  '/pdf-page-resizer',
  '/water-intake-calculator',
  '/smoking-cost-calculator',
  '/protect-pdf',
  '/merge-pdf',
  '/tools/cryptocurrency-converter',
  '/pdf-repair-tool',
  '/password-generator',
  '/waist-to-height-ratio-calculator',
  '/fake-address-generator',
  '/qr-code-scanner',
  '/font-style-changer',
  '/privacy-policy',
  '/vat-gst-calculator',
  '/discount-calculator',
  '/pdf-comparison-tool',
  '/max-heart-rate-calculator',
  '/inflation-calculator',
  '/split-pdf',
  '/alcohol-calorie-calculator',
  '/markdown-to-html',
  '/pregnancy-due-date-calculator',
  '/home-loan-calculator',
  '/mortgage-calculator',
  '/calorie-calculator',
  '/rotate-pdf',
  '/sleep-calculator',
  '/finance-tools',
  '/heart-rate-calculator',
  '/net-worth-calculator',
  '/blood-pressure-tracker',
  '/pdf-margin-adjuster',
  '/pdf-link-extractor',
  '/salary-to-hourly',
  '/life-expectancy-calculator',
  '/qr-text-generator',
  '/images-to-pdf',
  '/credit-card-interest-calculator',
  '/pdf-to-images-enhanced',
  '/car-loan-calculator',
  '/compound-interest',
  '/about-us',
  '/text-tools'
];

// Group by type
const pdfTools = soft404Urls.filter(url => url.includes('pdf'));
const hasToolsPrefix = soft404Urls.filter(url => url.startsWith('/tools/'));
const legacy = soft404Urls.filter(url => !url.startsWith('/tools/') && !url.includes('pdf'));

console.log('PDF Tools (need implementation):');
console.log(pdfTools.join('\n'));
console.log(`\nTotal PDF tools: ${pdfTools.length}`);

console.log('\n\nURLs with /tools/ prefix:');
console.log(hasToolsPrefix.join('\n'));
console.log(`\nTotal: ${hasToolsPrefix.length}`);

console.log('\n\nLegacy URLs (need redirects):');
console.log(legacy.join('\n'));
console.log(`\nTotal legacy: ${legacy.length}`);
