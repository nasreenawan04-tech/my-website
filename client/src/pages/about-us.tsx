
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Learn More About DapsiWow</title>
        <meta name="description" content="Learn about DapsiWow's mission to provide free, accessible online tools for everyone. Discover our story, values, and commitment to user privacy." />
        <meta name="keywords" content="about dapsiwow, mission, free tools, online utilities, team" />
        <meta property="og:title" content="About Us - Learn More About DapsiWow" />
        <meta property="og:description" content="Learn about DapsiWow's mission to provide free, accessible online tools for everyone." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/about" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-800 mb-6">
                About <span className="text-blue-600">DapsiWow</span>
              </h1>
              <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                Empowering millions of users worldwide with free, accessible, and reliable online tools 
                that make everyday tasks simpler and more efficient.
              </p>
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">1M+</div>
                  <div className="text-neutral-600 font-medium">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">150+</div>
                  <div className="text-neutral-600 font-medium">Free Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-neutral-600 font-medium">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-neutral-600 font-medium">Available</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                  <i className="fas fa-rocket text-white text-2xl"></i>
                </div>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Our Mission</h2>
                <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                  At DapsiWow, we believe that powerful digital tools should be accessible to everyone, regardless of 
                  their technical expertise or budget. Our mission is to democratize access to essential online utilities 
                  that help people be more productive, creative, and efficient in their daily lives.
                </p>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  We're committed to breaking down barriers and making professional-grade tools available to students, 
                  professionals, entrepreneurs, and anyone who needs them - completely free, forever.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-12 shadow-inner">
                <div className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <i className="fas fa-users text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">For Everyone</h4>
                      <p className="text-neutral-600 text-sm">Accessible to all skill levels</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <i className="fas fa-heart text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Always Free</h4>
                      <p className="text-neutral-600 text-sm">No hidden costs or subscriptions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                      <i className="fas fa-shield-alt text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Privacy First</h4>
                      <p className="text-neutral-600 text-sm">Your data stays secure and private</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                What We Offer
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                A comprehensive collection of 150+ free online tools across 4 main categories, 
                designed to meet all your digital needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-calculator text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Finance Tools</h3>
                <p className="text-neutral-600 mb-4">
                  Advanced calculators for loans, mortgages, investments, taxes, and financial planning.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• Loan & Mortgage Calculators</li>
                  <li>• Investment & ROI Tools</li>
                  <li>• Currency Converters</li>
                  <li>• Tax & Budget Planners</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-file-pdf text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">PDF Tools</h3>
                <p className="text-neutral-600 mb-4">
                  Complete PDF management suite for converting, merging, splitting, and editing documents.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• Convert to/from PDF</li>
                  <li>• Merge & Split PDFs</li>
                  <li>• Compress & Optimize</li>
                  <li>• Password Protection</li>
                </ul>
              </div>


              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-font text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Text Tools</h3>
                <p className="text-neutral-600 mb-4">
                  Comprehensive text processing utilities for writers, editors, and content creators.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• Word & Character Counters</li>
                  <li>• Text Formatters</li>
                  <li>• Case Converters</li>
                  <li>• Content Generators</li>
                </ul>
              </div>


              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-heartbeat text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Health Tools</h3>
                <p className="text-neutral-600 mb-4">
                  Health and fitness calculators to help you maintain a healthy lifestyle.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• BMI & Body Fat Calculators</li>
                  <li>• Calorie Counters</li>
                  <li>• Fitness Trackers</li>
                  <li>• Health Assessments</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Our Core Values
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                These principles guide everything we do and every decision we make at DapsiWow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-gift text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Free Forever</h3>
                <p className="text-neutral-600 leading-relaxed">
                  All our tools are completely free to use with no hidden fees, subscriptions, or premium tiers. 
                  Quality tools shouldn't cost a fortune.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-user-shield text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Privacy First</h3>
                <p className="text-neutral-600 leading-relaxed">
                  We respect your privacy and don't store your personal data or require account creation. 
                  Your information stays yours.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-smile text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">User-Friendly</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Our tools are designed to be intuitive and accessible to users of all technical levels. 
                  Simplicity is our strength.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-check-circle text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Reliable</h3>
                <p className="text-neutral-600 leading-relaxed">
                  We maintain high standards of accuracy and reliability across all our tools and services. 
                  You can depend on us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Community & Impact Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Our Global Impact
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                DapsiWow serves millions of users worldwide, from students and professionals to entrepreneurs and hobbyists. 
                We're proud to be part of a global community that values efficiency, productivity, and accessibility.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-4">50M+</div>
                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Tasks Completed</h4>
                <p className="text-neutral-600">Tools used to complete millions of tasks and projects worldwide</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-4">195</div>
                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Countries Served</h4>
                <p className="text-neutral-600">Users from almost every country trust our platform daily</p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-4">15TB+</div>
                <h4 className="text-lg font-semibold text-neutral-800 mb-2">Data Processed</h4>
                <p className="text-neutral-600">Files and data securely processed through our tools</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-12 shadow-xl">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-neutral-800 mb-4">Join Our Community</h3>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  Be part of a global community that believes in making powerful tools accessible to everyone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/tools" 
                  className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 text-center"
                >
                  Start Using Tools
                </a>
                <a 
                  href="/contact" 
                  className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutUs;
