import { ToolSEOConfig } from "../types";

export const mortgageCalculatorSEO: ToolSEOConfig = {
  title: "Mortgage Calculator - Estimate Your Monthly Payments | DapsiWow",
  description: "Use our free mortgage calculator to estimate your monthly house payments, including principal, interest, taxes, and insurance. Plan your home purchase today.",
  ogImage: "/og/mortgage-calculator.png",
  keywords: ["mortgage calculator", "home loan calculator", "house payment estimator", "monthly mortgage payment"],
  faqs: [
    {
      question: "How do I calculate my monthly mortgage payment?",
      answer: "You can calculate your monthly mortgage payment by using our calculator with your home price, down payment, interest rate, and loan term."
    },
    {
      question: "Does this mortgage calculator include taxes and insurance?",
      answer: "Yes, you can input estimated property taxes and homeowners insurance to get a more accurate total monthly payment."
    }
  ],
  howTo: {
    name: "How to Use the Mortgage Calculator",
    steps: [
      {
        name: "Enter Home Price",
        text: "Input the total purchase price of the home you are considering."
      },
      {
        name: "Specify Down Payment",
        text: "Enter the amount of cash you plan to pay upfront."
      },
      {
        name: "Set Interest Rate and Term",
        text: "Enter the annual interest rate and the length of the loan in years."
      }
    ]
  }
};
