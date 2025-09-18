export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'finance' | 'text' | 'health';
  icon: string;
  isPopular?: boolean;
  href: string;
}

export const categories = {
  finance: 'Finance',
  text: 'Text',
  health: 'Health'
};

const toolsData = [
  // Finance Tools (30)
  { id: 'loan-calculator', name: 'Loan Calculator', description: 'Calculate monthly payments and total interest for any loan', category: 'finance' as const, icon: 'fas fa-calculator', isPopular: true, href: '/tools/loan-calculator' },
  { id: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Calculate mortgage payments and compare rates', category: 'finance' as const, icon: 'fas fa-home', href: '/tools/mortgage-calculator' },
  { id: 'emi-calculator', name: 'EMI Calculator', description: 'Calculate Equated Monthly Installments for loans', category: 'finance' as const, icon: 'fas fa-chart-line', href: '/tools/emi-calculator' },
  { id: 'business-loan-calculator', name: 'Business Loan Calculator', description: 'Calculate business loan payments and metrics', category: 'finance' as const, icon: 'fas fa-building', href: '/tools/business-loan-calculator' },
  { id: 'compound-interest-Calculator', name: 'Compound Interest Calculator', description: 'Calculate compound interest on investments', category: 'finance' as const, icon: 'fas fa-chart-area', href: '/tools/compound-interest-Calculator' },
  { id: 'simple-interest-Calculator', name: 'Simple Interest Calculator', description: 'Calculate simple interest on principal amount', category: 'finance' as const, icon: 'fas fa-percent', href: '/tools/simple-interest-Calculator' },
  { id: 'roi-calculator', name: 'ROI Calculator', description: 'Calculate return on investment percentage', category: 'finance' as const, icon: 'fas fa-trending-up', href: '/tools/roi-calculator' },
  { id: 'tax-calculator', name: 'Tax Calculator', description: 'Calculate income tax based on your salary', category: 'finance' as const, icon: 'fas fa-receipt', href: '/tools/tax-calculator' },
  { id: 'salary-to-hourly-calculator', name: 'Salary to Hourly Calculator', description: 'Convert annual salary to hourly wage', category: 'finance' as const, icon: 'fas fa-clock', href: '/tools/salary-to-hourly-calculator' },
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

  // Text Tools (19)
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and paragraphs', category: 'text' as const, icon: 'fas fa-calculator', href: '/tools/word-counter' },
  { id: 'character-counter', name: 'Character Counter', description: 'Count characters in text with/without spaces', category: 'text' as const, icon: 'fas fa-font', href: '/tools/character-counter' },
  { id: 'sentence-counter', name: 'Sentence Counter', description: 'Count sentences in your text', category: 'text' as const, icon: 'fas fa-list', href: '/tools/sentence-counter' },
  { id: 'paragraph-counter', name: 'Paragraph Counter', description: 'Count paragraphs in documents', category: 'text' as const, icon: 'fas fa-paragraph', href: '/tools/paragraph-counter' },
  { id: 'case-converter', name: 'Case Converter (UPPER ⇄ lower)', description: 'Convert text between different cases', category: 'text' as const, icon: 'fas fa-text-height', href: '/tools/case-converter' },
  { id: 'password-generator', name: 'Random Password Generator', description: 'Generate secure random passwords', category: 'text' as const, icon: 'fas fa-key', href: '/tools/password-generator' },
  { id: 'username-generator', name: 'Random Username Generator', description: 'Generate unique usernames', category: 'text' as const, icon: 'fas fa-user', isPopular: true, href: '/tools/username-generator' },
  { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for designs', category: 'text' as const, icon: 'fas fa-paragraph', href: '/tools/lorem-ipsum-generator' },
  { id: 'fake-address-generator', name: 'Fake Address Generator', description: 'Generate fake addresses for testing', category: 'text' as const, icon: 'fas fa-map-marker-alt', href: '/tools/fake-address-generator' },
  { id: 'fake-name-generator', name: 'Fake Name Generator', description: 'Generate fake names for testing', category: 'text' as const, icon: 'fas fa-id-card', href: '/tools/fake-name-generator' },
  { id: 'binary-to-text-converter', name: 'Binary to Text Converter', description: 'Convert binary code to readable text', category: 'text' as const, icon: 'fas fa-exchange-alt', href: '/tools/binary-to-text-converter' },
  { id: 'text-to-binary-converter', name: 'Text to Binary Converter', description: 'Convert text to binary code', category: 'text' as const, icon: 'fas fa-binary', href: '/tools/text-to-binary-converter' },
  { id: 'decimal-to-text-converter', name: 'Decimal to Text Converter', description: 'Convert decimal character codes to readable text', category: 'text' as const, icon: 'fas fa-arrow-left', href: '/tools/decimal-to-text-converter' },
  { id: 'text-to-decimal-converter', name: 'Text to Decimal Converter', description: 'Convert text to decimal character codes', category: 'text' as const, icon: 'fas fa-arrow-right', href: '/tools/text-to-decimal-converter' },
  { id: 'hex-to-text-converter', name: 'Hex to Text Converter', description: 'Convert hexadecimal values to readable text', category: 'text' as const, icon: 'fas fa-code', href: '/tools/hex-to-text-converter' },
  { id: 'text-to-hex-converter', name: 'Text to Hex Converter', description: 'Convert text to hexadecimal values', category: 'text' as const, icon: 'fas fa-hashtag', href: '/tools/text-to-hex-converter' },
  { id: 'font-style-changer', name: 'Font Style Changer', description: 'Transform text with stylish fonts', category: 'text' as const, icon: 'fas fa-font', href: '/tools/font-style-changer' },
  { id: 'markdown-to-html', name: 'Markdown to HTML Converter', description: 'Convert Markdown to HTML format', category: 'text' as const, icon: 'fab fa-markdown', href: '/tools/markdown-to-html' },
  { id: 'reverse-text-tool', name: 'Reverse Text Tool', description: 'Reverse the order of text characters, words, or lines', category: 'text' as const, icon: 'fas fa-backward', href: '/tools/reverse-text-tool' },
  { id: 'text-to-qr-code', name: 'Text to QR Code', description: 'Extract URLs, emails, and text content and convert to QR codes', category: 'text' as const, icon: 'fas fa-arrow-right', href: '/tools/text-to-qr-code' },
  { id: 'qr-code-scanner', name: 'QR Code Scanner', description: 'Scan QR codes from images to extract text content', category: 'text' as const, icon: 'fas fa-camera', href: '/tools/qr-code-scanner' },
  { id: 'duplicate-line-remover', name: 'Duplicate Line Remover', description: 'Remove duplicate lines from text while preserving order', category: 'text' as const, icon: 'fas fa-copy', href: '/tools/duplicate-line-remover' },
  { id: 'text-scrambler', name: 'Text Scrambler', description: 'Scramble text in various ways - characters, words, or lines', category: 'text' as const, icon: 'fas fa-random', href: '/tools/text-scrambler' },


  // Health Tools (30)
  { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate your Body Mass Index and get health insights', category: 'health' as const, icon: 'fas fa-weight', isPopular: true, href: '/tools/bmi-calculator' },
  { id: 'bmr-calculator', name: 'BMR Calculator', description: 'Calculate Basal Metabolic Rate and daily calorie needs', category: 'health' as const, icon: 'fas fa-fire', href: '/tools/bmr-calculator' },
  { id: 'calorie-calculator', name: 'Calorie Calculator', description: 'Calculate daily calorie needs and macronutrient breakdown', category: 'health' as const, icon: 'fas fa-utensils', href: '/tools/calorie-calculator' },
  { id: 'body-fat-calculator', name: 'Body Fat Calculator', description: 'Calculate body fat percentage using US Navy method', category: 'health' as const, icon: 'fas fa-percentage', href: '/tools/body-fat-calculator' },
  { id: 'pregnancy-due-date-calculator', name: 'Pregnancy Due Date Calculator', description: 'Calculate expected delivery date and pregnancy milestones', category: 'health' as const, icon: 'fas fa-baby', href: '/tools/pregnancy-due-date-calculator' },
  { id: 'ideal-weight-calculator', name: 'Ideal Weight Calculator', description: 'Calculate ideal body weight using multiple proven formulas', category: 'health' as const, icon: 'fas fa-balance-scale', href: '/tools/ideal-weight-calculator' },
  { id: 'water-intake-calculator', name: 'Water Intake Calculator', description: 'Calculate daily water requirements', category: 'health' as const, icon: 'fas fa-tint', href: '/tools/water-intake-calculator' },
  { id: 'protein-intake-calculator', name: 'Protein Intake Calculator', description: 'Calculate daily protein requirements', category: 'health' as const, icon: 'fas fa-drumstick-bite', href: '/tools/protein-intake-calculator' },
  { id: 'carb-calculator', name: 'Carb Calculator', description: 'Calculate daily carbohydrate needs', category: 'health' as const, icon: 'fas fa-bread-slice', href: '/tools/carb-calculator' },
  { id: 'keto-macro-calculator', name: 'Keto Macro Calculator', description: 'Calculate macros for ketogenic diet', category: 'health' as const, icon: 'fas fa-calculator', href: '/tools/keto-macro-calculator' },
  { id: 'intermittent-fasting-timer', name: 'Intermittent Fasting Timer', description: 'Track intermittent fasting periods and eating windows', category: 'health' as const, icon: 'fas fa-clock', href: '/tools/intermittent-fasting-timer' },
  { id: 'daily-step-calorie-converter', name: 'Daily Steps to Calories Converter', description: 'Convert steps walked to calories burned with personal factors', category: 'health' as const, icon: 'fas fa-walking', href: '/tools/daily-step-calorie-converter' },
  { id: 'heart-rate-calculator', name: 'Heart Rate Calculator', description: 'Calculate target heart rate zones for optimal training and fitness', category: 'health' as const, icon: 'fas fa-heartbeat', href: '/tools/heart-rate-calculator' },
  { id: 'max-heart-rate-calculator', name: 'Max Heart Rate Calculator', description: 'Calculate maximum heart rate using multiple scientific formulas', category: 'health' as const, icon: 'fas fa-heart', href: '/tools/max-heart-rate-calculator' },
  { id: 'blood-pressure-tracker', name: 'Blood Pressure Tracker', description: 'Track and monitor blood pressure readings with instant classification', category: 'health' as const, icon: 'fas fa-stethoscope', href: '/tools/blood-pressure-tracker' },
  { id: 'sleep-calculator', name: 'Sleep Calculator', description: 'Calculate optimal sleep and wake times based on natural sleep cycles', category: 'health' as const, icon: 'fas fa-bed', href: '/tools/sleep-calculator' },
  { id: 'ovulation-calculator', name: 'Ovulation Calculator', description: 'Track fertile days and ovulation date for conception planning', category: 'health' as const, icon: 'fas fa-female', href: '/tools/ovulation-calculator' },
  { id: 'baby-growth-chart', name: 'Baby Growth Chart', description: 'Track baby growth and development using WHO standards', category: 'health' as const, icon: 'fas fa-baby', href: '/tools/baby-growth-chart' },
  { id: 'tdee-calculator', name: 'TDEE Calculator', description: 'Calculate Total Daily Energy Expenditure', category: 'health' as const, icon: 'fas fa-bolt', href: '/tools/tdee-calculator' },
  { id: 'lean-body-mass-calculator', name: 'Lean Body Mass Calculator', description: 'Calculate lean body mass', category: 'health' as const, icon: 'fas fa-user-md', href: '/tools/lean-body-mass-calculator' },
  { id: 'waist-height-ratio-calculator', name: 'Waist-to-Height Ratio Calculator', description: 'Calculate waist-to-height ratio', category: 'health' as const, icon: 'fas fa-ruler', href: '/tools/waist-to-height-ratio-calculator' },
  { id: 'whr-calculator', name: 'WHR Calculator (Waist-Hip Ratio)', description: 'Calculate waist-to-hip ratio', category: 'health' as const, icon: 'fas fa-tape', href: '/tools/whr-calculator' },
  { id: 'life-expectancy-calculator', name: 'Life Expectancy Calculator', description: 'Estimate life expectancy based on lifestyle', category: 'health' as const, icon: 'fas fa-hourglass', href: '/tools/life-expectancy-calculator' },
  { id: 'cholesterol-risk-calculator', name: 'Cholesterol Risk Calculator', description: 'Assess cholesterol-related health risks', category: 'health' as const, icon: 'fas fa-vial', isPopular: true, href: '/tools/cholesterol-risk-calculator' },
  { id: 'running-pace-calculator', name: 'Running Pace Calculator', description: 'Calculate running pace and times', category: 'health' as const, icon: 'fas fa-running', href: '/tools/running-pace-calculator' },
  { id: 'cycling-speed-calculator', name: 'Cycling Speed Calculator', description: 'Calculate cycling speed and distance', category: 'health' as const, icon: 'fas fa-bicycle', href: '/tools/cycling-speed-calculator' },
  { id: 'swimming-calorie-calculator', name: 'Swimming Calorie Calculator', description: 'Calculate calories burned while swimming', category: 'health' as const, icon: 'fas fa-swimmer', href: '/tools/swimming-calorie-calculator' },
  { id: 'alcohol-calorie-calculator', name: 'Alcohol Calorie Calculator', description: 'Calculate calories in alcoholic drinks', category: 'health' as const, icon: 'fas fa-wine-glass', href: '/tools/alcohol-calorie-calculator' },
  { id: 'smoking-cost-calculator', name: 'Smoking Cost Calculator', description: 'Calculate the cost of smoking habits', category: 'health' as const, icon: 'fas fa-smoking-ban', href: '/tools/smoking-cost-calculator' }
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