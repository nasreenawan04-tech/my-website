import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Info, CheckCircle2 } from 'lucide-react';

interface SIOProps {
  category: 'finance' | 'text' | 'health';
  toolName: string;
}

const SEARCH_INTENTS = {
  finance: {
    title: "Why accuracy matters in financial planning",
    tips: [
      "Always include taxes and hidden fees in your principal amounts.",
      "Compare different interest rates to see long-term savings potential.",
      "Use our amortization schedule to track your principal vs interest ratio."
    ]
  },
  text: {
    title: "Optimizing your content for clarity",
    tips: [
      "Keep sentences concise to improve readability scores.",
      "Use our case converter to maintain consistent brand styling.",
      "Check word counts against platform-specific limits (e.g., social media)."
    ]
  },
  health: {
    title: "Understanding your health metrics",
    tips: [
      "BMI is a screening tool, not a diagnostic of body fat or health.",
      "Ensure you're measuring your waist at the correct point for body fat tests.",
      "Consult a professional before making drastic changes based on calorie needs."
    ]
  }
};

export function SearchIntentSection({ category, toolName }: SIOProps) {
  const intent = SEARCH_INTENTS[category];

  return (
    <section className="mt-12 space-y-8" aria-labelledby="sio-title">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="h-full border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-blue-500" />
                <h3 id="sio-title" className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  {intent.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {intent.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-neutral-600 dark:text-neutral-400">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-6 h-6 text-indigo-500" />
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  Expert Tip for {toolName}
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Most users searching for a <strong>{toolName}</strong> are looking for instant, 
                reliable answers without complex registrations. Our tool uses professional-grade 
                algorithms to ensure your data is processed with 99.9% precision, saving you 
                valuable time in your daily workflow.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
