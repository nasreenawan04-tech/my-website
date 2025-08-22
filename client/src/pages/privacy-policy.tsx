import { Helmet } from "react-helmet-async";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - DapsiWow Online Tools</title>
        <meta name="description" content="Learn about DapsiWow's privacy practices, data protection, and commitment to keeping your information secure while using our 180+ free online tools." />
        <meta name="keywords" content="privacy policy, data protection, dapsiwow privacy, online tools privacy, secure tools" />
        <meta property="og:title" content="Privacy Policy - DapsiWow Online Tools" />
        <meta property="og:description" content="Learn about DapsiWow's privacy practices and commitment to protecting your data." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/privacy" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-800 mb-6">
                Privacy <span className="text-blue-600">Policy</span>
              </h1>
              <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                Your privacy matters to us. Learn how we protect your information and maintain transparency 
                in everything we do at DapsiWow.
              </p>
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">0</div>
                  <div className="text-neutral-600 font-medium">Data Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-neutral-600 font-medium">Transparent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">No</div>
                  <div className="text-neutral-600 font-medium">Registration</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">Local</div>
                  <div className="text-neutral-600 font-medium">Processing</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Principles */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Our Privacy Principles
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                We built DapsiWow with privacy as a core principle, not an afterthought.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Privacy First</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Most tools process data locally in your browser. We don't store your personal files or information on our servers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-user-slash text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">No Registration</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Use all our tools without creating an account. No email addresses, passwords, or personal information required.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-eye-slash text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">No Tracking</h3>
                <p className="text-neutral-600 leading-relaxed">
                  We don't track your usage across websites or build profiles about you. Your activity remains private.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-handshake text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Transparent</h3>
                <p className="text-neutral-600 leading-relaxed">
                  We're completely transparent about what data we collect and how we use it. No hidden practices or fine print tricks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                  <i className="fas fa-database text-white text-2xl"></i>
                </div>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Information We Collect</h2>
                <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                  We collect minimal information to provide you with the best possible experience while respecting your privacy.
                </p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-check text-green-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Basic Analytics</h4>
                      <p className="text-neutral-600 text-sm">Anonymous usage statistics to improve our tools and user experience.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-browser text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Technical Information</h4>
                      <p className="text-neutral-600 text-sm">Browser type and version for compatibility and optimization purposes.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <i className="fas fa-times text-red-600"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">No Personal Data</h4>
                      <p className="text-neutral-600 text-sm">We don't collect names, emails, phone numbers, or any personal identifiers.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Protect Your Data */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                How We Protect Your Data
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Your security is our priority. Here's how we keep your information safe.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-laptop text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Local Processing</h3>
                <p className="text-neutral-600">
                  Most tools process your files directly in your browser. Your data never leaves your device unless absolutely necessary.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-lock text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">HTTPS Encryption</h3>
                <p className="text-neutral-600">
                  All data transmission is encrypted using industry-standard HTTPS protocols to prevent unauthorized access.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-trash-alt text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Automatic Deletion</h3>
                <p className="text-neutral-600">
                  Any temporary files created during processing are automatically deleted immediately after completion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-3xl p-12 shadow-xl max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-neutral-800 mb-6">Questions About Our Privacy Policy?</h2>
              <p className="text-lg text-neutral-600 mb-8">
                We're committed to transparency and are happy to answer any questions about how we handle your privacy.
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