import { useLocation } from 'wouter';
import { getCategoryStats } from '@/data/tools';
import { Calculator, PenTool, HeartPulse, ArrowRight } from 'lucide-react';

const CategorySection = () => {
  const [, setLocation] = useLocation();
  const stats = getCategoryStats();

  const categories = [
    {
      key: 'finance',
      title: '30+ Finance Tools',
      description: 'Loan Calculator, Mortgage Calculator, Tax Calculator, ROI Calculator',
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      icon: Calculator,
      buttonColor: 'text-blue-600 hover:bg-blue-50',
      href: '/finance-tools'
    },
    {
      key: 'text',
      title: '30+ Text Tools',
      description: 'Word Counter, Grammar Checker, AI Writer, Plagiarism Checker',
      gradient: 'from-yellow-500 via-orange-500 to-red-600',
      icon: PenTool,
      buttonColor: 'text-orange-600 hover:bg-orange-50',
      href: '/text-tools'
    },
    {
      key: 'health',
      title: '30+ Health Tools',
      description: 'BMI Calculator, Calorie Counter, Pregnancy Calculator, Fitness Tracker',
      gradient: 'from-pink-500 via-rose-600 to-red-700',
      icon: HeartPulse,
      buttonColor: 'text-pink-600 hover:bg-pink-50',
      href: '/health-tools'
    }
  ];

  const handleCategoryClick = (href: string) => {
    setLocation(href);
  };

  return (
    <section className="py-24 bg-neutral-50" data-testid="category-section" aria-label="Tool Categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-8" data-testid="text-category-title">
            Tools by Category
          </h2>
          <p className="text-xl text-neutral-700 max-w-3xl mx-auto" data-testid="text-category-subtitle">
            Explore our comprehensive suite of productivity tools organized by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.key}
                className={`bg-gradient-to-br ${category.gradient} rounded-3xl p-10 text-white transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl cursor-pointer border-2 border-white/20`}
                onClick={() => handleCategoryClick(category.href)}
                data-testid={`card-category-${category.key}`}
                role="button"
                tabIndex={0}
                aria-label={`Explore ${category.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(category.href);
                  }
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold" data-testid={`text-category-title-${category.key}`}>
                    {category.title}
                  </h3>
                </div>
                <p className="text-white/90 mb-8 text-lg leading-relaxed" data-testid={`text-category-description-${category.key}`}>
                  {category.description}
                </p>
                <button
                  className={`bg-white ${category.buttonColor} px-8 py-4 rounded-xl font-semibold transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105`}
                  data-testid={`button-explore-${category.key}`}
                  aria-label={`Explore ${category.key} tools`}
                >
                  Explore {category.key.charAt(0).toUpperCase() + category.key.slice(1)} Tools
                  <ArrowRight className="ml-2" size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;