import { ToolSEOConfig } from "../types";

export const emiCalculatorSEO: ToolSEOConfig = {
  title: "EMI Calculator - Calculate Monthly Loan Repayments | DapsiWow",
  description: "Quickly calculate your Equated Monthly Installment (EMI) for any loan. Plan your finances with our easy-to-use EMI calculator for personal, car, or home loans.",
  ogImage: "/og/emi-calculator.png",
  keywords: ["emi calculator", "loan emi calculator", "monthly repayment calculator", "finance calculator"],
  faqs: [
    {
      question: "What is EMI?",
      answer: "EMI stands for Equated Monthly Installment, which is a fixed payment amount made by a borrower to a lender at a specified date each calendar month."
    },
    {
      question: "How is EMI calculated?",
      answer: "EMI is calculated using the formula: [P x R x (1+R)^N]/[(1+R)^N-1], where P is the principal, R is the monthly interest rate, and N is the number of monthly installments."
    }
  ],
  howTo: {
    name: "How to Calculate Loan EMI",
    steps: [
      {
        name: "Input Principal Amount",
        text: "Enter the total loan amount you wish to borrow."
      },
      {
        name: "Enter Interest Rate",
        text: "Input the annual interest rate offered by the lender."
      },
      {
        name: "Select Loan Tenure",
        text: "Choose the duration of the loan in years or months."
      }
    ]
  }
};
