import { ToolSEOConfig } from "../types";

export const wordCounterSEO: ToolSEOConfig = {
  title: "Word Counter - Count Words and Characters Online | DapsiWow",
  description: "Free online word count tool. Count words, characters, sentences, and paragraphs in real-time. Perfect for writers and students.",
  ogImage: "/og/word-counter.png",
  keywords: ["word counter", "character counter", "word count tool", "text analysis"],
  faqs: [
    {
      question: "Does the word counter save my text?",
      answer: "No, your text is processed entirely in your browser and is never sent to our servers."
    }
  ],
  howTo: {
    name: "How to Use Word Counter",
    steps: [
      {
        name: "Paste Text",
        text: "Copy and paste your text into the input area."
      },
      {
        name: "View Stats",
        text: "The word and character counts will update automatically as you type."
      }
    ]
  }
};
