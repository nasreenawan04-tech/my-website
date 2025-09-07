import { Helmet } from "react-helmet-async";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - DapsiWow Online Tools | Data Protection & Security</title>
        <meta name="description" content="Comprehensive privacy policy for DapsiWow's 150+ free online tools. Learn how we protect your data, ensure privacy, and maintain GDPR compliance with transparent practices." />
        <meta name="keywords" content="privacy policy, data protection, GDPR compliance, online tools privacy, secure file processing, no data collection, local processing, user privacy rights, data security, transparent privacy practices" />
        <meta property="og:title" content="Privacy Policy - DapsiWow Online Tools | Data Protection & Security" />
        <meta property="og:description" content="Comprehensive privacy policy covering data protection, user rights, and security measures for DapsiWow's free online tools." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/privacy" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="DapsiWow" />
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

        {/* Detailed Information Collection */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                What Information Do We Collect?
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Transparency is key to building trust. Here's exactly what we collect and why.
              </p>
            </div>

            <div className="space-y-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                  <i className="fas fa-user-times text-red-500 mr-4"></i>
                  Personal Information We DO NOT Collect
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Names or personal identifiers</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Email addresses or contact information</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Phone numbers or physical addresses</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Credit card or payment information</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Social security or government ID numbers</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Biometric data or facial recognition</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Location tracking or GPS coordinates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-neutral-600">Cross-site tracking or behavioral profiles</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                  <i className="fas fa-chart-bar text-blue-500 mr-4"></i>
                  Anonymous Technical Data We Collect
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <i className="fas fa-browser text-blue-600 text-3xl mb-4"></i>
                    <h4 className="font-semibold text-neutral-800 mb-2">Browser Information</h4>
                    <p className="text-sm text-neutral-600">Browser type, version, and capabilities to ensure tool compatibility and optimize performance across different platforms.</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <i className="fas fa-desktop text-green-600 text-3xl mb-4"></i>
                    <h4 className="font-semibold text-neutral-800 mb-2">Device Information</h4>
                    <p className="text-sm text-neutral-600">Screen resolution, device type (desktop/mobile), and operating system to provide responsive designs and optimal user experience.</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <i className="fas fa-mouse-pointer text-purple-600 text-3xl mb-4"></i>
                    <h4 className="font-semibold text-neutral-800 mb-2">Usage Analytics</h4>
                    <p className="text-sm text-neutral-600">Anonymous usage patterns, popular tools, and general engagement metrics to improve our platform and develop new features.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies and Tracking */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-8">
                  <i className="fas fa-cookie-bite text-white text-2xl"></i>
                </div>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Cookies & Tracking Technology</h2>
                <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                  We use minimal, essential cookies to provide basic functionality. No advertising or tracking cookies are used.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-check-circle text-green-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Essential Cookies Only</h4>
                      <p className="text-neutral-600 text-sm">Required for basic site functionality and user preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-times-circle text-red-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">No Advertising Cookies</h4>
                      <p className="text-neutral-600 text-sm">We don't use cookies for ads, marketing, or behavioral targeting</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-times-circle text-red-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">No Third-Party Tracking</h4>
                      <p className="text-neutral-600 text-sm">No external tracking scripts, pixels, or analytics beyond basic usage</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-800 mb-6">Cookie Management</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-neutral-800 mb-2">Browser Controls</h4>
                    <p className="text-neutral-600 text-sm">You can disable cookies in your browser settings at any time. Our tools will still work without cookies.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-neutral-800 mb-2">Automatic Expiry</h4>
                    <p className="text-neutral-600 text-sm">All cookies automatically expire within 30 days and are regularly cleared from our systems.</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h4 className="font-semibold text-neutral-800 mb-2">No Cross-Site Tracking</h4>
                    <p className="text-neutral-600 text-sm">Our cookies only work on DapsiWow and don't track you across other websites.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Retention and Deletion */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Data Retention & Deletion
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                We keep data only as long as necessary and automatically delete everything else.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Immediate Deletion</h3>
                <p className="text-neutral-600 mb-4">Files uploaded for processing are automatically deleted immediately after your session ends.</p>
                <div className="text-sm text-neutral-500 space-y-1">
                  <div>• PDF conversions</div>
                  <div>• Image processing</div>
                  <div>• Document uploads</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-calendar-week text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">30-Day Retention</h3>
                <p className="text-neutral-600 mb-4">Anonymous usage statistics and error logs are kept for 30 days to improve our services.</p>
                <div className="text-sm text-neutral-500 space-y-1">
                  <div>• Usage analytics</div>
                  <div>• Error logs</div>
                  <div>• Performance metrics</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-infinity text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">No Long-Term Storage</h3>
                <p className="text-neutral-600 mb-4">We don't keep long-term databases of user activity or create permanent records of your tool usage.</p>
                <div className="text-sm text-neutral-500 space-y-1">
                  <div>• No user profiles</div>
                  <div>• No activity history</div>
                  <div>• No permanent records</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Your Privacy Rights
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                You have complete control over your data and privacy. Here are your rights under GDPR, CCPA, and other privacy laws.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 text-center">
                <i className="fas fa-eye text-blue-600 text-3xl mb-4"></i>
                <h3 className="text-lg font-bold text-neutral-800 mb-3">Right to Know</h3>
                <p className="text-neutral-600 text-sm">You have the right to know what data we collect and how we use it. This privacy policy provides complete transparency.</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 text-center">
                <i className="fas fa-download text-green-600 text-3xl mb-4"></i>
                <h3 className="text-lg font-bold text-neutral-800 mb-3">Right to Access</h3>
                <p className="text-neutral-600 text-sm">Request a copy of any data we have about you, though since we collect minimal data, there's usually nothing to provide.</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6 text-center">
                <i className="fas fa-edit text-purple-600 text-3xl mb-4"></i>
                <h3 className="text-lg font-bold text-neutral-800 mb-3">Right to Correct</h3>
                <p className="text-neutral-600 text-sm">Request correction of any inaccurate data, though our minimal data collection makes this rarely necessary.</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 text-center">
                <i className="fas fa-trash text-red-600 text-3xl mb-4"></i>
                <h3 className="text-lg font-bold text-neutral-800 mb-3">Right to Delete</h3>
                <p className="text-neutral-600 text-sm">Request deletion of your data at any time. Contact us and we'll remove any information we have within 48 hours.</p>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-800 mb-4 text-center">How to Exercise Your Rights</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <i className="fas fa-envelope text-orange-600 text-2xl mb-3"></i>
                  <h4 className="font-semibold text-neutral-800 mb-2">Contact Us</h4>
                  <p className="text-neutral-600 text-sm">Send us your request through our contact form with details about what you need.</p>
                </div>
                <div className="text-center">
                  <i className="fas fa-clock text-orange-600 text-2xl mb-3"></i>
                  <h4 className="font-semibold text-neutral-800 mb-2">48-Hour Response</h4>
                  <p className="text-neutral-600 text-sm">We'll respond to your request within 48 hours with the information or action you requested.</p>
                </div>
                <div className="text-center">
                  <i className="fas fa-shield-check text-orange-600 text-2xl mb-3"></i>
                  <h4 className="font-semibold text-neutral-800 mb-2">Identity Verification</h4>
                  <p className="text-neutral-600 text-sm">We may ask for verification to protect your privacy, but since we don't collect personal data, this is rarely needed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Third-Party Services
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                We minimize third-party integrations to protect your privacy, but here's what we use and why.
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-server text-white text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-800 mb-3">Hosting & Infrastructure</h3>
                    <p className="text-neutral-600 mb-4">
                      Our website is hosted on secure, privacy-compliant servers. These services only receive the minimal data necessary to deliver our tools to you.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">GDPR and CCPA compliant hosting</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">No data sharing with hosting providers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">Encrypted data transmission</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">Regular security audits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-chart-line text-white text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-800 mb-3">Anonymous Analytics</h3>
                    <p className="text-neutral-600 mb-4">
                      We use privacy-focused analytics that don't collect personal information, track users across sites, or use cookies for advertising.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">No personal identifiers collected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">No cross-site tracking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">Aggregated data only</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-check text-green-500"></i>
                        <span className="text-neutral-600 text-sm">Automatic data deletion</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                We're committed to transparency and are happy to answer any questions about how we handle your privacy. Your trust is our priority.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <i className="fas fa-clock text-blue-600 text-2xl mb-2"></i>
                  <h4 className="font-semibold text-neutral-800 mb-1">Quick Response</h4>
                  <p className="text-neutral-600 text-sm">Usually within 24 hours</p>
                </div>
                <div className="text-center p-4">
                  <i className="fas fa-user-shield text-blue-600 text-2xl mb-2"></i>
                  <h4 className="font-semibold text-neutral-800 mb-1">Privacy Expert</h4>
                  <p className="text-neutral-600 text-sm">Dedicated privacy team</p>
                </div>
                <div className="text-center p-4">
                  <i className="fas fa-hands-helping text-blue-600 text-2xl mb-2"></i>
                  <h4 className="font-semibold text-neutral-800 mb-1">Helpful Support</h4>
                  <p className="text-neutral-600 text-sm">Clear, honest answers</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 text-center"
                >
                  Contact Our Privacy Team
                </a>
                <a 
                  href="/help" 
                  className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  Visit Help Center
                </a>
              </div>
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">
                  <strong>Last updated:</strong> August 22, 2025 | 
                  <strong> Effective date:</strong> August 22, 2025 | 
                  <strong> Version:</strong> 2.0
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  This privacy policy complies with GDPR, CCPA, and other applicable privacy laws
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}