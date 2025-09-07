import { useLocation } from 'wouter';
import { getCategoryStats } from '@/data/tools';

const CategorySection = () => {
  const [, setLocation] = useLocation();
  const stats = getCategoryStats();

  const categories = [
    {
      key: 'finance',
      title: '30+ Finance Tools',
      description: 'Loan Calculator, Mortgage Calculator, Currency Converter, ROI Calculator',
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      icon: 'fas fa-calculator',
      buttonColor: 'text-blue-600 hover:bg-blue-50',
      href: '/finance'
    },
    {
      key: 'pdf',
      title: '30+ PDF Tools',
      description: 'PDF to Word, Merge and Split, Compress PDF, PDF Editor',
      gradient: 'from-red-500 via-red-600 to-pink-700',
      icon: 'fas fa-file-pdf',
      buttonColor: 'text-red-600 hover:bg-red-50',
      href: '/pdf'
    },
    {
      key: 'text',
      title: '30+ Text Tools',
      description: 'Word Counter, Grammar Checker, AI Writer, Plagiarism Checker',
      gradient: 'from-yellow-500 via-orange-500 to-red-600',
      icon: 'fas fa-pen-fancy',
      buttonColor: 'text-orange-600 hover:bg-orange-50',
      href: '/text'
    },
    {
      key: 'health',
      title: '30+ Health Tools',
      description: 'BMI Calculator, Calorie Counter, Pregnancy Calculator, Fitness Tracker',
      gradient: 'from-pink-500 via-rose-600 to-red-700',
      icon: 'fas fa-heartbeat',
      buttonColor: 'text-pink-600 hover:bg-pink-50',
      href: '/health'
    }
  ];

  const handleCategoryClick = (href: string) => {
    setLocation(href);
  };

  return (
    <section className="py-20 bg-neutral-50" data-testid="category-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6" data-testid="text-category-title">
            Tools by Category
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto" data-testid="text-category-subtitle">
            Explore our comprehensive suite of productivity tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.key}
              className={`bg-gradient-to-br ${category.gradient} rounded-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl cursor-pointer`}
              onClick={() => handleCategoryClick(category.href)}
              data-testid={`card-category-${category.key}`}
            >
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-6">
                <i className={`${category.icon} text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-bold mb-4" data-testid={`text-category-title-${category.key}`}>
                {category.title}
              </h3>
              <p className="text-opacity-90 mb-6 text-lg leading-relaxed" data-testid={`text-category-description-${category.key}`}>
                {category.description}
              </p>
              <button
                className={`bg-white ${category.buttonColor} px-6 py-3 rounded-xl font-semibold transition-colors duration-200 inline-flex items-center`}
                data-testid={`button-explore-${category.key}`}
              >
                Explore {category.key.charAt(0).toUpperCase() + category.key.slice(1)} Tools
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
