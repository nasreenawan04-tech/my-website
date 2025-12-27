import { ToolSEOConfig } from "../types";

export const passwordGeneratorSEO: ToolSEOConfig = {
  title: "Secure Password Generator - Create Strong Passwords | DapsiWow",
  description: "Generate secure, random passwords to protect your online accounts. Customize length and character types for maximum security.",
  ogImage: "/og/password-generator.png",
  keywords: ["password generator", "secure password", "random password", "security tool"],
  faqs: [
    {
      question: "What makes a password strong?",
      answer: "A strong password is long (at least 12 characters) and includes a mix of uppercase, lowercase, numbers, and symbols."
    }
  ],
  howTo: {
    name: "How to Generate a Password",
    steps: [
      {
        name: "Select Length",
        text: "Choose how many characters long you want your password to be."
      },
      {
        name: "Toggle Options",
        text: "Include or exclude numbers, symbols, and case variations."
      },
      {
        name: "Generate",
        text: "Click the generate button and copy your new secure password."
      }
    ]
  }
};
