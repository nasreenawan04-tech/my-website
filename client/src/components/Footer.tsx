import { Link } from 'wouter';
import logoImage from '@assets/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-neutral-100 py-8 sm:py-12 md:py-16" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
          {/* Logo and Tagline */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <img 
                src={logoImage}
                alt="DapsiWow Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-sm"
              />
              <span className="text-lg sm:text-xl font-bold">DapsiWow</span>
            </div>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-sm">
              Free online tools to make your life easier. No sign-up required, completely free forever.
            </p>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Popular Tools</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-neutral-300">
              <li><Link href="/tools/loan-calculator" className="hover:text-white transition-colors inline-block py-1" data-testid="link-loan-calculator">Loan Calculator</Link></li>
              <li><Link href="/tools/word-counter" className="hover:text-white transition-colors inline-block py-1" data-testid="link-word-counter">Word Counter</Link></li>
              <li><Link href="/tools/bmi-calculator" className="hover:text-white transition-colors inline-block py-1" data-testid="link-bmi-calculator">BMI Calculator</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Categories</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-neutral-300">
              <li><Link href="/finance-tools" className="hover:text-white transition-colors inline-block py-1" data-testid="link-finance-tools">Finance Tools</Link></li>
              <li><Link href="/text-tools" className="hover:text-white transition-colors inline-block py-1" data-testid="link-text-tools">Text Tools</Link></li>
              <li><Link href="/health-tools" className="hover:text-white transition-colors inline-block py-1" data-testid="link-health-tools">Health Tools</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Company</h3>
            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-neutral-300">
              <li><Link href="/about-us" className="hover:text-white transition-colors inline-block py-1" data-testid="link-about-us">About Us</Link></li>
              <li><Link href="/help-center" className="hover:text-white transition-colors inline-block py-1" data-testid="link-help-center">Help Center</Link></li>
              <li><Link href="/contact-us" className="hover:text-white transition-colors inline-block py-1" data-testid="link-contact-us">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors inline-block py-1" data-testid="link-privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors inline-block py-1" data-testid="link-terms-of-service">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-700 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div className="text-neutral-400 text-center md:text-left text-xs sm:text-sm md:text-base">
              <p className="px-2 sm:px-0">© {currentYear} DapsiWow.com. All rights reserved. Made with ❤️ for productivity.</p>
            </div>
            <div className="text-neutral-400 text-center md:text-right text-xs sm:text-sm md:text-base">
              <p className="flex items-center justify-center md:justify-end flex-wrap gap-1 px-2 sm:px-0">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                <span className="whitespace-nowrap">Processing <span className="font-semibold mx-1" data-testid="text-daily-file-count">12,847</span> files today</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;