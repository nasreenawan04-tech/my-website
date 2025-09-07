import { Helmet } from "react-helmet-async";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - DapsiWow Online Tools | User Agreement & Guidelines</title>
        <meta name="description" content="Comprehensive Terms of Service for DapsiWow's 150+ free online tools. Understand usage rights, responsibilities, and legal guidelines for safe, responsible tool usage." />
        <meta name="keywords" content="terms of service, user agreement, terms and conditions, usage guidelines, legal terms, online tools terms, free tools agreement, user responsibilities, service rules, acceptable use policy" />
        <meta property="og:title" content="Terms of Service - DapsiWow Online Tools | User Agreement & Guidelines" />
        <meta property="og:description" content="Complete terms and conditions for using DapsiWow's free online tools safely and responsibly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/terms" />
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
                Terms of <span className="text-blue-600">Service</span>
              </h1>
              <p className="text-xl lg:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
                Simple, fair guidelines for using DapsiWow's 150+ free online tools. 
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
                    <span className="text-neutral-600">Free access to all 150+ tools without restrictions</span>
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

        {/* Service Description */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                What DapsiWow Provides
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Understanding our service helps you make the most of our 150+ free online tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-tools text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">150+ Free Tools</h3>
                <p className="text-neutral-600 mb-4">
                  Access to a comprehensive collection of online utilities including finance calculators, PDF processors, text tools, and health calculators.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• Financial calculators and converters</li>
                  <li>• PDF processing and conversion</li>
                  <li>• Text analysis and formatting</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-shield-check text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Secure Processing</h3>
                <p className="text-neutral-600 mb-4">
                  Your files and data are processed securely, with most operations happening locally in your browser for maximum privacy.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• Local browser processing</li>
                  <li>• Encrypted data transmission</li>
                  <li>• Automatic file deletion</li>
                  <li>• No data storage</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">24/7 Availability</h3>
                <p className="text-neutral-600 mb-4">
                  Our tools are available around the clock with high uptime and reliable performance across all devices and browsers.
                </p>
                <ul className="text-sm text-neutral-500 space-y-1">
                  <li>• 99.9% uptime guarantee</li>
                  <li>• Cross-browser compatibility</li>
                  <li>• Mobile-responsive design</li>
                  <li>• Global accessibility</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Acceptable Use Policy */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Acceptable Use Policy
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Simple guidelines to ensure our platform remains safe, reliable, and beneficial for everyone.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-4"></i>
                    Encouraged Uses
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-thumbs-up text-green-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Personal Projects</h4>
                        <p className="text-neutral-600 text-sm">Use our tools for personal documents, calculations, and creative projects</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-thumbs-up text-green-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Business Operations</h4>
                        <p className="text-neutral-600 text-sm">Commercial use for legitimate business needs and professional projects</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-thumbs-up text-green-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Educational Purposes</h4>
                        <p className="text-neutral-600 text-sm">Academic research, learning projects, and educational content creation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-thumbs-up text-green-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Non-Profit Activities</h4>
                        <p className="text-neutral-600 text-sm">Charitable organizations and community service projects</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                    <i className="fas fa-times-circle text-red-600 mr-4"></i>
                    Prohibited Uses
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-ban text-red-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Illegal Activities</h4>
                        <p className="text-neutral-600 text-sm">Any use that violates local, national, or international laws</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-ban text-red-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Harmful Content</h4>
                        <p className="text-neutral-600 text-sm">Processing content that promotes hate, violence, or illegal activities</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-ban text-red-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">System Abuse</h4>
                        <p className="text-neutral-600 text-sm">Attempts to overload, hack, or exploit our systems and infrastructure</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <i className="fas fa-ban text-red-600 mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-neutral-800">Intellectual Property Violation</h4>
                        <p className="text-neutral-600 text-sm">Processing copyrighted material without proper authorization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                  <i className="fas fa-copyright text-white text-2xl"></i>
                </div>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Intellectual Property Rights</h2>
                <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                  Understanding ownership and usage rights helps protect both your work and our platform.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Your Content Remains Yours</h4>
                      <p className="text-neutral-600 text-sm">You retain all rights to content you create or process using our tools</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Our Platform Protection</h4>
                      <p className="text-neutral-600 text-sm">DapsiWow's code, design, and branding are protected by intellectual property laws</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Respect Third-Party Rights</h4>
                      <p className="text-neutral-600 text-sm">Only process content you own or have permission to use</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-800 mb-6">Usage Rights Breakdown</h3>
                <div className="space-y-6">
                  <div className="border-b border-neutral-200 pb-4">
                    <h4 className="font-semibold text-neutral-800 mb-2">Your Content</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• You own all content you upload</li>
                      <li>• We don't claim rights to your files</li>
                      <li>• You can use results commercially</li>
                      <li>• We don't store or redistribute your content</li>
                    </ul>
                  </div>
                  <div className="border-b border-neutral-200 pb-4">
                    <h4 className="font-semibold text-neutral-800 mb-2">Our Platform</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Free license to use our tools</li>
                      <li>• No downloading or copying our code</li>
                      <li>• Respect our trademarks and branding</li>
                      <li>• Don't create competing services</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Third-Party Content</h4>
                    <ul className="text-sm text-neutral-600 space-y-1">
                      <li>• Respect copyright and licensing</li>
                      <li>• Ensure you have usage rights</li>
                      <li>• Don't process pirated material</li>
                      <li>• Follow fair use guidelines</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liability and Disclaimers */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Service Disclaimers & Liability
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Important information about service reliability, accuracy, and responsibility.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-exclamation-triangle text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">Service Disclaimers</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">"As-Is" Service</h4>
                    <p className="text-neutral-600 text-sm">
                      Our tools are provided as-is without warranties. While we strive for accuracy and reliability, 
                      we cannot guarantee perfect results for every use case.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Result Accuracy</h4>
                    <p className="text-neutral-600 text-sm">
                      Tool results should be verified for important decisions. We use industry-standard algorithms 
                      but recommend professional consultation for critical calculations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Service Availability</h4>
                    <p className="text-neutral-600 text-sm">
                      While we maintain high uptime, we cannot guarantee uninterrupted service. Maintenance 
                      and updates may cause temporary unavailability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-6">Limitation of Liability</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Financial Responsibility</h4>
                    <p className="text-neutral-600 text-sm">
                      DapsiWow is not liable for decisions made based on tool results. Always verify important 
                      calculations with qualified professionals.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Data Loss Protection</h4>
                    <p className="text-neutral-600 text-sm">
                      We're not responsible for data loss. Always keep backups of important files before 
                      processing them through our tools.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-2">Third-Party Links</h4>
                    <p className="text-neutral-600 text-sm">
                      Any external links are provided for convenience. We're not responsible for third-party 
                      websites or their content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Termination and Account Actions */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
                Service Termination & Restrictions
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                When and how service access might be restricted to maintain platform integrity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-user-slash text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Violation Consequences</h3>
                <p className="text-neutral-600 mb-4">
                  Users who violate our terms may have their access restricted or terminated to protect our platform and other users.
                </p>
                <div className="text-sm text-neutral-500 space-y-1 text-left">
                  <div>• Warning for minor violations</div>
                  <div>• Temporary access suspension</div>
                  <div>• Permanent ban for serious abuse</div>
                  <div>• Legal action if necessary</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-gavel text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">Fair Process</h3>
                <p className="text-neutral-600 mb-4">
                  We follow a fair and transparent process when investigating potential violations, with opportunities for appeal.
                </p>
                <div className="text-sm text-neutral-500 space-y-1 text-left">
                  <div>• Investigation of reported issues</div>
                  <div>• Clear communication about violations</div>
                  <div>• Appeal process for disputes</div>
                  <div>• Proportional response to violations</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-undo text-white text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-4">User-Initiated Termination</h3>
                <p className="text-neutral-600 mb-4">
                  You can stop using our services at any time. Since we don't require accounts, simply stop accessing our tools.
                </p>
                <div className="text-sm text-neutral-500 space-y-1 text-left">
                  <div>• No account deletion needed</div>
                  <div>• Immediate access cessation</div>
                  <div>• No data retention after stopping</div>
                  <div>• Always welcome to return</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Updates and Changes */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-8">
                  <i className="fas fa-sync-alt text-white text-2xl"></i>
                </div>
                <h2 className="text-4xl font-bold text-neutral-800 mb-6">Terms Updates & Changes</h2>
                <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                  We may update these terms to reflect changes in our services, legal requirements, or user feedback.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-bell text-purple-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Advance Notice</h4>
                      <p className="text-neutral-600 text-sm">Significant changes will be communicated 30 days in advance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-calendar text-purple-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Clear Dating</h4>
                      <p className="text-neutral-600 text-sm">All updates include clear effective dates and version numbers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fas fa-eye text-purple-500 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-neutral-800">Continued Use</h4>
                      <p className="text-neutral-600 text-sm">Using our services after updates indicates acceptance of new terms</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-800 mb-6">Types of Updates</h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold text-neutral-800 mb-2 flex items-center">
                      <i className="fas fa-plus-circle text-green-500 mr-2"></i>
                      Service Improvements
                    </h4>
                    <p className="text-neutral-600 text-sm">
                      Adding new tools, features, or capabilities to better serve our users.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold text-neutral-800 mb-2 flex items-center">
                      <i className="fas fa-balance-scale text-blue-500 mr-2"></i>
                      Legal Compliance
                    </h4>
                    <p className="text-neutral-600 text-sm">
                      Updates to comply with new regulations, laws, or legal requirements.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h4 className="font-semibold text-neutral-800 mb-2 flex items-center">
                      <i className="fas fa-comments text-orange-500 mr-2"></i>
                      User Feedback
                    </h4>
                    <p className="text-neutral-600 text-sm">
                      Clarifications and improvements based on user questions and suggestions.
                    </p>
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
              <h2 className="text-3xl font-bold text-neutral-800 mb-6">Questions About Our Terms?</h2>
              <p className="text-lg text-neutral-600 mb-8">
                We're here to help clarify any questions you might have about using our platform and tools. 
                Our team is committed to providing clear, helpful guidance.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <i className="fas fa-question-circle text-blue-600 text-2xl mb-2"></i>
                  <h4 className="font-semibold text-neutral-800 mb-1">Terms Clarification</h4>
                  <p className="text-neutral-600 text-sm">Get clear explanations</p>
                </div>
                <div className="text-center p-4">
                  <i className="fas fa-handshake text-blue-600 text-2xl mb-2"></i>
                  <h4 className="font-semibold text-neutral-800 mb-1">Usage Guidance</h4>
                  <p className="text-neutral-600 text-sm">Learn best practices</p>
                </div>
                <div className="text-center p-4">
                  <i className="fas fa-gavel text-blue-600 text-2xl mb-2"></i>
                  <h4 className="font-semibold text-neutral-800 mb-1">Legal Support</h4>
                  <p className="text-neutral-600 text-sm">Professional assistance</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 text-center"
                >
                  Contact Legal Team
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
                  These terms are governed by applicable laws and regulations. By using our service, 
                  you agree to resolve disputes through good faith communication.
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