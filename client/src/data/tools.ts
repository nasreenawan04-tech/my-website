export interface Tool {
  id: string;
  name: string;
  description: string;
  category: "finance" | "text" | "health";
  icon: string;
  isPopular?: boolean;
  href: string;
}

export const categories = {
  finance: "Finance",
  text: "Text",
  health: "Health",
};

const toolsData: Tool[] = [
  // Finance Tools (8)
  {
    id: "loan-calculator",
    name: "Loan Calculator",
    description: "Calculate monthly payments and total interest for any loan",
    category: "finance" as const,
    icon: "fas fa-calculator",
    isPopular: true,
    href: "/tools/loan-calculator",
  },
  {
    id: "mortgage-calculator",
    name: "Mortgage Calculator",
    description: "Calculate mortgage payments and compare rates",
    category: "finance" as const,
    icon: "fas fa-home",
    isPopular: true,
    href: "/tools/mortgage-calculator",
  },
  {
    id: "emi-calculator",
    name: "EMI Calculator",
    description: "Calculate Equated Monthly Installments for loans",
    category: "finance" as const,
    icon: "fas fa-chart-line",
    href: "/tools/emi-calculator",
  },
  {
    id: "business-loan-calculator",
    name: "Business Loan Calculator",
    description: "Calculate business loan payments and metrics",
    category: "finance" as const,
    icon: "fas fa-building",
    href: "/tools/business-loan-calculator",
  },
  {
    id: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    description: "Calculate compound interest on investments",
    category: "finance" as const,
    icon: "fas fa-chart-area",
    href: "/tools/compound-interest-calculator",
  },
  {
    id: "simple-interest-calculator",
    name: "Simple Interest Calculator",
    description: "Calculate simple interest on principal amount",
    category: "finance" as const,
    icon: "fas fa-percent",
    href: "/tools/simple-interest-calculator",
  },
  {
    id: "car-loan-calculator",
    name: "Car Loan Calculator",
    description: "Calculate car loan payments and interest",
    category: "finance" as const,
    icon: "fas fa-car",
    href: "/tools/car-loan-calculator",
  },
  {
    id: "home-loan-calculator",
    name: "Home Loan Calculator",
    description: "Calculate home loan EMI and interest",
    category: "finance" as const,
    icon: "fas fa-house-user",
    href: "/tools/home-loan-calculator",
  },

  // Text Tools (7)
  {
    id: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, and paragraphs",
    category: "text" as const,
    icon: "fas fa-calculator",
    href: "/tools/word-counter",
  },
  {
    id: "character-counter",
    name: "Character Counter",
    description: "Count characters in text with/without spaces",
    category: "text" as const,
    icon: "fas fa-font",
    href: "/tools/character-counter",
  },
  {
    id: "password-generator",
    name: "Random Password Generator",
    description: "Generate secure random passwords",
    category: "text" as const,
    icon: "fas fa-key",
    href: "/tools/password-generator",
  },
  {
    id: "username-generator",
    name: "Random Username Generator",
    description: "Generate unique usernames",
    category: "text" as const,
    icon: "fas fa-user",
    isPopular: true,
    href: "/tools/username-generator",
  },
  {
    id: "qr-code-scanner",
    name: "QR Code Scanner",
    description: "Scan QR codes from images to extract text content",
    category: "text" as const,
    icon: "fas fa-camera",
    href: "/tools/qr-code-scanner",
  },
  {
    id: "base64-encoder-decoder",
    name: "Base64 Encoder/Decoder",
    description:
      "Convert text to Base64 and decode Base64 to text with advanced encoding options",
    category: "text" as const,
    icon: "fas fa-code",
    href: "/tools/base64-encoder-decoder",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description:
      "Convert between different units of measurement including length, weight, temperature, volume, area, and speed",
    category: "text" as const,
    icon: "fas fa-exchange-alt",
    isPopular: true,
    href: "/tools/unit-converter",
  },

  // Health Tools (8)
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index and get health insights",
    category: "health" as const,
    icon: "fas fa-weight",
    isPopular: true,
    href: "/tools/bmi-calculator",
  },
  {
    id: "calorie-calculator",
    name: "Calorie Calculator",
    description: "Calculate daily calorie needs and macronutrient breakdown",
    category: "health" as const,
    icon: "fas fa-utensils",
    href: "/tools/calorie-calculator",
  },
  {
    id: "body-fat-calculator",
    name: "Body Fat Calculator",
    description: "Calculate body fat percentage using US Navy method",
    category: "health" as const,
    icon: "fas fa-percentage",
    isPopular: true,
    href: "/tools/body-fat-calculator",
  },
  {
    id: "water-intake-calculator",
    name: "Water Intake Calculator",
    description: "Calculate daily water requirements",
    category: "health" as const,
    icon: "fas fa-tint",
    href: "/tools/water-intake-calculator",
  },
  {
    id: "protein-intake-calculator",
    name: "Protein Intake Calculator",
    description: "Calculate daily protein requirements",
    category: "health" as const,
    icon: "fas fa-drumstick-bite",
    href: "/tools/protein-intake-calculator",
  },
  {
    id: "heart-rate-calculator",
    name: "Heart Rate Calculator",
    description:
      "Calculate target heart rate zones for optimal training and fitness",
    category: "health" as const,
    icon: "fas fa-heartbeat",
    href: "/tools/heart-rate-calculator",
  },
  {
    id: "sleep-calculator",
    name: "Sleep Calculator",
    description:
      "Calculate optimal sleep and wake times based natural sleep cycles",
    category: "health" as const,
    icon: "fas fa-bed",
    href: "/tools/sleep-calculator",
  },
  {
    id: "tdee-calculator",
    name: "TDEE Calculator",
    description: "Calculate Total Daily Energy Expenditure",
    category: "health" as const,
    icon: "fas fa-bolt",
    href: "/tools/tdee-calculator",
  },
];

// Export tools directly since hrefs are now correctly set in the data
export const tools: Tool[] = toolsData;

export const popularTools = tools.filter((tool) => tool.isPopular);

export const getToolsByCategory = (category: string) => {
  if (category === "all") return tools;
  return tools.filter((tool) => tool.category === category);
};

export const getCategoryStats = () => {
  const stats: Record<string, number> = {};
  Object.keys(categories).forEach((key) => {
    stats[key] = tools.filter((tool) => tool.category === key).length;
  });
  return stats;
};
