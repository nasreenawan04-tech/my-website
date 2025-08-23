
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { tools } from '@/data/tools';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ToolPage = () => {
  const [location] = useLocation();
  const [tool, setTool] = useState(null);

  useEffect(() => {
    // Extract tool ID from URL path like /tools/loan-calculator
    const pathParts = location.split('/');
    const toolId = pathParts[2]; // tools/[toolId]
    
    if (toolId) {
      const foundTool = tools.find(t => t.id === toolId);
      setTool(foundTool);
    }
  }, [location]);

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">Tool Not Found</h1>
            <p className="text-neutral-600 mb-8">The tool you're looking for doesn't exist or isn't available yet.</p>
            <a 
              href="/all-tools"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Browse All Tools
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-neutral-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className={`${tool.icon} text-3xl`}></i>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {tool.name}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {tool.description}
            </p>
            {tool.isPopular && (
              <div className="inline-flex items-center px-4 py-2 bg-yellow-500 bg-opacity-20 text-yellow-100 rounded-full text-sm font-medium">
                <i className="fas fa-star mr-2"></i>
                Popular Tool
              </div>
            )}
          </div>
        </section>

        {/* Tool Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                  {tool.name} - Coming Soon
                </h2>
                <p className="text-neutral-600 mb-6">
                  We're working hard to bring you this amazing tool. It will be available soon!
                </p>
                
                {/* Placeholder content */}
                <div className="bg-neutral-100 rounded-xl p-12 mb-8">
                  <i className={`${tool.icon} text-6xl text-neutral-400 mb-4`}></i>
                  <p className="text-neutral-500">
                    Tool interface will be available here once development is complete.
                  </p>
                </div>

                {/* Tool Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-bolt text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Fast & Efficient</h3>
                    <p className="text-sm text-neutral-600">Get results instantly with our optimized algorithms</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-shield-alt text-green-600"></i>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Secure & Private</h3>
                    <p className="text-sm text-neutral-600">Your data is processed securely and never stored</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-mobile-alt text-purple-600"></i>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Mobile Friendly</h3>
                    <p className="text-sm text-neutral-600">Works perfectly on all devices and screen sizes</p>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`/${tool.category}-tools`}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Browse {tool.category.charAt(0).toUpperCase() + tool.category.slice(1)} Tools
                  </a>
                  <a
                    href="/all-tools"
                    className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    View All Tools
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ToolPage;
