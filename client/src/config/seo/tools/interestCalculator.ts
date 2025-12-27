import { ToolSEOConfig } from "../types";

export const interestCalculatorSEO: ToolSEOConfig = {
  title: "Simple & Compound Interest Calculator | DapsiWow",
  description: "Calculate simple and compound interest easily. Understand how your savings grow over time with our accurate interest rate tool.",
  ogImage: "/og/interest-calculator.png",
  keywords: ["interest calculator", "simple interest", "compound interest", "savings calculator", "investment growth"],
  faqs: [
    {
      question: "What is the difference between simple and compound interest?",
      answer: "Simple interest is calculated only on the principal amount, while compound interest is calculated on the principal plus any accumulated interest."
    }
  ],
  howTo: {
    name: "How to Calculate Interest",
    steps: [
      {
        name: "Enter Principal",
        text: "Input the initial amount of money deposited or borrowed."
      },
      {
        name: "Set Interest Rate",
        text: "Enter the annual interest rate percentage."
      },
      {
        name: "Define Time Period",
        text: "Specify how long the money will be invested or borrowed."
      }
    ]
  }
};
