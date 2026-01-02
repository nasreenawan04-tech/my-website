import { Link } from 'wouter';
import logoImage from '@assets/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-neutral-100 py-16" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src={logoImage}
                alt="DapsiWow Logo"
                className="w-8 h-8 object-contain filter drop-shadow-sm"
              />
              <span className="text-xl font-bold">DapsiWow</span>
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Free online tools to make your life easier. No sign-up required, completely free forever.
            </p>
          </div>

          {/* Popular Tools */}
          <nav aria-labelledby="footer-popular-tools">
            <h3 id="footer-popular-tools" className="text-lg font-semibold mb-6">Popular Tools</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link href="/tools/loan-calculator" className="hover:text-white transition-colors" data-testid="link-loan-calculator">Loan Calculator</Link></li>
              <li><Link href="/tools/word-counter" className="hover:text-white transition-colors" data-testid="link-word-counter">Word Counter</Link></li>
              <li><Link href="/tools/bmi-calculator" className="hover:text-white transition-colors" data-testid="link-bmi-calculator">BMI Calculator</Link></li>
            </ul>
          </nav>

          {/* Categories */}
          <nav aria-labelledby="footer-categories">
            <h3 id="footer-categories" className="text-lg font-semibold mb-6">Categories</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link href="/finance-tools" className="hover:text-white transition-colors" data-testid="link-finance-tools">Finance Tools</Link></li>
              <li><Link href="/text-tools" className="hover:text-white transition-colors" data-testid="link-text-tools">Text Tools</Link></li>
              <li><Link href="/health-tools" className="hover:text-white transition-colors" data-testid="link-health-tools">Health Tools</Link></li>
            </ul>
          </nav>

          {/* Support */}
          <nav aria-labelledby="footer-company">
            <h3 id="footer-company" className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3 text-neutral-300">
              <li><Link href="/about-us" className="hover:text-white transition-colors" data-testid="link-about-us">About Us</Link></li>
              <li><Link href="/help-center" className="hover:text-white transition-colors" data-testid="link-help-center">Help Center</Link></li>
              <li><Link href="/contact-us" className="hover:text-white transition-colors" data-testid="link-contact-us">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors" data-testid="link-privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors" data-testid="link-terms-of-service">Terms of Service</Link></li>
            </ul>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-center md:text-left mb-4 md:mb-0">
              <p>© {currentYear} DapsiWow.com. All rights reserved. Made with ❤️ for productivity.</p>
            </div>
            <div className="text-neutral-300 text-center md:text-right">
              <p className="flex items-center justify-center md:justify-end">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Processing <span className="font-bold text-neutral-100 mx-1" data-testid="text-daily-file-count">12,847</span> files today
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;