#!/usr/bin/env python3
"""
Complete Sitemap Generator for DapsiWow.com
Generates comprehensive sitemap.xml with all pages from the application
"""

import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Tuple

class CompleteSitemapGenerator:
    def __init__(self, base_url: str = "https://dapsiwow.com"):
        self.base_url = base_url.rstrip('/')
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        
    def get_all_pages(self) -> List[Tuple[str, str, str]]:
        """
        Returns all pages as (path, changefreq, priority)
        """
        pages = []
        
        # Homepage - highest priority
        pages.append(("/", "daily", "1.0"))
        
        # Core pages - high priority
        pages.append(("/all-tools", "weekly", "0.9"))
        pages.append(("/tools", "weekly", "0.9"))
        
        # Category pages - high priority
        pages.append(("/finance-tools", "weekly", "0.9"))
        pages.append(("/text-tools", "weekly", "0.9"))
        pages.append(("/health-tools", "weekly", "0.9"))
        
        # Static pages - medium priority
        pages.append(("/contact-us", "monthly", "0.7"))
        pages.append(("/privacy-policy", "yearly", "0.5"))
        pages.append(("/terms-of-service", "yearly", "0.5"))
        pages.append(("/help-center", "monthly", "0.7"))
        pages.append(("/about-us", "monthly", "0.7"))
        pages.append(("/recently-used-tools", "weekly", "0.6"))
        pages.append(("/favorite-tools", "weekly", "0.6"))
        
        # Authentication pages - low priority (no index)
        pages.append(("/login", "monthly", "0.4"))
        pages.append(("/signup", "monthly", "0.4"))
        pages.append(("/forgot-password", "monthly", "0.3"))
        pages.append(("/profile", "monthly", "0.4"))
        
        # Blog pages - medium priority
        pages.append(("/blog", "weekly", "0.8"))
        
        # All Finance Tools (34 tools)
        finance_tools = [
            "loan-calculator", "mortgage-calculator", "emi-calculator", 
            "business-loan-calculator", "compound-interest-calculator",
            "simple-interest-calculator", "roi-calculator", "tax-calculator",
            "salary-to-hourly-calculator", "tip-calculator", "inflation-calculator",
            "savings-goal-calculator", "debt-payoff-calculator", "net-worth-calculator",
            "stock-profit-calculator", "retirement-calculator", "sip-calculator",
            "investment-return-calculator", "break-even-calculator", "car-loan-calculator",
            "home-loan-calculator", "education-loan-calculator", "credit-card-interest-calculator",
            "lease-calculator", "percentage-calculator", "discount-calculator",
            "vat-gst-calculator", "paypal-fee-calculator", "currency-percentage-change-calculator",
            "future-value-investment-calculator", "budget-calculator", "loan-comparison-calculator",
            "dti-ratio-calculator", "personal-finance-dashboard", "debt-consolidation-calculator"
        ]
        
        for tool in finance_tools:
            pages.append((f"/tools/{tool}", "weekly", "0.8"))
        
        # All Text Tools (29 tools)
        text_tools = [
            "word-counter", "character-counter", "sentence-counter", "paragraph-counter",
            "case-converter", "password-generator", "password-strength-checker",
            "username-generator", "lorem-ipsum-generator", "duplicate-line-remover",
            "url-extractor", "text-statistics-analyzer", "text-cleaner-formatter",
            "qr-code-scanner", "base64-encoder-decoder", "hex-to-text-converter",
            "binary-to-text-converter", "text-to-binary-converter", "text-to-hex-converter",
            "text-to-decimal-converter", "decimal-to-text-converter", "text-to-qr-code",
            "markdown-to-html", "markdown-to-pdf", "fake-name-generator", "fake-address-generator",
            "font-style-changer", "reverse-text-tool", "text-diff-checker", "text-formatter-beautifier",
            "text-pattern-generator", "text-scrambler"
        ]
        
        for tool in text_tools:
            pages.append((f"/tools/{tool}", "weekly", "0.8"))
        
        # All Health Tools (36 tools)
        health_tools = [
            "bmi-calculator", "bmr-calculator", "calorie-calculator", "body-fat-calculator",
            "pregnancy-due-date-calculator", "ideal-weight-calculator", "water-intake-calculator",
            "protein-intake-calculator", "carb-calculator", "keto-macro-calculator",
            "intermittent-fasting-timer", "daily-step-calorie-converter", "heart-rate-calculator",
            "max-heart-rate-calculator", "blood-pressure-tracker", "sleep-calculator",
            "ovulation-calculator", "baby-growth-chart", "tdee-calculator",
            "lean-body-mass-calculator", "waist-to-height-ratio-calculator", "whr-calculator",
            "life-expectancy-calculator", "cholesterol-risk-calculator", "running-pace-calculator",
            "cycling-speed-calculator", "swimming-calorie-calculator", "alcohol-calorie-calculator",
            "smoking-cost-calculator", "body-water-percentage-calculator", "hydration-calculator",
            "sleep-quality-calculator", "stress-level-calculator", "body-composition-analyzer",
            "metabolic-age-calculator", "meal-calorie-tracker"
        ]
        
        for tool in health_tools:
            pages.append((f"/tools/{tool}", "weekly", "0.8"))
        
        # Unit Converter (standalone)
        pages.append(("/tools/unit-converter", "weekly", "0.8"))
        
        return pages
    
    def create_sitemap_xml(self, output_file: str = "client/public/sitemap.xml") -> None:
        """Create comprehensive sitemap.xml file"""
        urlset = ET.Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        urlset.set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        urlset.set('xsi:schemaLocation', 
                  'http://www.sitemaps.org/schemas/sitemap/0.9 ' +
                  'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
        
        pages = self.get_all_pages()
        
        for path, changefreq, priority in pages:
            url_elem = ET.SubElement(urlset, 'url')
            
            loc_elem = ET.SubElement(url_elem, 'loc')
            loc_elem.text = f"{self.base_url}{path}"
            
            lastmod_elem = ET.SubElement(url_elem, 'lastmod')
            lastmod_elem.text = self.current_date
            
            changefreq_elem = ET.SubElement(url_elem, 'changefreq')
            changefreq_elem.text = changefreq
            
            priority_elem = ET.SubElement(url_elem, 'priority')
            priority_elem.text = priority
        
        # Create ElementTree and write to file
        tree = ET.ElementTree(urlset)
        ET.indent(tree, space="  ", level=0)
        
        with open(output_file, 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)
        
        print(f"✅ Created comprehensive sitemap with {len(pages)} pages")
        print(f"📁 Location: {output_file}")
        print(f"\nBreakdown:")
        print(f"  - Core pages: 14")
        print(f"  - Finance tools: 34")
        print(f"  - Text tools: 29")
        print(f"  - Health tools: 36")
        print(f"  - Other: 1 (unit converter)")
        print(f"  - Total: {len(pages)} URLs")

def main():
    print("=" * 60)
    print("DapsiWow Complete Sitemap Generator")
    print("=" * 60)
    print()
    
    generator = CompleteSitemapGenerator()
    generator.create_sitemap_xml()
    
    print()
    print("=" * 60)
    print("Next steps:")
    print("1. The sitemap.xml has been created in client/public/")
    print("2. It will be copied to dist/ during build")
    print("3. Update robots.txt to reference the sitemap")
    print("4. Submit to Google Search Console")
    print("=" * 60)

if __name__ == "__main__":
    main()
