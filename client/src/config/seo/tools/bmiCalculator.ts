import { ToolSEOConfig } from "../types";

export const bmiCalculatorSEO: ToolSEOConfig = {
  title: "BMI Calculator - Calculate Your Body Mass Index | DapsiWow",
  description: "Check your Body Mass Index (BMI) with our free calculator. Understand your weight category and maintain a healthy lifestyle.",
  ogImage: "/og/bmi-calculator.png",
  keywords: ["bmi calculator", "body mass index", "weight category", "health calculator"],
  faqs: [
    {
      question: "What is a healthy BMI range?",
      answer: "For most adults, a healthy BMI is between 18.5 and 24.9."
    },
    {
      question: "How accurate is BMI?",
      answer: "BMI is a useful screening tool but does not directly measure body fat or account for muscle mass."
    }
  ],
  howTo: {
    name: "How to Check Your BMI",
    steps: [
      {
        name: "Select Unit System",
        text: "Choose between Metric (kg/cm) or Imperial (lb/in) units."
      },
      {
        name: "Enter Height",
        text: "Input your current height accurately."
      },
      {
        name: "Enter Weight",
        text: "Input your current weight."
      }
    ]
  }
};
