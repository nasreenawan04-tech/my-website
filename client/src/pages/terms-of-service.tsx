import { Helmet } from "react-helmet-async";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - DapsiWow Online Tools</title>
        <meta name="description" content="Read DapsiWow's Terms of Service to understand the rules and guidelines for using our 180+ free online tools responsibly and legally." />
        <meta name="keywords" content="terms of service, dapsiwow terms, online tools terms, usage guidelines, user agreement" />
        <meta property="og:title" content="Terms of Service - DapsiWow Online Tools" />
        <meta property="og:description" content="Understand the terms and conditions for using DapsiWow's free online tools." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/terms" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-800 mb-6">
                Terms of <span className="text-blue-600">Service</span>
              </h1>
              <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                Simple, fair guidelines for using DapsiWow's 180+ free online tools. 
                We believe in transparency and straightforward terms.
              </p>
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">Free</div>
                  <div className="text-neutral-600 font-medium">Forever</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Fair</div>
                  <div className="text-neutral-600 font-medium">Usage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">No</div>
                  <div className="text-neutral-600 font-medium">Hidden Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">Open</div>
                  <div className="text-neutral-600 font-medium">Access</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Principles */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Key Principles
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Our terms are built on fairness, transparency, and mutual respect.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-gift text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Always Free</h3>
                <p className="text-neutral-600 leading-relaxed">
                  All our tools are completely free to use for personal and commercial purposes. No subscriptions or hidden costs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-handshake text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Fair Use</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Use our tools responsibly and ethically. We trust our users to be good digital citizens.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-balance-scale text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">No Fine Print</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Our terms are written in plain English. No legal jargon or hidden clauses to confuse you.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Mutual Respect</h3>
                <p className="text-neutral-600 leading-relaxed">
                  We respect your privacy and data. In return, we ask that you respect our platform and other users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                  <i className="fas fa-user-check text-white text-2xl"></i>
                </div>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Usage Guidelines</h2>
                <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                  Simple rules to ensure everyone can enjoy our tools safely and fairly.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-check text-green-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Use Responsibly</h4>
                      <p className="text-neutral-600 text-sm">Use our tools for legitimate, legal purposes only. Be respectful of our platform and other users.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-briefcase text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Commercial Use OK</h4>
                      <p className="text-neutral-600 text-sm">Feel free to use our tools for business and commercial projects without restrictions.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-times text-red-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">No Abuse</h4>
                      <p className="text-neutral-600 text-sm">Don't attempt to reverse engineer, copy, or misuse our tools in harmful ways.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights and Ours */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Your Rights & Ours
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Understanding what you can expect from us and what we expect from you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-user-shield text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">Your Rights</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-check text-green-600 mt-1"></i>
                    <span className="text-neutral-600">Free access to all 180+ tools without restrictions</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-check text-green-600 mt-1"></i>
                    <span className="text-neutral-600">Privacy protection and secure data handling</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-check text-green-600 mt-1"></i>
                    <span className="text-neutral-600">Use tools for personal and commercial purposes</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-check text-green-600 mt-1"></i>
                    <span className="text-neutral-600">Support and assistance when needed</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-balance-scale text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">Our Rights</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
                    <span className="text-neutral-600">Maintain service quality and platform integrity</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
                    <span className="text-neutral-600">Update terms with reasonable notice</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
                    <span className="text-neutral-600">Restrict access for misuse or abuse</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
                    <span className="text-neutral-600">Protect our intellectual property</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-3xl p-12 shadow-xl max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-neutral-800 mb-6">Questions About Our Terms?</h2>
              <p className="text-lg text-neutral-600 mb-8">
                We're here to help clarify any questions you might have about using our platform and tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 text-center"
                >
                  Contact Our Team
                </a>
                <a 
                  href="/help" 
                  className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  Visit Help Center
                </a>
              </div>
              <p className="text-sm text-neutral-500 mt-6">
                Last updated: August 2025
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}