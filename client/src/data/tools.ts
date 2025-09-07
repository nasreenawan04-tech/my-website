export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'finance' | 'pdf' | 'text' | 'health';
  icon: string;
  isPopular?: boolean;
  href: string;
}

export const categories = {
  finance: 'Finance',
  pdf: 'PDF',
  text: 'Text',
  health: 'Health'
};

const toolsData = [
  // Finance Tools (30)
  { id: 'loan-calculator', name: 'Loan Calculator', description: 'Calculate monthly payments and total interest for any loan', category: 'finance' as const, icon: 'fas fa-calculator', href: '/tools/loan-calculator' },
  { id: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Calculate mortgage payments and compare rates', category: 'finance' as const, icon: 'fas fa-home', href: '/tools/mortgage-calculator' },
  { id: 'emi-calculator', name: 'EMI Calculator', description: 'Calculate Equated Monthly Installments for loans', category: 'finance' as const, icon: 'fas fa-chart-line', href: '/tools/emi-calculator' },
  { id: 'business-loan-calculator', name: 'Business Loan Calculator', description: 'Calculate business loan payments and metrics', category: 'finance' as const, icon: 'fas fa-building', href: '/tools/business-loan-calculator' },
  { id: 'compound-interest', name: 'Compound Interest Calculator', description: 'Calculate compound interest on investments', category: 'finance' as const, icon: 'fas fa-chart-area', href: '/tools/compound-interest' },
  { id: 'simple-interest', name: 'Simple Interest Calculator', description: 'Calculate simple interest on principal amount', category: 'finance' as const, icon: 'fas fa-percent', href: '/tools/simple-interest' },
  { id: 'currency-converter', name: 'Currency Converter', description: 'Convert between different currencies with live rates', category: 'finance' as const, icon: 'fas fa-exchange-alt', isPopular: true, href: '/tools/currency-converter' },
  { id: 'roi-calculator', name: 'ROI Calculator', description: 'Calculate return on investment percentage', category: 'finance' as const, icon: 'fas fa-trending-up', href: '/tools/roi-calculator' },
  { id: 'tax-calculator', name: 'Tax Calculator', description: 'Calculate income tax based on your salary', category: 'finance' as const, icon: 'fas fa-receipt', href: '/tools/tax-calculator' },
  { id: 'salary-hourly', name: 'Salary to Hourly Calculator', description: 'Convert annual salary to hourly wage', category: 'finance' as const, icon: 'fas fa-clock', href: '/tools/salary-to-hourly' },
  { id: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tip amount and split bills', category: 'finance' as const, icon: 'fas fa-hand-holding-usd', href: '/tools/tip-calculator' },
  { id: 'inflation-calculator', name: 'Inflation Calculator', description: 'Calculate inflation impact over time', category: 'finance' as const, icon: 'fas fa-arrow-up', href: '/tools/inflation-calculator' },
  { id: 'savings-goal', name: 'Savings Goal Calculator', description: 'Plan and track your savings goals', category: 'finance' as const, icon: 'fas fa-piggy-bank', href: '/tools/savings-goal-calculator' },
  { id: 'debt-payoff', name: 'Debt Payoff Calculator', description: 'Calculate time to pay off debts', category: 'finance' as const, icon: 'fas fa-credit-card', href: '/tools/debt-payoff-calculator' },
  { id: 'net-worth', name: 'Net Worth Calculator', description: 'Calculate your total net worth', category: 'finance' as const, icon: 'fas fa-balance-scale', href: '/tools/net-worth-calculator' },
  { id: 'stock-profit', name: 'Stock Profit Calculator', description: 'Calculate profit/loss on stock investments', category: 'finance' as const, icon: 'fas fa-chart-bar', href: '/tools/stock-profit-calculator' },
  { id: 'retirement-calculator', name: 'Retirement Calculator', description: 'Plan your retirement savings', category: 'finance' as const, icon: 'fas fa-user-clock', href: '/tools/retirement-calculator' },
  { id: 'sip-calculator', name: 'SIP Calculator', description: 'Calculate Systematic Investment Plan returns', category: 'finance' as const, icon: 'fas fa-coins', href: '/tools/sip-calculator' },
  { id: 'investment-return', name: 'Investment Return Calculator', description: 'Calculate returns on various investments', category: 'finance' as const, icon: 'fas fa-money-bill-wave', href: '/tools/investment-return-calculator' },
  { id: 'break-even', name: 'Break-Even Calculator', description: 'Calculate business break-even point', category: 'finance' as const, icon: 'fas fa-equals', href: '/tools/break-even-calculator' },
  { id: 'car-loan', name: 'Car Loan Calculator', description: 'Calculate car loan payments and interest', category: 'finance' as const, icon: 'fas fa-car', href: '/tools/car-loan-calculator' },
  { id: 'home-loan', name: 'Home Loan Calculator', description: 'Calculate home loan EMI and interest', category: 'finance' as const, icon: 'fas fa-house-user', href: '/tools/home-loan-calculator' },
  { id: 'education-loan', name: 'Education Loan Calculator', description: 'Calculate education loan payments with moratorium period support', category: 'finance' as const, icon: 'fas fa-graduation-cap', href: '/tools/education-loan-calculator' },
  { id: 'credit-card-interest', name: 'Credit Card Interest Calculator', description: 'Calculate credit card interest and payment schedules', category: 'finance' as const, icon: 'fas fa-credit-card', href: '/tools/credit-card-interest-calculator' },
  { id: 'lease-calculator', name: 'Lease Calculator', description: 'Calculate lease payments for vehicles and assets', category: 'finance' as const, icon: 'fas fa-file-contract', href: '/tools/lease-calculator' },
  { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages and percentage changes', category: 'finance' as const, icon: 'fas fa-percentage', href: '/tools/percentage-calculator' },
  { id: 'discount-calculator', name: 'Discount Calculator', description: 'Calculate discounts and final prices', category: 'finance' as const, icon: 'fas fa-tags', href: '/tools/discount-calculator' },
  { id: 'vat-gst-calculator', name: 'VAT/GST Calculator', description: 'Calculate VAT and GST on products', category: 'finance' as const, icon: 'fas fa-file-invoice', href: '/tools/vat-gst-calculator' },
  { id: 'paypal-fee-calculator', name: 'PayPal Fee Calculator', description: 'Calculate PayPal transaction fees', category: 'finance' as const, icon: 'fab fa-paypal', href: '/tools/paypal-fee-calculator' },
  { id: 'cryptocurrency-converter', name: 'Cryptocurrency Converter', description: 'Convert between Bitcoin, Ethereum and 1000+ cryptocurrencies', category: 'finance' as const, icon: 'fab fa-bitcoin', href: '/tools/cryptocurrency-converter' },

  // PDF Tools (29)
  { id: 'pdf-to-word', name: 'PDF to Word Converter', description: 'Convert PDF files to Word documents', category: 'pdf' as const, icon: 'fas fa-file-word', isPopular: true },
  { id: 'word-to-pdf', name: 'Word to PDF Converter', description: 'Convert Word documents to PDF format', category: 'pdf' as const, icon: 'fas fa-file-pdf' },
  { id: 'excel-to-pdf', name: 'Excel to PDF Converter', description: 'Convert Excel spreadsheets to PDF', category: 'pdf' as const, icon: 'fas fa-file-excel' },
  { id: 'pdf-to-excel', name: 'PDF to Excel Converter', description: 'Convert PDF files to Excel format', category: 'pdf' as const, icon: 'fas fa-table' },
  { id: 'ppt-to-pdf', name: 'PowerPoint to PDF Converter', description: 'Convert PowerPoint presentations to PDF', category: 'pdf' as const, icon: 'fas fa-file-powerpoint' },
  { id: 'pdf-to-ppt', name: 'PDF to PowerPoint Converter', description: 'Convert PDF files to PowerPoint', category: 'pdf' as const, icon: 'fas fa-presentation' },
  { id: 'jpg-to-pdf', name: 'JPG to PDF Converter', description: 'Convert JPG images to PDF format', category: 'pdf' as const, icon: 'fas fa-image' },
  { id: 'png-to-pdf', name: 'PNG to PDF Converter', description: 'Convert PNG images to PDF format', category: 'pdf' as const, icon: 'fas fa-file-image' },
  { id: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDFs into one document', category: 'pdf' as const, icon: 'fas fa-object-group', isPopular: true, href: '/tools/merge-pdf' },
  { id: 'split-pdf', name: 'Split PDF', description: 'Split PDF into multiple documents', category: 'pdf' as const, icon: 'fas fa-cut', href: '/tools/split-pdf' },
  { id: 'compress-pdf', name: 'Compress PDF', description: 'Reduce PDF file size while maintaining quality', category: 'pdf' as const, icon: 'fas fa-compress', isPopular: true },
  { id: 'rotate-pdf', name: 'Rotate PDF', description: 'Rotate PDF pages to correct orientation', category: 'pdf' as const, icon: 'fas fa-undo', href: '/tools/rotate-pdf' },
  { id: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove password protection from PDFs', category: 'pdf' as const, icon: 'fas fa-unlock', href: '/tools/unlock-pdf' },
  { id: 'protect-pdf', name: 'Protect PDF with Password', description: 'Add password protection to PDF files', category: 'pdf' as const, icon: 'fas fa-lock', href: '/tools/protect-pdf' },
  { id: 'watermark-pdf', name: 'Add Watermark to PDF', description: 'Add text or image watermarks to PDF', category: 'pdf' as const, icon: 'fas fa-tint', href: '/tools/watermark-pdf' },
  { id: 'pdf-to-text', name: 'PDF to Text Converter', description: 'Extract text content from PDF files', category: 'pdf' as const, icon: 'fas fa-file-alt' },
  { id: 'text-to-pdf', name: 'Text to PDF Converter', description: 'Convert text files to PDF format', category: 'pdf' as const, icon: 'fas fa-file-pdf' },
  { id: 'html-to-pdf', name: 'HTML to PDF Converter', description: 'Convert HTML pages to PDF format', category: 'pdf' as const, icon: 'fas fa-code' },
  { id: 'pdf-to-html', name: 'PDF to HTML Converter', description: 'Convert PDF files to HTML format', category: 'pdf' as const, icon: 'fab fa-html5' },
  { id: 'add-page-numbers', name: 'PDF Page Number Adder', description: 'Add page numbers to PDF documents', category: 'pdf' as const, icon: 'fas fa-list-ol', href: '/tools/add-page-numbers' },
  { id: 'organize-pdf', name: 'Organize PDF Pages', description: 'Reorder and organize PDF pages', category: 'pdf' as const, icon: 'fas fa-sort', href: '/tools/organize-pdf' },
  { id: 'extract-pdf-pages', name: 'Extract Pages from PDF', description: 'Extract specific pages from PDF', category: 'pdf' as const, icon: 'fas fa-file-export', href: '/tools/extract-pdf-pages' },
  { id: 'bw-pdf', name: 'Black & White PDF Converter', description: 'Convert PDF to black and white', category: 'pdf' as const, icon: 'fas fa-adjust' },
  { id: 'pdf-metadata', name: 'PDF Metadata Editor', description: 'Edit PDF metadata and properties', category: 'pdf' as const, icon: 'fas fa-info-circle' },
  { id: 'sign-pdf', name: 'Sign PDF Online', description: 'Add digital signatures to PDF documents', category: 'pdf' as const, icon: 'fas fa-signature' },
  { id: 'pdf-ocr', name: 'PDF OCR (Image to Text)', description: 'Extract text from scanned PDF documents', category: 'pdf' as const, icon: 'fas fa-eye' },
  { id: 'pdf-to-image', name: 'PDF to Image (JPG/PNG)', description: 'Convert PDF pages to image format', category: 'pdf' as const, icon: 'fas fa-images' },
  { id: 'pdf-to-epub', name: 'PDF to EPUB Converter', description: 'Convert PDF files to EPUB format', category: 'pdf' as const, icon: 'fas fa-book' },
  { id: 'epub-to-pdf', name: 'EPUB to PDF Converter', description: 'Convert EPUB books to PDF format', category: 'pdf' as const, icon: 'fas fa-book-open' },


  // Text Tools (30)
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and paragraphs', category: 'text' as const, icon: 'fas fa-calculator', href: '/tools/word-counter' },
  { id: 'character-counter', name: 'Character Counter', description: 'Count characters in text with/without spaces', category: 'text' as const, icon: 'fas fa-font', href: '/tools/character-counter' },
  { id: 'sentence-counter', name: 'Sentence Counter', description: 'Count sentences in your text', category: 'text' as const, icon: 'fas fa-list', href: '/tools/sentence-counter' },
  { id: 'paragraph-counter', name: 'Paragraph Counter', description: 'Count paragraphs in documents', category: 'text' as const, icon: 'fas fa-paragraph', href: '/tools/paragraph-counter' },
  { id: 'case-converter', name: 'Case Converter (UPPER ⇄ lower)', description: 'Convert text between different cases', category: 'text' as const, icon: 'fas fa-text-height', href: '/tools/case-converter' },
  { id: 'plagiarism-checker', name: 'Plagiarism Checker (basic AI)', description: 'Check text for potential plagiarism', category: 'text' as const, icon: 'fas fa-shield-alt' },
  { id: 'grammar-checker', name: 'Grammar Checker', description: 'Check and fix grammar errors in your text instantly', category: 'text' as const, icon: 'fas fa-spell-check', isPopular: true },
  { id: 'spell-checker', name: 'Spell Checker', description: 'Check and correct spelling mistakes', category: 'text' as const, icon: 'fas fa-check-circle' },
  { id: 'text-summarizer', name: 'Text Summarizer', description: 'Create summaries of long text content', category: 'text' as const, icon: 'fas fa-compress-alt' },
  { id: 'paraphrasing-tool', name: 'Paraphrasing Tool', description: 'Rewrite text with different words', category: 'text' as const, icon: 'fas fa-sync-alt' },
  { id: 'essay-generator', name: 'Essay Generator (AI)', description: 'Generate essays on any topic using AI', category: 'text' as const, icon: 'fas fa-robot' },
  { id: 'password-generator', name: 'Random Password Generator', description: 'Generate secure random passwords', category: 'text' as const, icon: 'fas fa-key', href: '/tools/password-generator' },
  { id: 'username-generator', name: 'Random Username Generator', description: 'Generate unique usernames', category: 'text' as const, icon: 'fas fa-user' },
  { id: 'hashtag-generator', name: 'Hashtag Generator', description: 'Generate relevant hashtags for posts', category: 'text' as const, icon: 'fas fa-hashtag' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for designs', category: 'text' as const, icon: 'fas fa-paragraph' },
  { id: 'fake-address', name: 'Fake Address Generator', description: 'Generate fake addresses for testing', category: 'text' as const, icon: 'fas fa-map-marker-alt' },
  { id: 'fake-name-generator', name: 'Fake Name Generator', description: 'Generate fake names for testing', category: 'text' as const, icon: 'fas fa-id-card', href: '/tools/fake-name-generator' },
  { id: 'qr-text', name: 'QR Code Text Generator', description: 'Generate QR codes from text', category: 'text' as const, icon: 'fas fa-qrcode' },
  { id: 'binary-to-text', name: 'Binary to Text Converter', description: 'Convert binary code to readable text', category: 'text' as const, icon: 'fas fa-exchange-alt' },
  { id: 'text-to-binary', name: 'Text to Binary Converter', description: 'Convert text to binary code', category: 'text' as const, icon: 'fas fa-binary' },
  { id: 'text-to-speech', name: 'Text to Speech', description: 'Convert text to audio speech', category: 'text' as const, icon: 'fas fa-volume-up' },
  { id: 'speech-to-text', name: 'Speech to Text', description: 'Convert audio speech to text', category: 'text' as const, icon: 'fas fa-microphone' },
  { id: 'emoji-translator', name: 'Emoji Translator', description: 'Convert text to emojis and vice versa', category: 'text' as const, icon: 'fas fa-smile' },
  { id: 'ascii-generator', name: 'ASCII Text Generator', description: 'Create ASCII art from text', category: 'text' as const, icon: 'fas fa-font' },
  { id: 'font-style-changer', name: 'Font Style Changer', description: 'Change text to different font styles', category: 'text' as const, icon: 'fas fa-italic' },
  { id: 'markdown-to-html', name: 'Markdown to HTML Converter', description: 'Convert Markdown to HTML format', category: 'text' as const, icon: 'fab fa-markdown' },
  { id: 'reverse-text', name: 'Reverse Text Tool', description: 'Reverse the order of text characters', category: 'text' as const, icon: 'fas fa-backward' },
  { id: 'word-cloud', name: 'Word Cloud Generator', description: 'Create visual word clouds from text', category: 'text' as const, icon: 'fas fa-cloud' },


  // Health Tools (30)
  { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate your Body Mass Index and get health insights', category: 'health' as const, icon: 'fas fa-weight', isPopular: true, href: '/tools/bmi-calculator' },
  { id: 'bmr-calculator', name: 'BMR Calculator', description: 'Calculate Basal Metabolic Rate and daily calorie needs', category: 'health' as const, icon: 'fas fa-fire', href: '/tools/bmr-calculator' },
  { id: 'calorie-calculator', name: 'Calorie Calculator', description: 'Calculate daily calorie needs and macronutrient breakdown', category: 'health' as const, icon: 'fas fa-utensils', href: '/tools/calorie-calculator' },
  { id: 'body-fat-calculator', name: 'Body Fat Calculator', description: 'Calculate body fat percentage using US Navy method', category: 'health' as const, icon: 'fas fa-percentage', href: '/tools/body-fat-calculator' },
  { id: 'pregnancy-due-date-calculator', name: 'Pregnancy Due Date Calculator', description: 'Calculate expected delivery date and pregnancy milestones', category: 'health' as const, icon: 'fas fa-baby', href: '/tools/pregnancy-due-date-calculator' },
  { id: 'ideal-weight-calculator', name: 'Ideal Weight Calculator', description: 'Calculate ideal body weight using multiple proven formulas', category: 'health' as const, icon: 'fas fa-balance-scale', href: '/tools/ideal-weight-calculator' },
  { id: 'water-intake-Calculator', name: 'Water Intake Calculator', description: 'Calculate daily water requirements', category: 'health' as const, icon: 'fas fa-tint', href: '/tools/water-intake-Calculator' },
  { id: 'protein-intake-Calculator', name: 'Protein Intake Calculator', description: 'Calculate daily protein requirements', category: 'health' as const, icon: 'fas fa-drumstick-bite', href: '/tools/protein-intake-Calculator' },
  { id: 'carb-calculator', name: 'Carb Calculator', description: 'Calculate daily carbohydrate needs', category: 'health' as const, icon: 'fas fa-bread-slice', href: '/tools/carb-calculator' },
  { id: 'keto-macro-Calculator', name: 'Keto Macro Calculator', description: 'Calculate macros for ketogenic diet', category: 'health' as const, icon: 'fas fa-calculator', href: '/tools/keto-macro-Calculator' },
  { id: 'intermittent-fasting-timer', name: 'Intermittent Fasting Timer', description: 'Track intermittent fasting periods and eating windows', category: 'health' as const, icon: 'fas fa-clock', href: '/tools/intermittent-fasting-timer' },
  { id: 'daily-step-calorie-Converter', name: 'Daily Steps to Calories Converter', description: 'Convert steps walked to calories burned with personal factors', category: 'health' as const, icon: 'fas fa-walking', href: '/tools/daily-step-calorie-converter' },
  { id: 'heart-rate-calculator', name: 'Heart Rate Calculator', description: 'Calculate target heart rate zones for optimal training and fitness', category: 'health' as const, icon: 'fas fa-heartbeat', href: '/tools/heart-rate-calculator' },
  { id: 'max-heart-rate-calculator', name: 'Max Heart Rate Calculator', description: 'Calculate maximum heart rate using multiple scientific formulas', category: 'health' as const, icon: 'fas fa-heart', href: '/tools/max-heart-rate-calculator' },
  { id: 'blood-pressure-tracker', name: 'Blood Pressure Tracker', description: 'Track and monitor blood pressure readings with instant classification', category: 'health' as const, icon: 'fas fa-stethoscope', href: '/tools/blood-pressure-tracker' },
  { id: 'sleep-calculator', name: 'Sleep Calculator', description: 'Calculate optimal sleep and wake times based on natural sleep cycles', category: 'health' as const, icon: 'fas fa-bed', href: '/tools/sleep-calculator' },
  { id: 'ovulation-calculator', name: 'Ovulation Calculator', description: 'Track fertile days and ovulation date for conception planning', category: 'health' as const, icon: 'fas fa-female', href: '/tools/ovulation-calculator' },
  { id: 'baby-growth-chart', name: 'Baby Growth Chart', description: 'Track baby growth and development using WHO standards', category: 'health' as const, icon: 'fas fa-baby', href: '/tools/baby-growth-chart' },
  { id: 'baby-growth-percentile', name: 'Baby Growth Chart Calculator', description: 'Track baby growth percentiles', category: 'health' as const, icon: 'fas fa-child', href: '/tools/baby-growth-percentile' },
  { id: 'tdee-calculator', name: 'TDEE Calculator', description: 'Calculate Total Daily Energy Expenditure', category: 'health' as const, icon: 'fas fa-bolt', href: '/tools/tdee-calculator' },
  { id: 'lean-body-mass-calculator', name: 'Lean Body Mass Calculator', description: 'Calculate lean body mass', category: 'health' as const, icon: 'fas fa-user-md', href: '/tools/lean-body-mass-calculator' },
  { id: 'waist-height-ratio-calculator', name: 'Waist-to-Height Ratio Calculator', description: 'Calculate waist-to-height ratio', category: 'health' as const, icon: 'fas fa-ruler', href: '/tools/waist-to-height-ratio-calculator' },
  { id: 'whr-calculator', name: 'WHR Calculator (Waist-Hip Ratio)', description: 'Calculate waist-to-hip ratio', category: 'health' as const, icon: 'fas fa-tape', href: '/tools/whr-calculator' },
  { id: 'life-expectancy-calculator', name: 'Life Expectancy Calculator', description: 'Estimate life expectancy based on lifestyle', category: 'health' as const, icon: 'fas fa-hourglass', href: '/tools/life-expectancy-calculator' },
  { id: 'cholesterol-risk-calculator', name: 'Cholesterol Risk Calculator', description: 'Assess cholesterol-related health risks', category: 'health' as const, icon: 'fas fa-vial', href: '/tools/cholesterol-risk-calculator' },
  { id: 'diabetes-risk', name: 'Diabetes Risk Calculator', description: 'Assess risk of developing diabetes', category: 'health' as const, icon: 'fas fa-syringe' },
  { id: 'running-pace', name: 'Running Pace Calculator', description: 'Calculate running pace and times', category: 'health' as const, icon: 'fas fa-running' },
  { id: 'cycling-speed', name: 'Cycling Speed Calculator', description: 'Calculate cycling speed and distance', category: 'health' as const, icon: 'fas fa-bicycle' },
  { id: 'swimming-calories', name: 'Swimming Calorie Calculator', description: 'Calculate calories burned while swimming', category: 'health' as const, icon: 'fas fa-swimmer' },
  { id: 'alcohol-calories', name: 'Alcohol Calorie Calculator', description: 'Calculate calories in alcoholic drinks', category: 'health' as const, icon: 'fas fa-wine-glass' },
  { id: 'smoking-cost', name: 'Smoking Cost Calculator', description: 'Calculate the cost of smoking habits', category: 'health' as const, icon: 'fas fa-smoking-ban' }
];

// Generate href for each tool
const generateHref = (tool: Omit<Tool, 'href'>): string => {
  // Special cases for calculators that have their own pages
  if (tool.id === 'loan-calculator') {
    return '/tools/loan-calculator';
  }
  if (tool.id === 'compound-interest') {
    return '/tools/compound-interest';
  }
  if (tool.id === 'simple-interest') {
    return '/tools/simple-interest';
  }
  if (tool.id === 'currency-converter') {
    return '/tools/currency-converter';
  }
  if (tool.id === 'roi-calculator') {
    return '/tools/roi-calculator';
  }
  if (tool.id === 'tax-calculator') {
    return '/tools/tax-calculator';
  }
  if (tool.id === 'salary-hourly') {
    return '/tools/salary-to-hourly';
  }
  if (tool.id === 'tip-calculator') {
    return '/tools/tip-calculator';
  }
  if (tool.id === 'inflation-calculator') {
    return '/tools/inflation-calculator';
  }
  if (tool.id === 'savings-goal') {
    return '/tools/savings-goal-calculator';
  }
  if (tool.id === 'debt-payoff') {
    return '/tools/debt-payoff-calculator';
  }
  if (tool.id === 'net-worth') {
    return '/tools/net-worth-calculator';
  }
  if (tool.id === 'stock-profit') {
    return '/tools/stock-profit-calculator';
  }
  if (tool.id === 'investment-return') {
    return '/tools/investment-return-calculator';
  }
  if (tool.id === 'break-even') {
    return '/tools/break-even-calculator';
  }
  if (tool.id === 'business-loan') {
    return '/tools/business-loan-calculator';
  }
  if (tool.id === 'lease-calculator') {
    return '/tools/lease-calculator';
  }
  if (tool.id === 'car-loan') {
    return '/tools/car-loan-calculator';
  }
  if (tool.id === 'home-loan') {
    return '/tools/home-loan-calculator';
  }
  if (tool.id === 'education-loan') {
    return '/tools/education-loan-calculator';
  }
  if (tool.id === 'credit-card-interest') {
    return '/tools/credit-card-interest-calculator';
  }

  // Generate individual tool page URL
  return `/tools/${tool.id}`;
};

// Export tools with generated hrefs
export const tools: Tool[] = toolsData.map(tool => ({
  ...tool,
  href: generateHref(tool)
}));

export const popularTools = tools.filter(tool => tool.isPopular);

export const getToolsByCategory = (category: string) => {
  if (category === 'all') return tools;
  return tools.filter(tool => tool.category === category);
};

export const getCategoryStats = () => {
  const stats: Record<string, number> = {};
  Object.keys(categories).forEach(key => {
    stats[key] = tools.filter(tool => tool.category === key).length;
  });
  return stats;
};