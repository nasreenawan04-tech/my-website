import { Link } from 'wouter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-neutral-100 py-16" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-tools text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold">DapsiWow</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Free online tools to make your life easier. No sign-up required, completely free forever.
            </p>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Popular Tools</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link href="/tools/loan-calculator" className="hover:text-white transition-colors" data-testid="link-loan-calculator">Loan Calculator</Link></li>
              <li><Link href="/pdf" className="hover:text-white transition-colors" data-testid="link-pdf-to-word">PDF to Word</Link></li>
              <li><Link href="/text" className="hover:text-white transition-colors" data-testid="link-grammar-checker">Grammar Checker</Link></li>
              <li><Link href="/health" className="hover:text-white transition-colors" data-testid="link-bmi-calculator">BMI Calculator</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Categories</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link href="/finance" className="hover:text-white transition-colors" data-testid="link-finance-tools">Finance Tools</Link></li>
              <li><Link href="/pdf" className="hover:text-white transition-colors" data-testid="link-pdf-tools">PDF Tools</Link></li>
              <li><Link href="/text" className="hover:text-white transition-colors" data-testid="link-text-tools">Text Tools</Link></li>
              <li><Link href="/health" className="hover:text-white transition-colors" data-testid="link-health-tools">Health Tools</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link href="/about" className="hover:text-white transition-colors" data-testid="link-about-us">About Us</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors" data-testid="link-help-center">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors" data-testid="link-contact-us">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors" data-testid="link-privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors" data-testid="link-terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-center md:text-left mb-4 md:mb-0">
              <p>© {currentYear} dapsiwow.com. All rights reserved. Made with ❤️ for productivity.</p>
            </div>
            <div className="text-neutral-400 text-center md:text-right">
              <p className="flex items-center justify-center md:justify-end">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Processing <span className="font-semibold mx-1" data-testid="text-daily-file-count">12,847</span> files today
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;