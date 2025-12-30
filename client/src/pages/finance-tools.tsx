import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Calculator, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/data/tools';
import { searchAndFilterTools } from '@/lib/search';
import { CategorySEOHead } from '@/components/seo/CategorySEOHead';

const FinanceTools = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState(tools.filter(tool => tool.category === 'finance'));

  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search') || '';
    setSearchQuery(searchParam);
  }, [location]);

  useEffect(() => {
    const filtered = searchAndFilterTools(searchQuery, 'finance');
    setFilteredTools(filtered);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const floatingShapes = [
    { size: 80, top: '10%', left: '5%', delay: 0, duration: 20, rotate: 360 },
    { size: 60, top: '20%', right: '8%', delay: 2, duration: 25, rotate: -360 },
    { size: 100, bottom: '15%', left: '10%', delay: 1, duration: 30, rotate: 180 },
    { size: 40, top: '60%', right: '15%', delay: 3, duration: 22, rotate: -180 },
    { size: 70, top: '40%', left: '15%', delay: 1.5, duration: 28, rotate: 360 },
    { size: 50, bottom: '25%', right: '10%', delay: 2.5, duration: 26, rotate: -360 },
    { size: 90, top: '15%', left: '45%', delay: 0.5, duration: 24, rotate: 180 },
    { size: 55, bottom: '30%', left: '40%', delay: 1.8, duration: 27, rotate: -180 },
  ];

  const animatedDots = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })),
    []
  );

  return (
    <>
      <CategorySEOHead 
        category="finance"
        title="Finance Tools - Free Financial Calculators | DapsiWow"
        description="Access 8 free financial calculators including loan, mortgage, EMI, and business loan tools. Make informed money decisions with instant, accurate results."
      />

      <div className="min-h-screen flex flex-col" data-testid="page-finance-tools">
        <Header />
        
        <main className="flex-1 bg-neutral-50">
          <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white py-16 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {floatingShapes.map((shape, index) => (
                <motion.div
                  key={index}
                  className="absolute rounded-full bg-white/5 backdrop-blur-sm"
                  style={{
                    width: shape.size,
                    height: shape.size,
                    top: shape.top,
                    bottom: shape.bottom,
                    left: shape.left,
                    right: shape.right,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 15, 0],
                    rotate: [0, shape.rotate],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: shape.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: shape.delay,
                  }}
                />
              ))}
              
              <motion.div
                className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              
              {animatedDots.map((dot) => (
                <motion.div
                  key={`dot-${dot.id}`}
                  className="absolute w-2 h-2 rounded-full bg-white/20"
                  style={{
                    top: `${dot.top}%`,
                    left: `${dot.left}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: dot.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: dot.delay,
                  }}
                />
              ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div 
                className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Calculator className="w-12 h-12 text-white" />
              </motion.div>
              <motion.h1 
                className="text-4xl sm:text-5xl font-bold mb-4"
                data-testid="finance-page-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                Finance Tools
              </motion.h1>
              <motion.p 
                className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              >
                Free financial calculators to help you make smart money decisions
              </motion.p>
              
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search finance tools..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full py-4 px-6 pr-16 text-lg text-neutral-800 bg-white rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                    data-testid="input-search-finance-tools"
                  />
                  <div className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center pointer-events-none">
                    <Search className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="tools" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                  <p className="text-neutral-600 text-center" data-testid="finance-results-count">
                    Showing {filteredTools.length} tools
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
              </div>

              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8" data-testid="grid-finance-tools">
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" data-testid="empty-state-no-tools">
                  <i className="fas fa-search text-6xl text-neutral-300 mb-4"></i>
                  <h3 className="text-2xl font-bold text-neutral-600 mb-2">No finance tools found</h3>
                  <p className="text-neutral-500">
                    Try adjusting your search query.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Related Categories Section */}
          <section className="py-16 bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-8 text-center">Explore Other Tool Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/text-tools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Text Tools</h3>
                  <p className="text-neutral-600 mb-4">Use 7 text processing tools including word counter, password generator, and QR code scanner.</p>
                  <span className="text-blue-600 font-semibold hover:underline">Explore Text Tools →</span>
                </a>
                <a href="/health-tools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">Health Tools</h3>
                  <p className="text-neutral-600 mb-4">Access 8 health and fitness calculators including BMI, calorie, body fat, and TDEE calculators.</p>
                  <span className="text-blue-600 font-semibold hover:underline">Explore Health Tools →</span>
                </a>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-700 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Take Control of Your Finances Today</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Make smarter financial decisions with our free, accurate, and easy-to-use calculators. Plan your future and achieve your financial goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#tools" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Browse All Tools
                </a>
                <a href={user ? "/profile" : "/signup"} className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  {user ? "View Profile" : "Create Free Account"}
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FinanceTools;
