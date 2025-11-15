import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, Calculator } from 'lucide-react';
import { Link } from 'wouter';

interface IntroductionSectionProps {
  content: string;
  toolName: string;
}

export function IntroductionSection({ content, toolName }: IntroductionSectionProps) {
  return (
    <section className="py-12 bg-background" data-testid="section-introduction">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          About the {toolName}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {content}
        </p>
      </div>
    </section>
  );
}

interface HowToSectionProps {
  steps: Array<{
    position: number;
    name: string;
    text: string;
  }>;
}

export function HowToSection({ steps }: HowToSectionProps) {
  return (
    <section className="py-12 bg-muted/30" data-testid="section-howto" id="how-to-use">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          How to Use This Calculator
        </h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <Card key={step.position} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3" id={`step${step.position}`}>
                  Step {step.position}: {step.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

interface Example {
  title: string;
  description: string;
}

interface ExamplesSectionProps {
  examples: Example[];
}

export function ExamplesSection({ examples }: ExamplesSectionProps) {
  return (
    <section className="py-12 bg-background" data-testid="section-examples" id="examples">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          Real-World Examples
        </h2>
        <div className="grid gap-6">
          {examples.map((example, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {example.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {example.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FormulaSectionProps {
  formula: string;
  explanation?: string;
}

export function FormulaSection({ formula, explanation }: FormulaSectionProps) {
  return (
    <section className="py-12 bg-muted/30" data-testid="section-formula" id="formula">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          The Formula Behind the Calculator
        </h2>
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="bg-muted/50 rounded-md p-4 mb-4 font-mono text-sm overflow-x-auto">
              {formula}
            </div>
            {explanation && (
              <p className="text-muted-foreground leading-relaxed">
                {explanation}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

interface ComparisonSectionProps {
  content: string;
}

export function ComparisonSection({ content }: ComparisonSectionProps) {
  return (
    <section className="py-12 bg-background" data-testid="section-comparison" id="comparison">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          Why Use This Calculator?
        </h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <section className="py-12 bg-muted/30" data-testid="section-faq" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

interface RelatedToolsSectionProps {
  relatedTools: Array<{
    slug: string;
    name: string;
    description: string;
    category: string;
  }>;
}

export function RelatedToolsSection({ relatedTools }: RelatedToolsSectionProps) {
  return (
    <section className="py-12 bg-background" data-testid="section-related-tools" id="related-tools">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          Related Tools You Might Need
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {relatedTools.map((tool) => (
            <Link key={tool.slug} href={`/${tool.slug}`}>
              <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Calculator className="text-primary mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FinalCTASectionProps {
  toolName: string;
  primaryBenefit: string;
}

export function FinalCTASection({ toolName, primaryBenefit }: FinalCTASectionProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5" data-testid="section-cta">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          {primaryBenefit} Try our {toolName} now - it's completely free, requires no registration, and works on all devices.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={scrollToTop}
            data-testid="button-scroll-to-top"
          >
            <ArrowUp className="mr-2" size={20} />
            Start Calculating
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            asChild
            data-testid="button-view-all-tools"
          >
            <Link href="/all-tools">
              View All Tools
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Bookmark this page for quick access to your calculations anytime. 
            All calculations are private and performed locally in your browser - no data is stored on our servers.
          </p>
        </div>
      </div>
    </section>
  );
}
